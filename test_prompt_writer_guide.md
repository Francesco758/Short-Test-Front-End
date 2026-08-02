# Guide for Writing Test Prompts

This guide explains what your test prompt needs to include so the evaluation system works correctly. Follow these rules and your test will score users accurately.

---

## 1. Use these exact 6 dimension names

The system looks for these 6 skills when scoring a user. You must use **these exact names** in your prompt:

| Dimension | Write it exactly like this |
|-----------|---------------------------|
| Simplification | `simplification` |
| Originality | `originality` |
| Feasibility | `feasibility` |
| Critical Thinking | `criticalThinking` |
| Proactivity | `proactivity` |
| Impact | `impact` |

**Common mistake to avoid:**  
❌ `critical_thinking` (with underscore) — the system won't recognize it  
✅ `criticalThinking` — this is what the system expects

---

## 2. Tell GPT to output ALL required fields

Your prompt must tell GPT to output a JSON object with **all** of these fields at the end of the test:

```
simplification
originality
feasibility
criticalThinking
proactivity
impact
summary
strengths
improvements
reasoning
confidence
problem_summary
solution_summary
problem_cluster
solution_cluster
problem_key
problem_topic
solution_key
solution_topic
```

**Do NOT** include instructions like:
- "Do not output any additional fields"
- "Do not output any confidence score"
- "Do not output any overall score"
- "Output ONLY the 6 scores"

These instructions tell GPT to skip fields the system needs, and the report will end up with generic placeholders instead of real analysis.

---

## 3. Use a 0–100 scale for scoring

All 6 dimension scores must be integers from **0 to 100**.  

**Do NOT** use a 1–5 or 1–10 scale anywhere in your prompt — it confuses GPT. If you want to describe weak vs strong performance, explain what behavior earns low scores (e.g., 0–30) vs high scores (e.g., 70–100), but keep the actual scoring on a 0–100 range.

---

## 4. Describe what to observe, not what to calculate

Write your evaluation criteria as behavioral observations — what to look for in the user's answers. For example:

✅ Good: *"Lower the score if the user accepts the problem without analysis. Raise it if they identify root causes."*  
❌ Bad: *"Score critical thinking as the average of steps 1 and 2."*

GPT is good at evaluating behaviors, not at following calculation formulas.

---

## 5. Define what each dimension means for YOUR specific test

The 6 dimensions are the same across all tests, but you can customize what they mean for your test. For example:

- In a **problem-solving test**: Impact = does the solution fix the root cause?
- In a **leadership test**: Impact = does the solution create lasting organizational change?
- In a **product design test**: Impact = does it solve a real user need?

The more specific your description, the more accurate the scoring.

---

## Quick Checklist

Before finalizing your prompt, verify:

- [ ] All 6 dimension names use camelCase: `criticalThinking` not `critical_thinking`
- [ ] The JSON output section lists **all 20 fields** (6 scores + 14 analysis fields)
- [ ] No instructions that say "do not output" or "only output"
- [ ] Scoring is on a 0–100 scale, not 1–5 or 1–10
- [ ] Evaluation criteria describe behaviors to observe, not formulas to calculate
- [ ] Each dimension has a clear description tuned to your test's context

---

## Example: Correct JSON Output Section

Copy this into your prompt's "Machine Output" section and just replace the example values:

```json
{
  "simplification": 0,
  "originality": 0,
  "feasibility": 0,
  "criticalThinking": 0,
  "proactivity": 0,
  "impact": 0,
  "summary": "evaluation paragraph",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "reasoning": "rationale for scores",
  "confidence": 85,
  "problem_summary": "the problem the user addressed",
  "solution_summary": "the solution the user proposed",
  "problem_cluster": "CATEGORY_SLUG",
  "solution_cluster": "CATEGORY_SLUG",
  "problem_key": "stable_key",
  "problem_topic": "Human Readable Title",
  "solution_key": "stable_key",
  "solution_topic": "Human Readable Title"
}
```
