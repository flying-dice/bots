# Autobots — the Aerialbots team

The Aerialbots are one development team, not an Optimus-led faction hierarchy.

| | Role | Persona | Variants | Model tier / effort |
| :---: | --- | --- | --- | --- |
| <img src="../assets/avatars/silverbolt.jpg" width="60" alt="Silverbolt" /> | Team lead and dispatcher | **Silverbolt** | base | fable / low |
| <img src="../assets/avatars/skydive.jpg" width="60" alt="Skydive" /> | Senior frontend/backend developer | **Skydive** | base, deep | opus / medium, high |
| <img src="../assets/avatars/air-raid.jpg" width="60" alt="Air Raid" /> | Junior frontend/backend developer | **Air Raid** | base, lite | sonnet / medium, low |
| <img src="../assets/avatars/fireflight.jpg" width="60" alt="Fireflight" /> | Lead designer | **Fireflight** | base, deep | fable / low, high |
| <img src="../assets/avatars/prowl.jpg" width="60" alt="Prowl" /> | Shared architect | **Prowl** | base, deep | fable / low, high |
| <img src="../assets/avatars/ratchet.jpg" width="60" alt="Ratchet" /> | Independent QA | **Ratchet** | base, deep | opus / medium, high |

Prowl and Ratchet sit outside the development team and can support future teams.
They accept briefs from a lead or the user and preserve independent judgment.
Fireflight provides design direction; Skydive and Air Raid implement UI as well
as backend work. Software responsibilities are adaptations of G1 personalities.

The names and personality text live in [the variant config](../variants/autobots.json);
shared operating instructions live under `roles/`.

Install with `bots install --all --variant autobots --harness claude --scope user`
or choose `codex`. Start with `claude --agent silverbolt` or `$silverbolt` in Codex.
The Claude project-default example selects Silverbolt.

Plans live under `docs/bots/`. Only the primary team lead dispatches agents.
Prowl and Fireflight deep variants require the written justification described
in Silverbolt's definition.

The former roster, including Optimus Prime and Arcee, is available in Git history.
Legacy pictures remain preserved in `assets/avatars/`; see the [reference index](../assets/README.md).

Selecting this variant replaces the previous managed roster. See the
[project README](../README.md) for variant selection, upgrades, and development.
