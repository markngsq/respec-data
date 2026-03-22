# Contributing to respec-data

This repository hosts agent skills — specialised instruction sets that give Claude Code capabilities it wouldn't otherwise have. If you've built something useful, we want it here.

---

## Before You Start

Read [SKILL-TEMPLATE.md](./SKILL-TEMPLATE.md) end to end. It defines the exact structure every skill must follow. Submissions that skip this step take longer to review.

Check the [existing skills](./skills/) directory to confirm your skill doesn't already exist in some form. Duplicates with meaningful differentiation are welcome; copies aren't.

---

## Skill Submission Guidelines

### What Makes a Good Skill

A skill is worth submitting if it:

- Solves a specific, recurring problem that Claude handles poorly without guidance
- Encodes expert knowledge or workflow patterns that aren't common knowledge
- Has clear, testable trigger conditions
- Is useful to someone other than the person who built it

A skill is **not** worth submitting if it:

- Restates general knowledge Claude already handles well
- Is too narrow to be useful beyond a single project
- Duplicates an existing skill without improving on it

---

### File Structure

Every skill lives in its own directory under `skills/`:

```
skills/
  your-skill-name/
    SKILL.md          ← required
    README.md         ← optional but encouraged
    scripts/          ← optional supporting scripts
    examples/         ← optional usage examples
```

The directory name becomes the skill name. Use lowercase kebab-case. Be specific but not verbose: `sql-expert` not `expert-sql-query-writing-optimization`.

---

### YAML Frontmatter

Every `SKILL.md` must open with valid YAML frontmatter:

```yaml
---
name: your-skill-name
description: >
  One sentence on what the skill does. Two sentences max.
  Use when [specific context]. Triggers on [keywords].
version: 1.0.0
tags:
  - relevant-tag
  - another-tag
---
```

**Description field requirements:**

The description is what Claude reads to decide whether to load your skill. It must:

1. State what the skill does in plain language
2. Say exactly when to use it ("Use when...")
3. Include the key trigger phrases that should activate it

Vague descriptions mean the skill never gets loaded. Specific descriptions mean it gets loaded at the right moment.

**Fail:** `Helps with database work.`
**Pass:** `Expert SQL query writing, optimization, and database schema design. Use when writing complex queries, optimising slow queries, designing schemas, or debugging SQL errors.`

---

### Trigger Writing

Triggers are the phrases that cause Claude to select your skill. They appear in the description field and are the difference between a skill that works and one that sits unused.

**Principles:**

- Write triggers as user utterances, not abstract categories
- Include common misspellings and synonyms if relevant
- Cover both the explicit ask ("write a SQL query") and the implied need ("the report is running slow")
- Don't over-trigger: if your skill fires on every message, it's too broad

**Good triggers:** `"generate tests"`, `"write unit tests"`, `"analyse test coverage"`, `"scaffold E2E tests"`, `"set up Playwright"`, `"configure Jest"`

**Weak triggers:** `"testing"`, `"quality"`, `"code"` — too generic, will compete with everything

---

### Progressive Disclosure

Structure your SKILL.md to front-load what Claude needs immediately and defer detail until it's relevant:

1. **Lead with the decision** — what should Claude do first?
2. **Follow with context** — background the AI needs to do it well
3. **Close with reference** — exhaustive detail, edge cases, examples

A skill that buries the core instruction in paragraph five is a skill that doesn't work reliably. Claude reads sequentially under context pressure.

---

### Content Standards

**Be concrete.** Specific instructions produce specific outputs. "Write clean code" is not an instruction. "Use const over let, arrow functions for callbacks, and named exports over default exports" is.

**Be opinionated.** Skills encode expertise. If there's a right way to do something, say so. Hedge words (`generally`, `often`, `typically`) dilute instructions.

**Be consistent.** Follow the emoji conventions in [EMOJI-GUIDE.md](./EMOJI-GUIDE.md) if you use emoji in headings. Don't invent new conventions.

**Be complete within scope.** Don't reference external resources that might move or disappear. If a pattern requires explanation, include the explanation.

---

## Quality Checklist

Before submitting, verify:

**Structure**
- [ ] Directory name is lowercase kebab-case
- [ ] `SKILL.md` exists at the directory root
- [ ] YAML frontmatter is valid and complete
- [ ] `name` in frontmatter matches directory name

**Triggers**
- [ ] Description clearly states when to use the skill
- [ ] Trigger phrases are user-utterance style, not abstract
- [ ] At least 3–5 distinct trigger phrases are present
- [ ] Triggers are specific enough to avoid false positives

**Content**
- [ ] Core instruction appears in the first quarter of the file
- [ ] No orphaned references to external URLs (use inline content)
- [ ] Emoji usage follows EMOJI-GUIDE.md conventions (if used)
- [ ] Instructions are concrete, not abstract

**Testing**
- [ ] You've activated the skill manually and confirmed it works
- [ ] You've tested at least 3 of your stated trigger phrases
- [ ] Output quality is demonstrably better with the skill than without

---

## Code of Conduct

The short version: be useful, be honest, be kind.

- Critique skills, not contributors
- Review feedback is offered to improve submissions, not to gatekeep
- If you're uncertain whether something belongs, open an issue first
- We don't accept skills that encode misinformation, harmful instructions, or content designed to deceive

Persistent bad faith behaviour results in removal. We don't have a lengthy escalation process.

---

## Review Process

### What Happens After You Submit

1. **Automated checks** run on PR open (structure validation, frontmatter parsing)
2. **Initial review** within 48–72 hours — a maintainer will assess fit and structure
3. **Feedback round** if changes are needed — specific, actionable comments
4. **Approval and merge** once quality bar is met

We aim for one feedback round. If a submission needs extensive rework, we'll say so clearly rather than iterating indefinitely.

### What Gets Skills Merged Faster

- Passing all automated checks
- Completing the PR template thoroughly (not just ticking boxes)
- Providing a before/after example showing the skill's effect
- Responding to feedback within a few days

### What Delays Review

- Incomplete PR template
- Missing YAML frontmatter
- Trigger phrases that don't match actual use cases
- No evidence the skill has been tested

### Review Criteria

Reviewers assess skills against four questions:

1. **Does it trigger correctly?** — Would Claude load this at the right moment?
2. **Does it work?** — Does following these instructions produce better output?
3. **Is it scoped correctly?** — Not too broad, not uselessly narrow?
4. **Does it fit the repository?** — Would other people use this?

Skills can be merged with minor suggestions pending, but not with unanswered structural questions.

---

## Versioning

Use semantic versioning in the frontmatter:

- `1.0.0` — initial submission
- `1.1.0` — new triggers, expanded coverage, non-breaking additions
- `2.0.0` — fundamentally different approach or breaking changes to output format

Include a `CHANGELOG.md` in your skill directory if you're submitting an update to an existing skill.

---

## Questions

Open an issue. Don't ask in PR comments — issues are searchable and benefit others with the same question.
