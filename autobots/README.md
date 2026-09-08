# Autobots — the Aerialbots team

The Aerialbots are one development team, not an Optimus-led faction hierarchy.

| | Role | Persona | Variants | Model tier / effort |
| :---: | --- | --- | --- | --- |
| <img src="../assets/avatars/silverbolt.jpg" width="60" alt="Silverbolt" /> | Team lead and dispatcher | **Silverbolt** | base | fable / low |
| <img src="../assets/avatars/skydive.jpg" width="60" alt="Skydive" /> | Senior frontend/backend developer | **Skydive** | base, deep | opus / medium, high |
| <img src="../assets/avatars/air-raid.jpg" width="60" alt="Air Raid" /> | Junior frontend/backend developer | **Air Raid** | base, lite | sonnet / medium, low |
| <img src="../assets/avatars/fireflight.jpg" width="60" alt="Fireflight" /> | Lead designer | **Fireflight** | base, deep | fable / low, high |
| Pending | Shared architect | **Skyfire** | base, deep | fable / low, high |
| Pending | Independent QA | **Slingshot** | base, deep | fable / low, high |

Slingshot provides QA as an Aerialbot; Skyfire joins as an adjacent aerial
scientist and architect. Both report to Silverbolt in this project and accept
briefs from him or the user, preserving independent technical judgment.
Skyfire uses the scientist persona, with no air-command role in this roster.
Fireflight provides design direction; Skydive and Air Raid implement UI as well
as backend work. Software responsibilities are adaptations of G1 personalities.

The names and personality text live in [the variant config](../variants/autobots.json);
shared operating instructions live under `roles/`.

Install with `bots install --all --variant autobots --harness claude --scope user`
or choose `codex`. Start with `claude --agent silverbolt` or `$silverbolt` in Codex.
The Claude project-default example selects Silverbolt.

Plans live under `docs/bots/`. Only the primary team lead dispatches agents.
Skyfire and Fireflight deep variants require the written justification described
in Silverbolt's definition.

The former roster, including Optimus Prime and Arcee, is available in Git history.
Current and pending portraits are listed in the [reference index](../assets/README.md).

Selecting this variant replaces the previous managed roster. See the
[project README](../README.md) for variant selection, upgrades, and development.
