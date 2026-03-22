## Skill Summary

**Skill name:** `skills/your-skill-name`
**What it does:**

<!-- One or two sentences. What problem does this skill solve? -->

**Why it doesn't exist already / how it differs from existing skills:**

<!-- Check the skills/ directory. If something similar exists, explain what this adds. -->

---

## Skill Quality Checklist

### Structure
- [ ] Directory name is lowercase kebab-case
- [ ] `SKILL.md` exists at the directory root
- [ ] YAML frontmatter is present, valid, and complete
- [ ] `name` in frontmatter matches the directory name
- [ ] `version` is set to `1.0.0` (or incremented correctly for updates)

### Description & Triggers
- [ ] Description field clearly states when to use the skill
- [ ] At least 3–5 distinct trigger phrases are present in the description
- [ ] Trigger phrases are written as user utterances (e.g. "write unit tests"), not abstract categories (e.g. "testing")
- [ ] Triggers are specific enough to avoid false positives

### Content Quality
- [ ] Core instruction appears in the first quarter of the SKILL.md file
- [ ] Instructions are concrete and opinionated, not abstract or hedged
- [ ] No orphaned external URL references (content is self-contained)
- [ ] Emoji usage follows EMOJI-GUIDE.md (if emoji are used)

---

## Testing Checklist

- [ ] Skill was activated manually and confirmed to load
- [ ] Tested with at least 3 of the stated trigger phrases
- [ ] Output quality is demonstrably better with the skill than without

**Trigger phrases tested:**

<!-- List the exact phrases you used to activate the skill -->
1. 
2. 
3. 

**Before/after example** (optional but speeds review):

<!-- Short example showing the difference the skill makes. Even one input/output pair helps. -->

---

## Documentation Checklist

- [ ] YAML `description` field is accurate and complete
- [ ] `tags` reflect how someone would look for this skill
- [ ] If this is an update: `CHANGELOG.md` exists and describes what changed
- [ ] README.md added (optional, but helpful for complex skills)

---

## Reviewer Notes

<!-- Anything you want reviewers to know. Edge cases, design decisions, known limitations. -->
