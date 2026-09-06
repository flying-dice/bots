import { parseFrontmatter, splitTopLevel } from "./frontmatter.ts";
import { children, type Tree } from "./tree.ts";
import type { Bot, Catalog, Doc, VariantId, HarnessId, Skill } from "./types.ts";

const HARNESS_IDS: HarnessId[] = ["claude", "codex"];

/** Parse a tree (from disk or embedded in a bundle) into the team and shared skills. */
export function loadCatalog(tree: Tree): Catalog {
  return { bots: loadBots(tree), skills: loadSkills(children(tree, "skills")) };
}

export function loadBots(tree: Tree): Bot[] {
  if (children(tree, "roles").size) return loadVariantBots(tree);
  const bots: Bot[] = [];
  for (const [folder, variant] of [["autobots", "autobots"], ["decepticons", "decepticons"]] as const) {
    for (const [name, files] of children(tree, folder)) {
      if (name.startsWith("_") || name.startsWith(".")) continue;
      const bot = loadBot(name, files, variant);
      if (bot) bots.push(bot);
    }
  }
  return bots.sort((a, b) => a.name.localeCompare(b.name));
}

interface VariantRole {
  name: string;
  title: string;
  personality: string;
  avatar?: string;
}

interface Variant {
  name: string;
  team: string;
  signoff: string;
  roles: Record<string, VariantRole>;
}

/** Expand explicit placeholders only; variant files never execute code. */
function renderTemplate(source: string, values: Record<string, string>): string {
  return source.replace(/\{\{([^{}]+)\}\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown template field: ${key}`);
    return values[key];
  });
}

function loadVariantBots(tree: Tree): Bot[] {
  const templates = [...children(tree, "roles")].filter(([name, files]) => !name.startsWith("_") && files["BOT.md"]);
  const roleIds = templates.map(([name]) => name).sort();
  if (!roleIds.includes("lead")) throw new Error("Role templates must include lead");
  const sharedNames = new Set(loadSkills(children(tree, "skills")).map((s) => s.name));
  const bots: Bot[] = [];
  for (const [path, source] of Object.entries(tree)) {
    if (!/^variants\/[a-z0-9][a-z0-9-]*\.json$/.test(path)) continue;
    const variant = JSON.parse(source) as Variant;
    if (variant.name !== path.slice(9, -5) || typeof variant.team !== "string" || /[\r\n]/.test(variant.team)
      || typeof variant.signoff !== "string" || !variant.roles
      || JSON.stringify(Object.keys(variant.roles).sort()) !== JSON.stringify(roleIds)) {
      throw new Error(`Invalid variant configuration: ${path}; provide team, signoff and every role exactly once`);
    }
    const names = new Set<string>();
    const values: Record<string, string> = { team: variant.team, signoff: variant.signoff };
    for (const [role, persona] of Object.entries(variant.roles)) {
      if (!persona || typeof persona.name !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(persona.name)
        || names.has(persona.name) || sharedNames.has(persona.name) || typeof persona.title !== "string"
        || /[\r\n]/.test(persona.title) || typeof persona.personality !== "string"
        || (persona.avatar !== undefined && typeof persona.avatar !== "string")) {
        throw new Error(`Invalid or colliding persona for ${variant.name}/${role}`);
      }
      names.add(persona.name);
      values[`${role}.name`] = persona.name;
      values[`${role}.title`] = persona.title;
    }
    for (const [role, files] of templates) {
      const persona = variant.roles[role];
      const context = { ...values, name: persona.name, title: persona.title,
        personality: renderTemplate(persona.personality, values) };
      const rendered = Object.fromEntries(Object.entries(files).map(([name, text]) => [name, renderTemplate(text, context)]));
      const bot = loadBot(persona.name, rendered, variant.name)!;
      bots.push({ ...bot, role, leadName: variant.roles.lead.name, avatar: persona.avatar });
    }
  }
  if (!bots.length) throw new Error("No variant configs found in variants/");
  return bots.sort((a, b) => a.variant.localeCompare(b.variant) || a.name.localeCompare(b.name));
}

function loadBot(dirName: string, files: Tree, variant: VariantId): Bot | null {
  const source = files["BOT.md"] ?? files["AUTOBOT.md"];
  if (source === undefined) return null;
  const { data, body, raw } = parseFrontmatter(source);
  const tools = Array.isArray(data.tools)
    ? (data.tools as string[])
    : typeof data.tools === "string"
      ? splitTopLevel(data.tools)
      : undefined;
  return {
    variant,
    name: String(data.name ?? dirName),
    description: String(data.description ?? ""),
    model: data.model ? String(data.model) : undefined,
    tools,
    color: data.color ? String(data.color) : undefined,
    effort: data.effort ? String(data.effort) : undefined,
    frontmatter: data,
    rawFrontmatter: raw,
    prompt: body.trim(),
    skills: loadSkills(children(files, "skills")),
    overrides: loadOverrides(files),
  };
}

/** BOT.<harness>.md replaces the generated prompt for that harness entirely. */
function loadOverrides(files: Tree): Partial<Record<HarnessId, Doc>> {
  const out: Partial<Record<HarnessId, Doc>> = {};
  for (const id of HARNESS_IDS) {
    const source = files[`BOT.${id}.md`] ?? files[`AUTOBOT.${id}.md`];
    if (source !== undefined) out[id] = parseFrontmatter(source);
  }
  return out;
}

export function loadSkills(dirs: Map<string, Tree>): Skill[] {
  const skills: Skill[] = [];
  for (const [name, files] of dirs) {
    if (name.startsWith("_") || files["SKILL.md"] === undefined) continue;
    const { data } = parseFrontmatter(files["SKILL.md"]);
    skills.push({ name, description: String(data.description ?? "").replace(/\s+/g, " "), files });
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function findBots(all: Bot[], names: string[]): Bot[] {
  const missing = names.filter((n) => !all.some((b) => b.name === n));
  if (missing.length) {
    throw new Error(`Unknown bot(s): ${missing.join(", ")}. Run \`bots list\`.`);
  }
  return all.filter((b) => names.includes(b.name));
}
