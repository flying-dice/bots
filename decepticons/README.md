# Decepticons — the Seekers team

Starscream leads the first development team. Thundercracker is the senior
frontend/backend developer; Skywarp is the junior frontend/backend developer.
Thrust sets design direction and critiques UI; the developers implement it.

Dirge is the shared architect. Ramjet provides independent QA. Both report to Starscream and accept briefs from him or the user, while
preserving independent technical judgment. They can support future teams
without duplicating their personas.

| | Persona | Role | Variants | Model tier / effort |
| :---: | --- | --- | --- | --- |
| <img src="../assets/avatars/starscream.jpg" width="60" alt="Starscream" /> | **Starscream** | Team lead and dispatcher | base | fable / low |
| <img src="../assets/avatars/thundercracker.jpg" width="60" alt="Thundercracker" /> | **Thundercracker** | Senior frontend/backend developer | base, deep | opus / medium, high |
| <img src="../assets/avatars/skywarp.jpg" width="60" alt="Skywarp" /> | **Skywarp** | Junior frontend/backend developer | base, lite | sonnet / medium, low |
| <img src="../assets/avatars/thrust.jpg" width="60" alt="Thrust" /> | **Thrust** | Lead designer | base, deep | fable / low, high |
| Pending | **Dirge** | Shared architect | base, deep | fable / low, high |
| Pending | **Ramjet** | Independent QA | base, deep | fable / low, high |

The names and personality text live in [the variant config](../variants/decepticons.json);
shared operating instructions live under `roles/`.

Install with `bots install --all --variant decepticons --harness claude --scope user`
or choose `codex`. Start with `claude --agent starscream` or `$starscream` in Codex.

Plans live under `docs/bots/`. Only the primary lead dispatches subagents.
Dirge and Thrust deep variants require the written justification described
in the lead role template. Selecting this variant replaces the previous managed
roster. See the [project README](../README.md) for variant selection.
