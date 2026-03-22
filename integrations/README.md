# Respec Multi-Tool Integrations

Export Respec skills to work with other coding assistants.

## Supported Tools

- **Cursor** — `.mdc` rule files
- **Aider** — Single `CONVENTIONS.md` file
- **Windsurf** — Single `.windsurfrules` file
- **GitHub Copilot** — Direct `.md` copies

## Usage

### Convert All Skills

```bash
npm run convert:all
```

This generates files in `integrations/` for all 4 tools.

### Convert for Specific Tool

```bash
# Cursor
npm run convert:cursor

# Aider  
npm run convert:aider

# Windsurf
npm run convert:windsurf

# GitHub Copilot
npm run convert:copilot
```

### Install to Your Project

**Cursor:**
```bash
cp integrations/cursor/*.mdc .cursor/rules/
```

**Aider:**
```bash
cp integrations/aider/CONVENTIONS.md ./
aider --read CONVENTIONS.md
```

**Windsurf:**
```bash
cp integrations/windsurf/.windsurfrules ./
```

**GitHub Copilot:**
```bash
mkdir -p ~/.copilot/agents
cp integrations/copilot/*.md ~/.copilot/agents/
```

## Output Files

- **Cursor:** 56 `.mdc` files (~700KB total)
- **Aider:** 1 `CONVENTIONS.md` file (~600KB)
- **Windsurf:** 1 `.windsurfrules` file (~32KB, critical rules only)
- **Copilot:** 56 `.md` files (~750KB total)

## Converter Scripts

All converters are in `converters/`:
- `converters/cursor.js` — Cursor .mdc format
- `converters/aider.js` — Aider CONVENTIONS.md
- `converters/windsurf.js` — Windsurf .windsurfrules
- `converters/copilot.js` — GitHub Copilot .md files

## Custom Conversion

You can run converters individually:

```bash
# Convert single skill to Cursor
node converters/cursor.js nextjs

# Convert all skills to Cursor
node converters/cursor.js --all
```

## Notes

- Generated files are **gitignored** (regenerate locally with `npm run convert:all`)
- Converters extract frontmatter and format for each tool's requirements
- Aider and Windsurf merge all skills into single files (easier context management)
- Cursor and Copilot use per-skill files (better discoverability)

---

**See also:**
- [ROLES.md](../ROLES.md) — Role-based skill bundles
- [CATEGORIES.md](../CATEGORIES.md) — Browse skills by category
