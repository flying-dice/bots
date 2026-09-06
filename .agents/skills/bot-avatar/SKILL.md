---
name: bot-avatar
description: Generate consistent Autobot and Decepticon avatar portraits using the project's v2 visual style.
---

# bot-avatar

## Visual rules (v2)

Use the prompt below with the character matrix for new or regenerated portraits. Keep construction fully mechanical: no human skin, lips, uncanny android mouths, or cartoonish proportions. Show the neck and shoulders, never a floating head.

Autobots have luminous cyan-blue optics; Decepticons have ruby-red/crimson optics. Shockwave has one central cyclopean optic and no mouth or nose. Soundwave has a horizontal visor and no mouth.

## Reusable prompt

```text
A team avatar of [character] from Transformers: modern 3D stylized mechanical mecha, centered close-up bust, square 1:1, looking directly at camera. [Helmet and armor palette from matrix], visible neck hydraulics/collar, upper chest and shoulder plates across the bottom. [Silver/titanium faceplate and segmented jaw, or character-specific visor/cyclopean design], glowing [faction optics]. Polished satin-metallic panels, clean geometric panel lines. Dark charcoal slate background with subtle dark hexagonal grid; soft [matrix accent] studio rim lighting. No text, labels, badges, insignia, logos, or floating HUD clutter.
```

## Faction & Character Matrix

### Autobots (Cyan-Blue Optics)

| Character | Vehicle / Motif | Signature Colors | Helmet / Facial Design | Rim Lighting |
| --- | --- | --- | --- | --- |
| **Silverbolt** | Concorde SST | White, crimson, gold trim | High commander crest, noble silver faceplate | Crimson & gold |
| **Skydive** | F-16 Falcon | Slate-blue, gunmetal, red/silver | Interceptor helmet, dual antennae, precision faceplate | Slate blue |
| **Air Raid** | F-15 Eagle | Obsidian black, crimson, white | Swept intake cowls, aggressive silver faceplate | Crimson red |
| **Fireflight** | F-4 Phantom | Crimson red, pearl white, amber | Aviator crest helmet, silver faceplate, shoulder intakes | Warm amber-gold |
| **Prowl** | Police interceptor | Black, white, red crest | Red chevron crest, side antenna fins, stoic faceplate | Cobalt blue |
| **Ratchet** | Emergency rescue | White, crimson, silver | Medical crest helmet, chevron forehead, silver faceplate | Crimson & cyan |

### Decepticons (Ruby-Red Optics)

| Character | Role / Motif | Signature Colors | Helmet / Facial Design | Rim Lighting |
| --- | --- | --- | --- | --- |
| **Starscream** | Seeker jet lead | Aerospace gray, crimson, blue | Tall black crown crest, side intake ear-fins, silver faceplate | Crimson red |
| **Thundercracker** | Seeker senior dev | Metallic cobalt blue, silver, red | Seeker crown helmet, ear-fin cowls, disciplined faceplate | Cobalt blue |
| **Skywarp** | Seeker developer | Obsidian black, royal purple, silver | Seeker aerospace helmet, intake fins, silver faceplate | Royal purple |
| **Thrust** | Conehead designer | Maroon-red, charcoal black, gold | Aerodynamic conical VTOL helmet, turbofan vents | Maroon & amber |
| **Soundwave** | Shared architect | Deep navy blue, silver, gold trim | Decepticon-crest helmet, full ruby-red horizontal visor, no mouth | Violet-blue |
| **Shockwave** | Independent QA | Royal purple, gunmetal gray | Pointed antenna ears, single central cyclopean red optic eye, no mouth | Deep purple |

## File Conventions

- Save generated square portraits to `assets/avatars/<bot-name>.jpg` using kebab-case (e.g. `air-raid.jpg`, `starscream.jpg`).
- Reference avatars in `assets/README.md` and the faction READMEs (`autobots/README.md`, `decepticons/README.md`).
