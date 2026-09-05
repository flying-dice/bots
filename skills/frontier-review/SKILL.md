---
name: frontier-review
description: Multi-model code review on a Ticket or MR using external agent CLIs (Antigravity, OpenAI Codex, Claude Code). Tech Lead review for technical work, Design Lead review for UI/UX work.
---

# frontier-review

Delegate code reviews to external agent harnesses (**Google Antigravity**, **OpenAI Codex**, and **Claude Code**).

Reviewers evaluate the change and post their findings directly to the **Ticket** or **Merge Request (MR)** thread.

---

## 1. Precondition Gate

- **Must target a tracked work item**: Merge Request (e.g. `!42`, `#128`) or Ticket/Card (e.g. `boards/main/03-export.md`, issue `#87`).
- Never run on unlinked local diffs. Reviewers post comments directly to the remote MR or ticket card.

---

## 2. Review Perspectives

- **Tech Lead Review** (Technical Work): Focus on architecture seams, correctness invariants, error propagation, panic safety, and test adequacy.
- **Design Lead Review** (UI / UX Work): Focus on interaction flow, loading/empty/error states, WCAG accessibility (touch targets, keyboard nav, contrast), and design system tokens.
- **Full-Stack Work**: Run both passes.

---

## 3. Gated Serial Pipeline

Reviewers run in strict serial order, skipping whichever harness is currently hosting the session:

$$1.\ \text{Antigravity (agy)} \longrightarrow 2.\ \text{Codex (codex)} \longrightarrow 3.\ \text{Claude Code (claude)}$$

> [!IMPORTANT]
> **Progression Gate**: If a reviewer requests changes, **halt immediately**. Do not run subsequent harnesses on unfixed code. Fix the findings, verify green, and only then proceed to the next reviewer.

---

## 4. Models & CLI Hints

Each CLI should run its top model at medium reasoning effort:

### Google Antigravity (`agy`)
- **Model**: `gemini-3.8-flash-medium`
```sh
agy -p "Review <target> as <Tech Lead|Design Lead>. Post findings directly to the thread." --model gemini-3.8-flash-medium
```

### OpenAI Codex (`codex`)
- **Model**: `gpt-6-astra` (reasoning: `medium`)
```sh
codex exec "Review <target> as <Tech Lead|Design Lead>. Post findings directly to the thread." -m gpt-6-astra -c model_reasoning_effort="medium" --ephemeral
```

### Claude Code (`claude`)
- **Model**: `fable` (effort: `medium`)
```sh
claude -p "Review <target> as <Tech Lead|Design Lead>. Post findings directly to the thread." --model fable --effort medium
```

---

## 5. Review Format

Reviewers format comments directly on the target thread:

```markdown
### <Tech Lead | Design Lead> Review (<Harness Name>)

**Verdict**: APPROVE | REQUEST_CHANGES | COMMENT

#### Summary
<Direct 1-2 sentence assessment of readiness and risk>

#### Key Findings
- **[BLOCKER | MAJOR | MINOR]** `file:line`: <Description of finding and risk>
  *Recommendation*: <Concrete fix>

#### Verification Evidence
<Checks run or recommended>
```
