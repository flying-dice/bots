---
name: prebuild-synthetic-ux
description: Simulated UX discovery before anything is built. Constrained personas, discovery interviews, journey maps, a ranked list of assumptions to test with real users, and key journeys and user stories a builder can work from. Use when an idea, feature or product is being considered and before it is designed or built.
---

# Pre-build synthetic UX discovery

Simulated user research for an idea that has not been built yet. What comes out is a set of sharpened hypotheses and the cheapest ways to test them with real people. It is not research findings, and should never read as if it were.

## Before starting

You need the idea, who it is for, and the job it does for them. If one of those is missing, ask one question or state the assumption you are making. Do not invent a market.

## Three rules that always hold

Everything else in this skill is judgment. These are not.

**1. Personas are constrained, not cooperative.** Each one has a goal, a current workaround, limited time and attention, and a plausible reason not to care. They skim, misread jargon, hesitate when something is unclear, and walk away when effort outweighs value. Include at least one sceptic or poor fit. If every persona likes the idea, the simulation has failed: say so and rerun it.

**2. Stay inside the brief.** Personas react only to what has been described. Anything unstated (pricing, onboarding, integrations, how the backend behaves) is a gap to log, not a detail to fill in.

**3. Label what you know and what you guess.**
- *Given*: stated in the brief.
- *Inferred*: reasoned from general domain knowledge. Say on what basis.
- *Hypothesis*: a prediction about behaviour that only real users can confirm.

Synthetic quotes illustrate reasoning; they are never evidence. No invented statistics, studies or market numbers.

## Workflow

Seven stages. Scale them to the request: a quick gut-check may need only 1, 2 and 6. Skip what does not apply and say what you skipped.

1. **Frame.** Restate the idea, the user, the job, and the assumptions it rests on, in a few lines.
2. **Personas.** Three to five, differing on things that change behaviour (context, expertise, motivation, constraints), not on demographics.
3. **Interviews.** Ask about current behaviour, not opinions of the idea: what they do today, what it costs them, what they have already tried. Introduce the concept late and let them be indifferent to it.
4. **Journey map.** The current-state journey for each segment that matters: steps, friction, workarounds, and the moments where the idea could help or would be ignored.
5. **Synthesis.** Where personas converge and where they split, the riskiest assumptions, and what would kill the idea.
6. **Validation plan.** Rank hypotheses by how damaging it is to be wrong and how uncertain you are. Give the cheapest real-world test for each.
7. **Build handoff.** Turn the synthesis into key journeys and user stories, in the format below. Skip it only for a gut-check or when nothing is going to be built.

## Output

Use this structure, in this order. Keep interview excerpts short: enough to show the reasoning, not a transcript.

1. A one-line banner saying this is synthetic: hypotheses to test, not findings.
2. **Frame.** The idea, the job, and the gaps the brief leaves open, each labelled.
3. **Riskiest assumptions and cheapest tests.** Three to five, ranked, each with its label and a concrete test. Then one line on what would kill the idea.
4. **Personas, interview excerpts, current-state journey and synthesis.** Compact; formatting to suit.
5. **Key journeys.** Four to six end-to-end journeys through the proposed product. For each one:
   - a name and the trigger that starts it;
   - numbered steps through the product;
   - a success end state, including what the user sees when it goes wrong (no match, empty, failed) where that matters.
6. **User stories.** Ten to fifteen, numbered, in the form "As a…, I want…, so that…". For each one:
   - one to three short acceptance criteria a tester could check;
   - a priority: **Must**, **Should** or **Could**;
   - the assumption, persona or gap it addresses, in brackets.
   Rule 2 still holds: a story that needs something the brief does not state is marked *assumption*, not presented as given.
7. **Skipped / limits.** What you skipped and why.
8. A closing line saying this is synthetic and naming what it cannot tell the reader.

Journeys and stories are a starting backlog shaped by hypotheses, not validated requirements. Leave sections 5 and 6 out only when stage 7 was skipped, and say so.
