import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadCatalog } from "../src/bots.ts";
import { readTree } from "../src/tree.ts";
import { HARNESSES, HARNESS_IDS } from "../src/harnesses/index.ts";
import { dispatchTargets } from "../src/harnesses/base.ts";
import { readManifest, manifestPath } from "../src/install.ts";

const root = resolve(import.meta.dir, "..");
const tree = readTree(root);
const catalog = loadCatalog(tree);
const run = (cwd: string, ...args: string[]) => Bun.spawnSync(["bun", join(root, "src/bin.ts"), ...args], { cwd });

describe("variant configs", () => {
  test("all variants share the same roles, model tiers, effort and permissions", () => {
    const vanilla = catalog.bots.filter((bot) => bot.variant === "vanilla");
    expect(vanilla).toHaveLength(11);
    expect(catalog.bots).toHaveLength(33);
    for (const bot of catalog.bots) {
      const base = vanilla.find((candidate) => candidate.role === bot.role)!;
      expect(bot.model).toBe(base.model);
      expect(bot.effort).toBe(base.effort);
      expect(bot.tools?.filter((tool) => !tool.startsWith("Agent(")))
        .toEqual(base.tools?.filter((tool) => !tool.startsWith("Agent(")));
      const peers = catalog.bots.filter((peer) => peer.variant === bot.variant);
      if (bot.role === "lead") expect(dispatchTargets(bot).sort()).toEqual(peers.filter((peer) => peer.role !== "lead").map((peer) => peer.name).sort());
      for (const h of Object.values(HARNESSES)) {
        const prompt = h.adaptPrompt(bot);
        expect(prompt).not.toContain("{{");
        if (bot.variant === "vanilla") expect(prompt).not.toMatch(/Starscream|Silverbolt|Autobot|Decepticon|Seekers|Aerialbots|Transformers|Roll out/);
      }
    }
  });

  test("a new universe needs only a config file", () => {
    const config = JSON.parse(tree["variants/vanilla.json"]);
    config.name = "space";
    config.team = "Explorers";
    for (const role of Object.keys(config.roles)) {
      config.roles[role].name = `space-${role}`;
      config.roles[role].title = `Explorer ${role}`;
    }
    const custom = loadCatalog({ ...tree, "variants/space.json": JSON.stringify(config) }).bots.filter((bot) => bot.variant === "space");
    expect(custom).toHaveLength(11);
    expect(custom.find((bot) => bot.role === "lead")!.prompt).toContain("space-developer");
    expect(custom.every((bot) => bot.leadName === "space-lead")).toBe(true);
  });

  test("rejects incomplete configs, unsafe or duplicate names and unknown placeholders", () => {
    for (const mutate of [
      (config: any) => { delete config.roles.lead; },
      (config: any) => { config.roles.lead.name = "../outside"; },
      (config: any) => { config.roles.lead.name = config.roles.developer.name; },
      (config: any) => { config.roles.lead.name = "project-status"; },
      (config: any) => { config.roles.lead.personality = "{{missing}}"; },
    ]) {
      const config = JSON.parse(tree["variants/vanilla.json"]);
      mutate(config);
      expect(() => loadCatalog({ ...tree, "variants/vanilla.json": JSON.stringify(config) })).toThrow();
    }
  });
});

describe("one installed roster", () => {
  for (const id of HARNESS_IDS) {
    test(`${id}: vanilla default, reversible switches, dry runs and unchanged custom files`, () => {
      const cwd = mkdtempSync(join(tmpdir(), "variants-"));
      const h = HARNESSES[id];
      const args = ["--all", "--harness", id, "--scope", "project"];
      expect(run(cwd, "install", ...args).exitCode).toBe(0);
      expect(readManifest(h, "project", cwd).variant).toBe("vanilla");
      expect(run(cwd, "uninstall", ...args, "--variant", "decepticons").exitCode).toBe(1);
      expect(readManifest(h, "project", cwd).variant).toBe("vanilla");
      const custom = join(h.projectRoot(cwd), "custom.txt");
      writeFileSync(custom, "keep");
      let previous = "vanilla";
      for (const variant of ["autobots", "decepticons", "vanilla"]) {
        const before = readFileSync(manifestPath(h, "project", cwd), "utf8");
        expect(run(cwd, "install", ...args, "--variant", variant, "--dry-run").exitCode).toBe(0);
        expect(readFileSync(manifestPath(h, "project", cwd), "utf8")).toBe(before);
        expect(run(cwd, "install", ...args, "--variant", variant).exitCode).toBe(0);
        const manifest = readManifest(h, "project", cwd);
        expect(manifest.variant).toBe(variant);
        expect(Object.keys(manifest.items).filter((key) => key.startsWith("bot:"))).toHaveLength(11);
        for (const bot of catalog.bots.filter((bot) => bot.variant === previous)) {
          for (const path of h.ownedPaths(bot, "project", cwd)) expect(existsSync(path)).toBe(false);
        }
        for (const bot of catalog.bots.filter((bot) => bot.variant === variant)) {
          for (const path of h.ownedPaths(bot, "project", cwd)) expect(existsSync(path)).toBe(true);
        }
        expect(readFileSync(custom, "utf8")).toBe("keep");
        expect(existsSync(join(h.skillsRoot("project", cwd), "project-status/SKILL.md"))).toBe(true);
        previous = variant;
      }
      expect(run(cwd, "status", "--harness", id, "--scope", "project").stdout.toString()).toContain("variant vanilla");
      expect(run(cwd, "uninstall", ...args).exitCode).toBe(0);
      expect(readManifest(h, "project", cwd).variant).toBeUndefined();
      expect(readFileSync(custom, "utf8")).toBe("keep");
    });
  }

  test("a collision in the second harness leaves both installed rosters untouched", () => {
    const cwd = mkdtempSync(join(tmpdir(), "variant-conflict-"));
    const args = ["--all", "--harness", "all", "--scope", "project"];
    expect(run(cwd, "install", ...args).exitCode).toBe(0);
    const custom = join(cwd, ".codex/agents/starscream.toml");
    mkdirSync(join(cwd, ".codex/agents"), { recursive: true });
    writeFileSync(custom, "user-owned");
    const result = run(cwd, "install", ...args, "--variant", "decepticons");
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("untracked agent path");
    for (const h of Object.values(HARNESSES)) expect(readManifest(h, "project", cwd).variant).toBe("vanilla");
    expect(readFileSync(custom, "utf8")).toBe("user-owned");
  });

  test("named switches preserve shared skills and skills-only installs preserve the variant", () => {
    const cwd = mkdtempSync(join(tmpdir(), "variant-subset-"));
    const args = ["--harness", "all", "--scope", "project"];
    expect(run(cwd, "install", "--all", ...args).exitCode).toBe(0);
    expect(run(cwd, "install", "starscream", ...args).exitCode).toBe(0);
    for (const h of Object.values(HARNESSES)) {
      const manifest = readManifest(h, "project", cwd);
      expect(manifest.variant).toBe("decepticons");
      expect(Object.keys(manifest.items).filter((key) => key.startsWith("bot:"))).toEqual(["bot:starscream"]);
      expect(existsSync(join(h.skillsRoot("project", cwd), "project-status/SKILL.md"))).toBe(true);
    }
    expect(run(cwd, "install", "--skills", "--variant=vanilla", ...args).exitCode).toBe(0);
    for (const h of Object.values(HARNESSES)) expect(readManifest(h, "project", cwd).variant).toBe("decepticons");
  });
});
