# Contributing to the Respec Skill Tree

The skill tree improves through real-world use. If you've discovered a better pattern, found a critical gotcha, or built a skill worth sharing — contribute it back.

---

## The Contribution Model

```
Your Branch
    │
    │  (you customize, use, discover)
    │
    └──▶ Pull Request to main
              │
              └──▶ Admin reviews all PRs together as a unified diff
                        │
                        └──▶ Best changes merged into master skill tree
```

**Key principle:** The admin reviews everything before it hits master. No single user's changes can degrade another user's skill tree. The review pass is where curation happens.

---

## What Makes a Good Contribution

**✅ Good contributions:**
- A lesson learned from actual use ("This pattern fails when X, use Y instead")
- A new skill encoding domain knowledge that isn't in the tree yet
- Correcting outdated or wrong information in an existing skill
- A new molecule or workflow that you've actually used end-to-end
- A skill summary one-liner that's more accurate than the current one

**❌ Not ready for master:**
- Documentation re-hash (just paraphrasing official docs with no added insight)
- Speculative patterns you haven't tested
- Skill descriptions so broad they'd always trigger (hurts routing precision)
- Changes that break the SKILL.md structure spec

---

## How to Submit a Contribution

### Option 1: Via the Respec App (preferred)
The app manages your personal branch automatically. Customize skills through the UI, then use the sync/submit flow to open a PR.

### Option 2: Direct GitHub PR
1. Fork `markngsq/respec-data`
2. Make your changes in a branch
3. Open a PR with a clear description of *what changed and why*
4. The admin will review it in the next review batch

---

## Adding a New Skill

1. Create `skills/your-skill-name/` directory
2. Write `SKILL.md` following the structure below
3. Add a one-liner to `config/skill-summaries.json`
4. Assign a tier in `config/tiers.json` → `skillTiers`
5. Assign a category (pick the most specific existing category; don't create new categories without discussion)
6. Submit PR

### `SKILL.md` Minimum Viable Structure

```markdown
# Skill Name

## When to Use This Skill
[Trigger description — one sentence, specific enough that the agent won't false-positive]

## Core Concepts
[The mental model. What does an expert know that a non-expert doesn't?]

## Patterns
[Numbered list of proven approaches]

## Anti-Patterns
[What not to do and why]

## Lessons Learned
[Real discoveries from actual use. This section grows over time.]
```

**The "When to Use This Skill" section is the most important.** It determines when the agent loads the skill. Be specific. "Use when building React apps" is too broad. "Use when creating pages, routes, layouts, or Server Actions with Next.js 15 App Router" is right.

---

## Updating an Existing Skill

Small improvements are welcome: fixing wrong info, adding a lesson learned, tightening the trigger description.

For significant rewrites, open a PR with a clear diff and explain what was wrong or incomplete in the original.

---

## Adding/Updating Molecules and Workflows

Molecules and workflows are defined in `config/tiers.json`.

**To add a molecule:**
```json
{
  "id": "your-molecule",
  "name": "Human-Readable Name",
  "description": "One sentence — what does this combination enable?",
  "atoms": ["skill-id-1", "skill-id-2"],
  "category": "relevant-category"
}
```

Only create a molecule if the atoms genuinely compound — the combination enables something neither does alone.

---

## Updating Skill Summaries

`config/skill-summaries.json` one-liners appear in the Skills table. They should be:
- Specific (not "helps with X" — say *how*)
- Honest about scope (don't oversell)
- Human-readable (no jargon the user doesn't already know)

---

## Review Criteria

The admin uses this checklist when reviewing PRs:

| Check | Description |
|-------|-------------|
| **Real knowledge** | Does this encode something an AI wouldn't have without it? |
| **Tested** | Is this based on actual use, not speculation? |
| **Correct trigger** | Will the skill activate at the right times and not over-trigger? |
| **Structure** | Does it follow the SKILL.md spec? |
| **No regression** | Does this change break or weaken anything that was working? |
| **Summaries updated** | If new skill, is `skill-summaries.json` updated? |
| **Tier assigned** | Is the tier in `tiers.json` correct? |

---

## Questions

Open an issue or reach out to the admin directly.

The skill tree is a living document — it should get sharper with every contribution.
