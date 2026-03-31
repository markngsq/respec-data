---
name: nightly-learning-v2
description: Multi-model iterative refinement for high-quality learning labs using ARIS-inspired cross-model review loops. Use for end-of-day deep learning sessions with executor/critic review cycles.
vibe: Cross-model iterative refinement
category: maintenance
tier: atom
maturity: seed
evolution_count: 0
tags:
  - learning
  - ai
  - nightly
triggers:
  - running a nightly learning session
  - creating iterative cross-model knowledge artifacts
---
# Nightly Learning v2 — ARIS-Inspired Review Loop

Multi-model iterative refinement for high-quality learning labs.

## What This Skill Does

Transforms single-pass learning dumps into iteratively refined, cross-validated knowledge artifacts.

**Inspired by ARIS** (Auto-Research-In-Sleep): Uses cross-model review loops (executor × critic) to avoid self-play blind spots and ensure quality threshold is met before publishing.

## Flow

```
1. Domain Selection
   ├─ Read learning-state.json
   ├─ Pick next topic from capabilities.json
   └─ Resume interrupted if needed

2. Literature Phase
   ├─ Scan existing labs (~/modalos/app/logs/*.html)
   ├─ Build knowledge graph
   └─ Check for gaps/overlaps

3. Draft Phase (Sonnet)
   ├─ Generate interactive HTML lab
   ├─ Self-score (1-10)
   └─ If score >= 7: skip to Phase 6

4. Review Phase (Haiku)
   ├─ Clarity check
   ├─ Completeness check
   └─ Generate improvement suggestions

5. Refine Phase (Sonnet)
   ├─ Incorporate feedback
   ├─ Re-score
   └─ Loop back to Phase 4 (max 2 rounds)

6. Validation Phase (Gemini, optional)
   ├─ Technical accuracy check
   └─ Catch conceptual errors

7. Publish Phase
   ├─ Write to ~/modalos/app/logs/
   ├─ Git commit + push
   └─ Update learning-state.json
```

## Quality Threshold

- **Minimum score:** 7/10 (ARIS-style)
- **Max review rounds:** 2
- **Models:**
  - Executor: Sonnet (draft + refine)
  - Reviewer: Haiku (clarity)
  - Validator: Gemini 2.5 Flash Lite (accuracy)

## State Persistence

**File:** `~/.openclaw/workspace/self/learning-state.json`

```json
{
  "version": "2.0.0",
  "cycle": 114,
  "domainsCompleted": 28,
  "lastRunAt": "2026-03-31T01:30:00.000Z",
  "qualityMetrics": {
    "averageScore": 7.8,
    "totalRounds": 114,
    "roundsWithReview": 23
  },
  "domains": {
    "domain-name": {
      "status": "in-progress|complete",
      "cyclesSpent": 4,
      "topics": ["topic1", "topic2"],
      "lastScore": 8.5,
      "completedAt": "2026-03-30T17:30:00.000Z"
    }
  },
  "nextCandidates": ["domain-a", "domain-b"]
}
```

## Usage

### Automatic (Cron)
```bash
# Run at 1:30 AM, 3:30 AM, 5:30 AM
# Cron payload:
{
  "kind": "agentTurn",
  "message": "Run nightly-learning-v2 skill: auto-select domain, review loop enabled, publish to ModalOS",
  "model": "anthropic/claude-sonnet-4-6",
  "timeoutSeconds": 3600
}
```

### Manual
```bash
# From Claude Code
> Read /workspace/respec-data/skills/nightly-learning-v2/SKILL.md
> Run nightly-learning-v2: domain=reinforcement-learning, topic=policy-gradients
```

## Implementation Notes

### Phase 3: Draft Generation (Sonnet)
**Input:** Domain + topic + existing labs context  
**Output:** Interactive HTML lab (1000-1500 lines, 3-4 sections, tabs, sliders, plots)  
**Self-scoring rubric:**
- 9-10: Novel insights, exceptional interactivity, publication-quality
- 7-8: Solid depth, good examples, clear exposition
- 5-6: Surface-level, needs more examples or clarity
- 3-4: Incomplete or confusing
- 1-2: Broken or off-topic

### Phase 4: Review (Haiku)
**Prompt template:**
```
You are a learning materials reviewer. Rate this lab on:

1. Clarity (1-10): Can a reader unfamiliar with the topic follow it?
2. Completeness (1-10): Are key concepts explained? Examples provided?
3. Interactivity (1-10): Do the tabs/sliders/plots enhance understanding?

Provide:
- Overall score (average of above)
- 3-5 concrete improvement suggestions
- Highlight any conceptual errors

Context: This lab was self-scored {draft_score}/10 by the author.

[Lab HTML content here]
```

### Phase 5: Refine (Sonnet)
**Prompt template:**
```
Improve this learning lab based on reviewer feedback:

Review score: {review_score}/10
Suggestions:
{suggestions}

Rewrite the lab to address these issues. Re-score yourself (1-10).

[Original HTML here]
```

### Phase 6: Validation (Gemini, optional)
**When to skip:** If domain is purely conceptual (philosophy, history)  
**When to run:** Technical domains (ML, math, physics, CS)  
**Prompt template:**
```
Check this learning lab for technical accuracy. Flag:
- Incorrect formulas
- Misleading examples
- Outdated information
- Conceptual errors

[Lab HTML here]
```

## Metrics Tracking

Track in `learning-state.json`:
- Average quality score across all cycles
- Percentage of cycles that needed review rounds
- Domains completed
- Failed attempts (topics that couldn't reach threshold)

## Edge Cases

**Interrupted mid-cycle:** Resume from `currentDomain` + `currentTopic` in state file.  
**No more topics:** Mark domain as complete, move to next domain.  
**Can't reach threshold after 2 rounds:** Publish anyway, log as "borderline" in state.  
**Gemini validation fails:** Log warning, publish anyway (don't block on validator).

## Future Enhancements

- [ ] Knowledge graph visualization
- [ ] Cross-reference detection (link related labs)
- [ ] Difficulty progression (easier topics first)
- [ ] Multi-domain capstones (synthesize across domains)
- [ ] Export to Obsidian/Notion

## References

- ARIS: https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep
- Original nightly learning: `/workspace/self/assess.py`
- Capabilities tracking: `/workspace/self/capabilities.json`
