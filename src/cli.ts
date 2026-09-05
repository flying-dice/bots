import { existsSync } from "node:fs";
import { findBots, RETIRED_AUTOBOTS } from "./bots.ts";
import { HARNESSES, HARNESS_IDS, resolveHarnesses } from "./harnesses/index.ts";
import { install, uninstall, status, botItem, skillItem, readManifest, manifestPath, type Item } from "./install.ts";
import type { Bot, Catalog, Scope } from "./types.ts";

export const RELEASE_URL = "https://github.com/flying-dice/autobots/releases/latest/download/bots.ts";

const HELP = `bots — manage the Bots agent team across coding harnesses

Usage:
  bots list                         Show bots from either faction
  bots skills                       Show the shared skills in this repo
  bots harnesses                    Show supported harnesses and where they are detected
  bots install <bot...> [options]   Install Bots into a harness
  bots install --all [options]      Install the selected faction and shared skills
  bots uninstall <bot...> [options] Remove Bots from a harness
  bots status [options]             Show what is installed where, and the manifest's recorded version
  bots doctor                       Detect which harnesses are present on this machine
  bots show <bot>                   Print an Bot definition

Required for install, uninstall and status (nothing is assumed):
  -H, --harness <ids>   Comma-separated: ${HARNESS_IDS.join(", ")}, or all
  -S, --scope <scope>   user (home directory config) or project (current directory)

Other options:
  --faction <side>     autobots, decepticons, or all (default); filters bots
  -n, --dry-run         Print what would change without touching disk
  -s, --skills          Also include the shared skills (implied by --all)
  -h, --help            Show this help
  -v, --version         Print the version

Run without cloning:
  bunx github:flying-dice/autobots install --all --harness claude --scope user
  curl -fsSL ${RELEASE_URL} | bun run - install --all --harness codex --scope project
`;



interface Args {
  cmd: string | undefined;
  positional: string[];
  harness?: string;
  faction?: string;
  scope?: string;
  all: boolean;
  skills: boolean;
  dryRun: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { cmd: undefined, positional: [], all: false, skills: false, dryRun: false, help: false, version: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "-h" || t === "--help") a.help = true;
    else if (t === "-v" || t === "--version") a.version = true;
    else if (t === "--faction") a.faction = argv[++i] ?? "";
    else if (t.startsWith("--faction=")) a.faction = t.slice("--faction=".length);
    else if (t === "-S" || t === "--scope") a.scope = argv[++i];
    else if (t.startsWith("--scope=")) a.scope = t.slice("--scope=".length);
    else if (t === "-n" || t === "--dry-run") a.dryRun = true;
    else if (t === "--all" || t === "-a") a.all = true;
    else if (t === "--skills" || t === "-s") a.skills = true;
    else if (t === "-H" || t === "--harness") a.harness = argv[++i];
    else if (t.startsWith("--harness=")) a.harness = t.slice("--harness=".length);
    else if (t.startsWith("-")) throw new Error(`Unknown option ${t}`);
    else if (!a.cmd) a.cmd = t;
    else a.positional.push(t);
  }
  return a;
}

/** Harness and scope are never assumed: both flags are mandatory for anything that touches disk. */
function requireTarget(args: Args): { harnesses: ReturnType<typeof resolveHarnesses>; scope: Scope } {
  if (!args.harness) throw new Error(`--harness is required: one of ${HARNESS_IDS.join(", ")}, or all.`);
  if (!args.scope) throw new Error("--scope is required: user or project.");
  if (args.scope !== "user" && args.scope !== "project") {
    throw new Error(`Unknown scope "${args.scope}". Use user or project.`);
  }
  return { harnesses: resolveHarnesses(args.harness), scope: args.scope };
}

function pickBots(args: Args, all: Bot[]): Bot[] {
  if (args.all) return all;
  if (args.positional.length === 0) {
    if (args.skills) return [];
    throw new Error("Name at least one Bot, or pass --all.");
  }
  return findBots(all, args.positional);
}

export interface Runtime {
  catalog: Catalog;
  version: string;
}

/** Run the CLI against a catalog. Entry points decide where the catalog comes from. */
export function main(argv: string[], rt: Runtime) {
  const args = parseArgs(argv);
  const cwd = process.cwd();
  if (args.faction !== undefined && !["autobots", "decepticons", "all"].includes(args.faction)) {
    throw new Error("Unknown faction. Use autobots, decepticons, or all.");
  }
  const bots = rt.catalog.bots.filter((b) => !args.faction || args.faction === "all" || b.faction === args.faction);
  const sharedSkills = rt.catalog.skills;

  if (args.version || args.cmd === "version") {
    console.log(`bots ${rt.version}`);
    return;
  }
  if (args.help || !args.cmd) {
    console.log(HELP);
    return;
  }

  switch (args.cmd) {
    case "list": {
      if (bots.length === 0) {
        console.log("No Bots found in bots/. Add a directory with an BOT.md to get started.");
        return;
      }
      const w = Math.max(...bots.map((b) => b.name.length));
      for (const b of bots) {
        const skills = b.skills.length ? `  [${b.skills.length} skill${b.skills.length === 1 ? "" : "s"}]` : "";
        console.log(`${b.name.padEnd(w)}  [${b.faction}] ${b.description}${skills}`);
      }
      return;
    }
    case "skills": {
      if (sharedSkills.length === 0) {
        console.log("No shared skills found in skills/.");
        return;
      }
      const w = Math.max(...sharedSkills.map((s) => s.name.length));
      for (const s of sharedSkills) console.log(`${s.name.padEnd(w)}  ${s.description.slice(0, 110)}`);
      return;
    }
    case "harnesses": {
      for (const id of HARNESS_IDS) {
        const h = HARNESSES[id];
        console.log(`${id.padEnd(12)} ${h.label.padEnd(12)} user: ${h.userRoot()}   project: ${h.projectRoot(".")}`);
      }
      return;
    }
    case "doctor": {
      for (const id of HARNESS_IDS) {
        const h = HARNESSES[id];
        const ok = existsSync(h.userRoot());
        console.log(`${ok ? "✔" : "✘"} ${h.label.padEnd(12)} ${h.userRoot()}${ok ? "" : "  (not found)"}`);
      }
      return;
    }
    case "show": {
      const [b] = findBots(bots, [args.positional[0] ?? ""]);
      console.log(`# ${b.name}\n${b.description}\n`);
      if (b.model) console.log(`model: ${b.model}`);
      if (b.tools) console.log(`tools: ${b.tools.join(", ")}`);
      if (b.skills.length) console.log(`skills: ${b.skills.map((s) => s.name).join(", ")}`);
      console.log(`\n${b.prompt}`);
      return;
    }
    case "install":
    case "uninstall": {
      const { harnesses: targets, scope } = requireTarget(args);
      const chosen = pickBots(args, bots);
      const skills = args.all || args.skills ? sharedSkills : [];
      const items: Item[] = [...skills.map(skillItem), ...chosen.map(botItem)];
      const opts = { scope, cwd, dryRun: args.dryRun, version: rt.version };
      const installing = args.cmd === "install";
      const prune = args.all && (!args.faction || args.faction === "all")
        ? true
        : args.all && args.faction === "autobots"
          ? (key: string) => RETIRED_AUTOBOTS.some((name) => key === `bot:${name}`)
          : false;
      for (const h of targets) {
        console.log(`\n${h.label} (${scope})`);
        const results = installing ? install(items, h, opts, prune) : uninstall(items, h, opts);
        for (const [key, actions] of results) {
          if (actions.length === 0) {
            console.log(`  ${key}: nothing to do`);
            continue;
          }
          for (const a of actions) {
            console.log(`  ${args.dryRun ? "would " : ""}${a.kind.padEnd(9)} ${key.padEnd(24)} ${a.path}`);
          }
        }
        if (!args.dryRun) console.log(`  manifest  ${manifestPath(h, scope, cwd)}`);
      }
      return;
    }
    case "status": {
      const { harnesses: targets, scope } = requireTarget(args);
      console.log(`scope: ${scope}${scope === "project" ? ` (${cwd})` : ""}   cli: ${rt.version}`);
      for (const h of targets) {
        const m = readManifest(h, scope, cwd);
        console.log(`${h.id}: ${m.version ? `installed by ${m.version} at ${m.updatedAt}` : "no manifest"}`);
      }
      console.log();
      const items: Item[] = [...bots.map(botItem), ...sharedSkills.map(skillItem)];
      const w = Math.max(4, ...items.map((i) => i.key.length));
      console.log(`${"item".padEnd(w)}  ${targets.map((h) => h.id.padEnd(11)).join(" ")}`);
      for (const it of items) {
        const cells = targets.map((h) => status(it, h, scope, cwd).padEnd(11));
        console.log(`${it.key.padEnd(w)}  ${cells.join(" ")}`);
      }
      return;
    }
    default:
      throw new Error(`Unknown command "${args.cmd}". Run \`bots --help\`.`);
  }
}

/** Run `main`, turning thrown errors into a one-line message and exit code 1. */
export function run(argv: string[], rt: Runtime) {
  try {
    main(argv, rt);
  } catch (err) {
    console.error(`error: ${(err as Error).message}`);
    process.exit(1);
  }
}
