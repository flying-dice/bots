# Bots — one roster, configurable variants

Agent roles and shared skills for Claude Code and Codex. Choose a neutral
`vanilla` roster, `autobots`, or `decepticons`. A variant changes names and
personalities; operating instructions, model tiers and permissions come from
shared role templates.

## Install

Run from the target project:

```sh
bunx github:flying-dice/bots install --all --variant vanilla --harness all --scope project
bunx github:flying-dice/bots install --all --variant decepticons --harness all --scope project
```

The second command replaces the first roster. There is **one variant per harness
and scope**, not coexisting teams. Fresh installs default to vanilla; subsequent
installs, status and uninstall use the manifest's selected variant when omitted.
When selected harnesses disagree, specify `--variant` explicitly.

Use `bun src/bin.ts` from this checkout, or `bots` when the package is installed.
The package is `@flying-dice/bots`. Harness and scope are required for install,
uninstall and status: `--harness claude|codex|all`, `--scope user|project`.
Comma-separated harnesses and the aliases `cc` and `openai` also work.

```sh
bots variants
bots list --variant autobots
bots show starscream --variant decepticons
bots install lead developer --variant vanilla --harness all --scope project
bots status --harness all --scope project
bots uninstall --all --harness all --scope project
```

Named installs install only the requested agents. Their names can identify a
variant when unambiguous. A named install selecting a different variant removes
the previous managed roster, then installs the requested subset. Use `--all`
for a complete roster and shared skills; use `--skills` to include shared skills
with a named install. Skills-only installs do not switch the roster.
`--dry-run` previews changes without writing.

## Roster

| Role | Vanilla | Autobots | Decepticons |
| --- | --- | --- | --- |
| Lead / dispatcher | lead | silverbolt | starscream |
| Developer | developer, developer-lite | air-raid, air-raid-lite | skywarp, skywarp-lite |
| Senior developer | senior-developer, senior-developer-deep | skydive, skydive-deep | thundercracker, thundercracker-deep |
| Tester | tester, tester-deep | ratchet, ratchet-deep | shockwave, shockwave-deep |
| Architect | architect, architect-deep | prowl, prowl-deep | soundwave, soundwave-deep |
| Designer | designer, designer-deep | fireflight, fireflight-deep | thrust, thrust-deep |

Start Claude with `claude --agent lead`, `claude --agent silverbolt`, or
`claude --agent starscream`, matching the installed variant. In Codex mention
`$lead`, `$silverbolt`, or `$starscream`. The lead is installed as both a
custom agent and a dispatcher skill. Only the primary lead dispatches teammates.

Model tiers and effort are independent of variant. Codex maps Fable to Astra,
Opus to Sol, and Sonnet to Terra. Analysis-only roles remain read-only.
The themed [Autobot](autobots/README.md) and [Decepticon](decepticons/README.md)
roster pages and existing [avatars](assets/README.md) remain available.

## Add a variant

Copy `variants/vanilla.json` to `variants/<name>.json` and set `name` to match
the filename. Set the team name, optional-in-effect signoff (use an empty string
for none), and each role's `name`, `title`, `personality`, and optional `avatar`
reference. Every role must be present, with a unique lowercase kebab-case name
that does not collide with a shared skill.

Personality text can reference `{{team}}`, `{{lead.title}}`,
`{{developer.name}}`, and the equivalent `<role>.title` / `<role>.name` fields
for every role. Avatar paths are catalog metadata shown by `bots show`; the
installer does not copy avatar images into agent directories.

No TypeScript changes are needed for another universe. Configs are discovered
from `variants/`, included in the package and embedded in the standalone bundle.
Names, titles and personalities belong in configs, not copies of the workflows.

Shared operating instructions live in `roles/<role>/BOT.md`. Templates use
`{{name}}`, `{{title}}`, `{{personality}}`, `{{team}}`, `{{signoff}}`,
and role references. Model, effort and tool permissions remain in role
frontmatter. Optional `BOT.codex.md` or `BOT.claude.md` role overrides use the
same placeholders. Adding a role requires updating every variant config.

## Skills and installed paths

The shared skills are `antigravity-harness`, `claude-harness`, `clean-code-review`,
`codex-harness`, `coding-styleguide`,
`pre-commit`, `project-status`, `refactor`, `repodoc-workflow`,
`requirements-review`, `sprint-plan`, and `sprint-start`.
The sprint skills were adopted from vector-sigma and describe its GitLab
planning and supervisor workflows.

`coding-styleguide` includes Rust, TypeScript, JavaScript, Go, Lua, and Python
references for idiomatic strict typing and explicit expected-error handling.
Harness skills use common `frontier`, `standard`, and `fast` model classes;
these are routing conventions, not claims of equal capability. Antigravity
invocation guidance does not add an Antigravity installation target.

- Shipped skills: `skills/<name>/SKILL.md`.
- Project-only avatar guidance: `.agents/skills/bot-avatar/SKILL.md`; not shipped.
- Claude agents: `.claude/agents/bots/`; skills: `.claude/skills/`.
- Codex agents: `.codex/agents/`; skills and dispatcher entrypoint: `.agents/skills/`.

User scope uses these paths beneath the home directory. Project scope uses the
working project. Files are written directly, without symlinks.
Installation does not create a project STATUS.md.

## Upgrades and ownership

Each harness stores its active variant and owned paths in `bots-manifest.json`.
Switching removes only manifest-owned agents and their dispatcher entrypoints.
Shared skills remain unless explicitly updated or uninstalled. Untracked agent
name collisions fail before any selected harness is changed; unrelated files
are left alone. Reinstalling an agent removes its previous recorded paths.

Legacy manifests are read and migrated, including old Claude
`agents/autobots/` paths. Mixed or unrecognized legacy rosters require an
explicit `--variant`. Untracked leftovers are not silently deleted.
The old faction flag is removed; use `--variant` with one config name.
`install --all` also prunes manifest items no longer shipped. Uninstall with
`--all` removes managed agents in the selected roster and shared skills.

Existing app defaults, references in personal instructions, and old agent-memory
directories are not renamed. Update a configured default agent when switching.

## Development

```sh
bun test
bun run typecheck
bun run build
bun run smoke:tarball
```

Build produces `dist/bots.ts` with role templates, variants and shared skills.
The tarball smoke test checks committed HEAD, so it validates new changes only
after they are committed. CI checks types, tests, bundle execution and tarball
installation. Release remains `bun run release patch|minor|major|x.y.z`.
