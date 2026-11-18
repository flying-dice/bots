---
name: postbuild-synthetic-usability
description: Simulated usability review of something that exists (code, screenshot, prototype, wireframe). Task walkthroughs, heuristic and WCAG audit, edge cases and prioritised findings.
---

# Post-build synthetic usability review

A usability review of a real artifact, using simulated users plus expert inspection. It finds defects you can verify now and flags behaviour worth testing with real people. It does not replace a usability test or an accessibility audit with assistive technology.

## Before starting

You need the artifact and the tasks users are meant to complete with it. If no tasks are given, infer the one or two obvious ones and state them.

## Three rules that always hold

Everything else in this skill is judgment. These are not.

**1. Review only what is there.** If a label, state, error message or piece of help text is not in the artifact, the user does not have it. Do not assume backend behaviour, onboarding, or anything that happens off-screen. Say what the artifact type cannot show: a screenshot says nothing about keyboard order, focus or screen-reader semantics; code without rendered styles says little about visual hierarchy or contrast.

**2. Simulated users behave like busy people.** They skim, misread jargon, pick the wrong control when two look alike, hesitate when the next step is unclear, and abandon when effort outweighs value. They do not read everything, forgive friction or praise the design. If every walkthrough succeeds cleanly, look again.

**3. Label each finding by how sure you can be.**
- *Defect*: verifiable in the artifact. Point to the element or line.
- *Likely issue*: breaks a recognised heuristic or pattern. Name it.
- *Hypothesis*: a prediction about behaviour that needs real users.

Cite a WCAG success criterion only when you can check it from the artifact; otherwise write "could not verify". Never claim conformance.

## Workflow

Six stages. Scale them to the request: a single component may need only 1, 3 and 5. Skip what does not apply and say what you skipped.

1. **Inventory.** What is actually present: screens, controls, states, copy. What is missing or cannot be assessed.
2. **Task walkthrough.** Step through each primary task: what the user sees, what they would most likely do, where they stall. Record each as completed, struggled or abandoned, with the reason.
3. **Heuristic and accessibility audit.** Use Nielsen's heuristics and WCAG 2.2 AA as lenses, not checklists to fill in. Report only what applies.
4. **Edge cases and errors.** Empty, invalid, slow, failed, interrupted, repeated. Does the artifact handle each one, or go silent?
5. **Prioritise.** Blocker, major or minor, judged by effect on task completion and how many users are likely to hit it.
6. **Validation.** What to confirm with real users or assistive technology, and the cheapest way to do it.

## Output

Lead with blockers and their fixes. For each finding: what, where, why it matters, its label, and a suggested fix. Format to suit the request. Do not pad with praise; mention what works only when it is a deliberate choice worth protecting from later changes.
