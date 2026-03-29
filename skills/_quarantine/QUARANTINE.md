# _quarantine/

Skills in this directory have been flagged for issues and are not served to users.

## playwright-skill

**Quarantined:** ~2026-02 (exact date unknown)
**Reason:** Skill relies on spawning Playwright via shell exec in `/tmp` — security concern for a skill that auto-executes browser automation code with no sandboxing. Also uses the old `$SKILL_DIR` path resolution pattern that predates the current skill loading system.

**Issues:**
- Arbitrary code execution via shell in /tmp
- Hardcoded path resolution heuristics (brittle)
- `maturity: seed`, `evolution_count: 0` — never battle-tested

**Graduation criteria (to unquarantine):**
1. Replace shell exec pattern with bounded Playwright API usage
2. Remove $SKILL_DIR path heuristics — use current skill loading conventions
3. Add explicit scope limits (no file system writes outside /tmp, no credential access)
4. Bump maturity to `growing` with at least 3 real use cases logged

**Owner:** Weyland to assess if/when Playwright support is needed.
