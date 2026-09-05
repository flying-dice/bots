import { describe, expect, test } from "bun:test";
import { mkdtempSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { parseFrontmatter, stringifyFrontmatter } from "../src/frontmatter.ts";
import { loadBots, loadCatalog } from "../src/bots.ts";
import { readTree, children, type Tree } from "../src/tree.ts";
import { HARNESSES, HARNESS_IDS, resolveHarnesses } from "../src/harnesses/index.ts";
import { install, uninstall, status, botItem, skillItem, readManifest, manifestPath } from "../src/install.ts";

const REPO = resolve(import.meta.dir, "..");
const catalog = loadCatalog(readTree(REPO));

function fixtureTree(): Tree {
  return {
    "decepticons/starscream/BOT.md": `---\nname: starscream\ndescription: Leads the team\nmodel: opus\ntools: [Read, Bash]\n---\n\nYou are Starscream.\n`,
    "decepticons/starscream/skills/roll-out/SKILL.md": "---\nname: roll-out\ndescription: Go\n---\nGo.\n",
    "decepticons/starscream/skills/roll-out/ref/notes.md": "extra file",
    "decepticons/_ignored/BOT.md": "---\nname: nope\n---\n",
    "skills/shared-one/SKILL.md": "---\nname: shared-one\ndescription: Shared\n---\nShared.\n",
  };
}

describe("frontmatter", () => {
  test("parses scalars and lists", () => {
    const { data, body } = parseFrontmatter("---\na: 1\nb: [x, y]\nc:\n  - p\n  - q\n---\nbody\n");
    expect(data).toEqual({ a: "1", b: ["x", "y"], c: ["p", "q"] });
    expect(body).toBe("body\n");
  });
  test("round-trips", () => {
    const out = stringifyFrontmatter({ name: "x", description: "a: b", tools: ["R"] }, "hi");
    expect(parseFrontmatter(out).data).toEqual({ name: "x", description: "a: b", tools: ["R"] });
  });
});

describe("tree", () => {
  test("readTree matches the on-disk files and children() groups them", () => {
    const tree = readTree(REPO);
    expect(tree["decepticons/starscream/BOT.md"]).toBe(readFileSync(join(REPO, "decepticons/starscream/BOT.md"), "utf8"));
    expect([...children(tree, "skills").keys()].sort()).toEqual(catalog.skills.map((s) => s.name));
  });
});

describe("loadCatalog", () => {
  test("loads bots, nested skill files and shared skills, skips underscore dirs", () => {
    const c = loadCatalog(fixtureTree());
    expect(c.bots.map((b) => b.name)).toEqual(["starscream"]);
    expect(c.bots[0].tools).toEqual(["Read", "Bash"]);
    expect(c.bots[0].skills[0].files).toEqual({ "SKILL.md": expect.any(String), "ref/notes.md": "extra file" });
    expect(c.bots[0].prompt).toBe("You are Starscream.");
    expect(c.skills.map((s) => s.name)).toEqual(["shared-one"]);
  });
});

describe("harnesses", () => {
  test("resolve aliases", () => {
    expect(resolveHarnesses("cc,openai").map((h) => h.id)).toEqual(["claude", "codex"]);
    expect(resolveHarnesses(undefined).map((h) => h.id)).toEqual(HARNESS_IDS);
    expect(() => resolveHarnesses("cursor")).toThrow();
  });

  const opts = (cwd: string, dryRun = false) => ({ scope: "project" as const, cwd, dryRun, version: "9.9.9" });

  for (const id of HARNESS_IDS) {
    test(`${id}: install, status, uninstall (project scope)`, () => {
      const [bot] = loadBots(fixtureTree());
      const item = botItem(bot);
      const cwd = mkdtempSync(join(tmpdir(), "proj-"));
      const h = HARNESSES[id];
      expect(status(item, h, "project", cwd)).toBe("missing");
      expect(install([item], h, opts(cwd)).get(item.key)!.length).toBe(2);
      for (const p of h.ownedPaths(bot, "project", cwd)) expect(existsSync(p)).toBe(true);
      expect(existsSync(join(h.skillsRoot("project", cwd), "roll-out", "ref", "notes.md"))).toBe(true);
      expect(status(item, h, "project", cwd)).toBe("installed");
      const main = readFileSync(h.plan(bot, "project", cwd).files[0].path, "utf8");
      expect(main).toContain("You are Starscream.");
      expect(main).toContain("Leads the team");
      expect(install([item], h, opts(cwd)).get(item.key)![0].kind).toBe("unchanged");
      const m = readManifest(h, "project", cwd);
      expect(m.version).toBe("9.9.9");
      expect(m.items[item.key]).toEqual(h.ownedPaths(bot, "project", cwd));
      uninstall([item], h, opts(cwd));
      expect(status(item, h, "project", cwd)).toBe("missing");
      expect(readManifest(h, "project", cwd).items).toEqual({});
    });

    test(`${id}: shared skill install/uninstall`, () => {
      const cwd = mkdtempSync(join(tmpdir(), "proj-"));
      const h = HARNESSES[id];
      const item = skillItem(catalog.skills[0]);
      install([item], h, opts(cwd));
      expect(status(item, h, "project", cwd)).toBe("installed");
      expect(existsSync(join(h.skillsRoot("project", cwd), catalog.skills[0].name, "SKILL.md"))).toBe(true);
      uninstall([item], h, opts(cwd));
      expect(status(item, h, "project", cwd)).toBe("missing");
    });
  }

  test("dry run touches nothing, not even the manifest", () => {
    const [bot] = loadBots(fixtureTree());
    const cwd = mkdtempSync(join(tmpdir(), "proj-"));
    install([botItem(bot)], HARNESSES.claude, opts(cwd, true));
    expect(status(botItem(bot), HARNESSES.claude, "project", cwd)).toBe("missing");
    expect(existsSync(manifestPath(HARNESSES.claude, "project", cwd))).toBe(false);
  });

  test("upgrading removes what the new version no longer writes", () => {
    const h = HARNESSES.claude;
    const cwd = mkdtempSync(join(tmpdir(), "proj-"));
    const v1 = loadCatalog(fixtureTree());
    install([...v1.skills.map(skillItem), ...v1.bots.map(botItem)], h, { ...opts(cwd), version: "1.0.0" }, true);
    const sharedOne = join(h.skillsRoot("project", cwd), "shared-one");
    const rollOut = join(h.skillsRoot("project", cwd), "roll-out");
    expect(existsSync(sharedOne)).toBe(true);
    expect(existsSync(rollOut)).toBe(true);

    // v2: the shared skill is gone, the bot's skill was renamed, a new bot appeared.
    const tree = fixtureTree();
    delete tree["skills/shared-one/SKILL.md"];
    delete tree["decepticons/starscream/skills/roll-out/SKILL.md"];
    delete tree["decepticons/starscream/skills/roll-out/ref/notes.md"];
    tree["decepticons/starscream/skills/transform/SKILL.md"] = "---\nname: transform\n---\nGo.\n";
    tree["decepticons/skywarp/BOT.md"] = "---\nname: skywarp\ndescription: Dev\n---\n\nBee.\n";
    const v2 = loadCatalog(tree);
    const results = install([...v2.skills.map(skillItem), ...v2.bots.map(botItem)], h, { ...opts(cwd), version: "2.0.0" }, true);

    expect(existsSync(sharedOne)).toBe(false);
    expect(existsSync(rollOut)).toBe(false);
    expect(existsSync(join(h.skillsRoot("project", cwd), "transform", "SKILL.md"))).toBe(true);
    expect(existsSync(join(cwd, ".claude/agents/bots/skywarp.md"))).toBe(true);
    expect(results.get("skill:shared-one")!.map((a) => a.kind)).toEqual(["prune"]);
    expect(results.get("bot:starscream")!.map((a) => a.kind)).toEqual(["prune", "unchanged", "copy"]);
    const m = readManifest(h, "project", cwd);
    expect(m.version).toBe("2.0.0");
    expect(Object.keys(m.items).sort()).toEqual(["bot:skywarp", "bot:starscream"]);

    // Installing one bot by name never prunes the others.
    install([botItem(v2.bots[0])], h, { ...opts(cwd), version: "2.0.1" });
    expect(Object.keys(readManifest(h, "project", cwd).items).sort()).toEqual(["bot:skywarp", "bot:starscream"]);
  });
});

describe("real bots and skills", () => {
  const bots = catalog.bots.filter((b) => b.faction === "decepticons");
  test("all eleven load with Claude-specific frontmatter intact", () => {
    expect(bots.map((b) => b.name)).toEqual([
      "shockwave", "shockwave-deep", "skywarp", "skywarp-lite", "soundwave", "soundwave-deep",
      "starscream", "thrust", "thrust-deep", "thundercracker", "thundercracker-deep",
    ]);
    const starscream = bots.find((b) => b.name === "starscream")!;
    expect(starscream.tools?.[0]).toStartWith("Agent(skywarp,");
    expect(starscream.tools).toContain("AskUserQuestion");
    expect(starscream.effort).toBe("low");
    expect(starscream.frontmatter.memory).toBe("project");
    expect(bots.find((b) => b.name === "soundwave")!.frontmatter.disallowedTools).toBe("Agent, SendMessage");
  });
  test("all six shared skills load", () => {
    expect(catalog.skills.map((s) => s.name)).toEqual([
      "bot-avatar", "clean-code-review", "ddd-hexagonal", "pre-commit", "refactor", "repodoc-workflow",
    ]);
  });
  test("claude adapter reproduces BOT.md verbatim", () => {
    for (const b of bots) {
      const out = HARNESSES.claude.plan(b, "project", "/x").files[0].content;
      expect(out).toBe(readFileSync(join(REPO, "decepticons", b.name, "BOT.md"), "utf8"));
    }
  });
  test("codex adapter prescribes a Codex model per tier and passes effort through", () => {
    const { CODEX_MODELS } = require("../src/harnesses/codex.ts");
    expect(CODEX_MODELS).toEqual({ fable: "gpt-6-astra", opus: "gpt-5.6-sol", sonnet: "gpt-5.6-terra" });
    for (const b of bots) {
      const toml = HARNESSES.codex.plan(b, "project", "/x").files[0].content;
      expect(toml).toContain(`model = "${CODEX_MODELS[b.model!]}"`);
      expect(toml).toContain(`model_reasoning_effort = "${b.effort}"`);
      expect(toml).toContain(`yours is ${CODEX_MODELS[b.model!]} at ${b.effort} effort`);
    }
    const soundwave = HARNESSES.codex.plan(bots.find((b) => b.name === "soundwave")!, "project", "/x").files[0].content;
    expect(soundwave).toContain('model = "gpt-6-astra"');
    expect(soundwave).toContain('sandbox_mode = "read-only"');
    expect(HARNESSES.codex.plan(bots.find((b) => b.name === "skywarp")!, "project", "/x").files[0].content).toContain('sandbox_mode = "workspace-write"');
  });
  test("codex installs the dispatcher as a skill too, so $starscream takes over the primary session", () => {
    const starscream = bots.find((b) => b.name === "starscream")!;
    const plan = HARNESSES.codex.plan(starscream, "project", "/x");
    expect(plan.dirs.map((d) => d.path)).toContain("/x/.agents/skills/starscream");
    const skill = plan.dirs.at(-1)!.files[0].content;
    expect(skill).toContain("name: starscream");
    expect(skill).not.toContain("claude --agent");
    expect(HARNESSES.codex.ownedPaths(starscream, "project", "/x")).toContain("/x/.agents/skills/starscream");
    expect(HARNESSES.codex.plan(bots.find((b) => b.name === "skywarp")!, "project", "/x").dirs).toHaveLength(0);
  });
});

describe("prompt adaptation", () => {
  const starscream = catalog.bots.find((b) => b.name === "starscream")!;
  const skywarp = catalog.bots.find((b) => b.name === "skywarp")!;

  test("claude takes the prompt verbatim", () => {
    expect(HARNESSES.claude.adaptPrompt(starscream)).toBe(starscream.prompt);
  });

  for (const id of HARNESS_IDS.filter((h) => h !== "claude")) {
    test(`${id}: dispatcher and teammate get harness notes, no Claude launch command`, () => {
      const h = HARNESSES[id];
      const lead = h.adaptPrompt(starscream);
      expect(lead).toContain(`## Operating in ${h.label}`);
      expect(lead).toContain("skywarp, skywarp-lite, thundercracker");
      expect(lead).not.toContain("claude --agent");
      expect(lead).not.toContain("AskUserQuestion");
      const dev = h.adaptPrompt(skywarp);
      expect(dev).toContain(`## Operating in ${h.label}`);
      expect(dev).not.toContain("spawn_agent tool, naming");
      expect(h.plan(starscream, "project", "/x").files[0].content).not.toContain("claude --agent");
    });
  }

  test("BOT.<harness>.md overrides the generated prompt", () => {
    const tree = fixtureTree();
    tree["decepticons/starscream/BOT.codex.md"] = "---\ndescription: Codex flavour\n---\n\nHand-written for Codex.\n";
    const [bot] = loadBots(tree);
    expect(HARNESSES.codex.adaptPrompt(bot)).toBe("Hand-written for Codex.");
    expect(HARNESSES.codex.plan(bot, "project", "/x").files[0].content).toContain("Codex flavour");
    const [plain] = loadBots(fixtureTree());
    expect(HARNESSES.codex.adaptPrompt(plain)).toContain("## Operating in Codex");
  });
});

describe("cli flags", () => {
  const bin = join(REPO, "src", "bin.ts");
  const run = (...args: string[]) => Bun.spawnSync(["bun", bin, ...args], { cwd: mkdtempSync(join(tmpdir(), "flags-")) });
  test("install, uninstall and status refuse to assume a harness or scope", () => {
    for (const cmd of ["install", "uninstall", "status"]) {
      const noHarness = run(cmd, "--all", "--scope", "user", "--dry-run");
      expect(noHarness.exitCode).toBe(1);
      expect(noHarness.stderr.toString()).toContain("--harness is required");
      const noScope = run(cmd, "--all", "--harness", "claude", "--dry-run");
      expect(noScope.exitCode).toBe(1);
      expect(noScope.stderr.toString()).toContain("--scope is required");
    }
    expect(run("status", "--harness", "claude", "--scope", "home").stderr.toString()).toContain("Unknown scope");
    expect(run("status", "--harness", "claude", "--scope", "project").exitCode).toBe(0);
    expect(run("install", "--all", "--harness", "all", "--scope", "project", "--dry-run").exitCode).toBe(0);
  });
});

describe("bundle", () => {
  test("builds and runs over stdin with embedded content", () => {
    const build = Bun.spawnSync(["bun", "scripts/build.ts"], { cwd: REPO });
    expect(build.exitCode).toBe(0);
    const bundle = readFileSync(join(REPO, "dist", "bots.ts"));
    const cwd = mkdtempSync(join(tmpdir(), "bundle-"));
    const run = Bun.spawnSync(["bun", "run", "-", "install", "--all", "--scope", "project", "--harness", "claude"], { cwd, stdin: bundle });
    expect(run.exitCode).toBe(0);
    expect(readFileSync(join(cwd, ".claude/agents/bots/starscream.md"), "utf8")).toBe(
      readFileSync(join(REPO, "decepticons/starscream/BOT.md"), "utf8"),
    );
    expect(existsSync(join(cwd, ".claude/skills/pre-commit/SKILL.md"))).toBe(true);
    const ver = Bun.spawnSync(["bun", "run", "-", "--version"], { cwd, stdin: bundle });
    expect(ver.stdout.toString()).toMatch(/^bots \d+\.\d+\.\d+/);
  });
});

describe("factions", () => {
  test("loads the Aerialbots and shared specialists with valid dispatch targets", () => {
    const originals = catalog.bots.filter((b) => b.faction === "autobots");
    expect(originals).toHaveLength(11);
    expect(originals.map((b) => b.name)).toEqual(["air-raid", "air-raid-lite", "fireflight", "fireflight-deep", "prowl", "prowl-deep", "ratchet", "ratchet-deep", "silverbolt", "skydive", "skydive-deep"]);
    for (const bot of originals) {
      expect(HARNESSES.claude.plan(bot, "project", "/x").files[0].content)
        .toBe(readFileSync(join(REPO, "autobots", bot.name, "AUTOBOT.md"), "utf8"));
    }
    for (const name of ["silverbolt", "starscream"]) {
      const lead = catalog.bots.find((b) => b.name === name)!;
      const targets = lead.tools![0].slice(6, -1).split(",").map((s) => s.trim());
      for (const target of targets) {
        expect(catalog.bots.some((b) => b.name === target && b.faction === lead.faction)).toBe(true);
      }
      const prompt = HARNESSES.codex.adaptPrompt(lead);
      expect(prompt).toContain(`Spawn the ${targets[0]} agent`);
    }
  });

  for (const harness of HARNESS_IDS) {
    test(`${harness}: choosing one faction preserves the other installed faction`, () => {
      const cwd = mkdtempSync(join(tmpdir(), "factions-"));
      const run = (...args: string[]) => Bun.spawnSync(["bun", join(REPO, "src/bin.ts"), ...args], { cwd });
      for (const faction of ["autobots", "decepticons"]) {
        expect(run("install", "--all", "--faction", faction, "--harness", harness, "--scope", "project").exitCode).toBe(0);
      }
      const h = HARNESSES[harness];
      const optimus = botItem(catalog.bots.find((b) => b.name === "silverbolt")!);
      const starscream = botItem(catalog.bots.find((b) => b.name === "starscream")!);
      expect(status(optimus, h, "project", cwd)).toBe("installed");
      expect(status(starscream, h, "project", cwd)).toBe("installed");
      expect(Object.keys(readManifest(h, "project", cwd).items).filter((k) => k.startsWith("bot:"))).toHaveLength(22);
      expect(run("uninstall", "--all", "--faction", "decepticons", "--harness", harness, "--scope", "project").exitCode).toBe(0);
      expect(status(optimus, h, "project", cwd)).toBe("installed");
      expect(status(starscream, h, "project", cwd)).toBe("missing");
      expect(run("list", "--faction", "decepticons").stdout.toString()).not.toContain("silverbolt");
      expect(run("list", "--faction", "invalid").exitCode).toBe(1);
      expect(run("list", "--faction").exitCode).toBe(1);
      expect(run("install", "silverbolt", "--faction", "decepticons", "--harness", harness, "--scope", "project").exitCode).toBe(1);
    });
  }
});

describe("Aerialbot upgrade", () => {
  for (const harness of HARNESS_IDS) {
    test(`${harness}: retires the old team while preserving Decepticons and dry-run state`, () => {
      const cwd = mkdtempSync(join(tmpdir(), "aerialbots-upgrade-"));
      const h = HARNESSES[harness];
      const legacy = loadCatalog({
        "autobots/optimus-prime/AUTOBOT.md": "---\nname: optimus-prime\ndescription: Previous lead\nmodel: fable\ntools: Agent(arcee), Read, Write\n---\nPrevious dispatcher.\n",
        "autobots/arcee/AUTOBOT.md": "---\nname: arcee\ndescription: Previous UI specialist\nmodel: opus\ntools: Read, Write\n---\nPrevious designer.\n",
      });
      const starscream = catalog.bots.find((b) => b.name === "starscream")!;
      install([...legacy.bots, starscream].map(botItem), h, { scope: "project", cwd, dryRun: false, version: "0.1.0" });
      const manifestBefore = readFileSync(manifestPath(h, "project", cwd), "utf8");
      const args = ["bun", join(REPO, "src/bin.ts"), "install", "--all", "--faction", "autobots", "--harness", harness, "--scope", "project"];
      expect(Bun.spawnSync([...args, "--dry-run"], { cwd }).exitCode).toBe(0);
      expect(readFileSync(manifestPath(h, "project", cwd), "utf8")).toBe(manifestBefore);
      expect(Bun.spawnSync(args, { cwd }).exitCode).toBe(0);
      for (const bot of legacy.bots) expect(status(botItem(bot), h, "project", cwd)).toBe("missing");
      expect(status(botItem(starscream), h, "project", cwd)).toBe("installed");
      expect(status(botItem(catalog.bots.find((b) => b.name === "silverbolt")!), h, "project", cwd)).toBe("installed");
    });
  }
});
