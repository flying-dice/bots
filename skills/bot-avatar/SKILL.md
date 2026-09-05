---
name: bot-avatar
description: Unified visual design system, prompt template, and faction guidelines for generating consistent mecha avatar portraits for Autobots and Decepticons.
---

# bot-avatar

Guidelines, specifications, and prompt templates for generating team avatar profile portraits for Autobots and Decepticons in the unified v2 visual style.

## Unified Visual Design System (v2)

All bot avatars must strictly adhere to these core visual rules to maintain harmony across the roster:

1. **Framing & Aspect Ratio**:
   - Square 1:1 framing (`AspectRatio: '1:1'`).
   - Centered close-up bust portrait looking directly into the camera.
   - Head, neck hydraulics/collar, and upper chest and shoulder armor plates must be visibly framed across the bottom (avoid floating heads with missing torso/shoulders).
2. **Background**:
   - Standardized dark charcoal slate background.
   - Cohesive, subtle dark hexagonal grid pattern.
3. **Robotic Construction**:
   - 100% mechanical mecha design.
   - Polished silver or titanium faceplates, articulated/segmented jaws, or specialized mecha visors.
   - **Never** render human skin, human lips, uncanny android mouths, or cartoonish proportions.
4. **Optics Faction Signature**:
   - **Autobots**: Luminous cyan-blue cybernetic sensor optics.
   - **Decepticons**: Luminous ruby-red / crimson cybernetic sensor optics.
   - *Specialists*: Shockwave uses a single central glowing cyclopean ruby-red optic sensor eye (no mouth/nose); Soundwave uses a horizontal glowing ruby-red cybernetic visor across the eyes (no mouth).
5. **Purity**:
   - **Zero text, zero labels, zero badges, zero insignia, zero faction logos, zero floating HUD line clutter.**
6. **Finish & Lighting**:
   - Polished satin-metallic panels with clean geometric panel lines.
   - Studio rim lighting keyed to the bot's signature accent color.

---

## Reusable Prompt Template

Use this template as the base for any new or regenerated avatar:

```text
A cohesive team avatar portrait of [Character Name] from Transformers. Modern 3D stylized mecha portrait, centered close-up headshot avatar, square 1:1 framing, looking directly at camera. [Helmet / head silhouette / crest / intake cowls], [armor color palette and panel accents], with neck collar and upper chest and shoulder armor plates framed across the bottom. [Robotic face description: stoic/calculating/disciplined robotic mechanical face with polished silver titanium faceplate and segmented jaw], [Optics description: bright glowing cyan-blue optics eyes for Autobots / bright glowing ruby-red cybernetic optics eyes for Decepticons]. Polished satin metallic textures, clean geometric panel lines. Completely clean composition with NO text, NO labels, NO badges, NO words, NO logos. Clean dark charcoal slate background with subtle dark hexagonal grid pattern and soft [accent color] studio rim lighting. Professional team profile picture, high consistency mecha avatar style.
```

---

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

---

## File Conventions

- Save generated square portraits to `assets/avatars/<bot-name>.jpg` using kebab-case (e.g. `air-raid.jpg`, `starscream.jpg`).
- Reference avatars in `assets/README.md` and the faction READMEs (`autobots/README.md`, `decepticons/README.md`).
