#!/usr/bin/env node
'use strict';

// ─── Config ──────────────────────────────────────────────────────────────────

const path  = require('path');
const fs    = require('fs');

const SKILLS_DIR   = path.resolve(__dirname, '..', 'skills');
const FIX_MODE     = process.argv.includes('--fix');
const VERBOSE      = process.argv.includes('--verbose');

// ─── ANSI colours ────────────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
};

const ok    = msg => `${C.green}✔${C.reset} ${msg}`;
const err   = msg => `${C.red}✖${C.reset} ${C.red}${msg}${C.reset}`;
const warn  = msg => `${C.yellow}⚠${C.reset} ${C.yellow}${msg}${C.reset}`;
const info  = msg => `${C.blue}ℹ${C.reset} ${C.dim}${msg}${C.reset}`;
const fixed = msg => `${C.cyan}⚙${C.reset} ${C.cyan}[fixed]${C.reset} ${msg}`;
const head  = msg => `\n${C.bold}${C.white}${msg}${C.reset}`;

// ─── YAML front-matter parser (no deps) ──────────────────────────────────────

function parseFrontMatter(src) {
  const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
  const m = src.match(FM_RE);
  if (!m) throw new Error('No YAML front-matter block found (expected --- delimiters)');
  const raw = m[1];
  const data = {};

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const listItem = line.match(/^(\s*)-\s+(.*)/);
    if (listItem) {
      if (!data.__lastKey) continue;
      const k = data.__lastKey;
      if (!Array.isArray(data[k])) data[k] = [];
      data[k].push(listItem[2].trim());
      continue;
    }

    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)/);
    if (kv) {
      const key = kv[1].trim();
      const val = kv[2].trim();
      data[key] = val.startsWith('"') && val.endsWith('"')
        ? val.slice(1, -1)
        : val.startsWith("'") && val.endsWith("'")
          ? val.slice(1, -1)
          : val === '' ? null : val;
      data.__lastKey = key;
    }
  }

  delete data.__lastKey;
  return { raw, data };
}

function serializeFrontMatter(data) {
  const lines = [];
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${item}`);
    } else if (v === null || v === undefined || v === '') {
      lines.push(`${k}:`);
    } else {
      const needsQuote = /[:#\[\]{}&*!|>'"%@`]/.test(String(v));
      lines.push(`${k}: ${needsQuote ? `"${String(v).replace(/"/g, '\\"')}"` : v}`);
    }
  }
  return lines.join('\n');
}

// ─── Reference data ───────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  'frontend', 'backend', 'fullstack', 'devops', 'testing', 'security',
  'data', 'ai', 'docs', 'workflow', 'design', 'productivity', 'tools',
  'database', 'mobile', 'infrastructure', 'monitoring', 'agent',
]);

function isEmoji(str) {
  if (!str) return false;
  const emojiRE = /^\p{Emoji}/u;
  return emojiRE.test(str.trim());
}

// ─── Validators ──────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ['name', 'description', 'category', 'triggers'];

function validateSkill(skillPath, src) {
  const issues = { errors: [], warnings: [], fixes: [] };
  let fm, data;

  try {
    fm = parseFrontMatter(src);
    data = fm.data;
  } catch (e) {
    issues.errors.push(`YAML parse error: ${e.message}`);
    return { issues, fixedData: null };
  }

  const fixed = FIX_MODE ? { ...data } : null;

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    const val = data[field];
    if (val === undefined || val === null || val === '' ||
        (Array.isArray(val) && val.length === 0)) {
      issues.errors.push(`Missing required field: ${C.bold}${field}${C.reset}${C.red}`);
    }
  }

  // name: kebab-case
  if (data.name) {
    const name = String(data.name);
    const kebabRE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!kebabRE.test(name)) {
      const normalised = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (FIX_MODE) {
        fixed.name = normalised;
        issues.fixes.push(`name normalised to kebab-case: "${name}" → "${normalised}"`);
      } else {
        issues.errors.push(`name must be kebab-case (lowercase, hyphens only): "${name}"`);
      }
    }
    if (/<[^>]+>/.test(name)) {
      issues.errors.push(`name must not contain XML/HTML tags: "${name}"`);
    }
  }

  // description: max 1024 chars, trim
  if (data.description) {
    let desc = String(data.description);
    if (/^\s+|\s+$/.test(desc)) {
      if (FIX_MODE) {
        fixed.description = desc.trim();
        issues.fixes.push('description: leading/trailing whitespace trimmed');
        desc = fixed.description;
      } else {
        issues.warnings.push('description has leading/trailing whitespace');
      }
    }
    if (desc.length > 1024) {
      issues.errors.push(`description exceeds 1024 chars (${desc.length})`);
    }
    if (/<[^>]+>/.test(desc)) {
      issues.errors.push('description must not contain XML/HTML tags');
    }
    if (desc.length < 10) {
      issues.warnings.push(`description is very short (${desc.length} chars)`);
    }
  }

  // category
  if (data.category) {
    const cat = String(data.category).toLowerCase().trim();
    if (!VALID_CATEGORIES.has(cat)) {
      issues.errors.push(
        `Unknown category: "${data.category}". ` +
        `Valid: ${[...VALID_CATEGORIES].sort().join(', ')}`
      );
    } else if (FIX_MODE && data.category !== cat) {
      fixed.category = cat;
      issues.fixes.push(`category normalised to lowercase: "${data.category}" → "${cat}"`);
    }
  }

  // emoji (optional)
  if (data.emoji !== undefined && data.emoji !== null && data.emoji !== '') {
    if (!isEmoji(String(data.emoji))) {
      issues.warnings.push(`emoji field "${data.emoji}" doesn't appear to be valid`);
    }
  }

  // triggers: array, ≥3 items
  if (data.triggers !== undefined) {
    if (!Array.isArray(data.triggers)) {
      issues.errors.push('triggers must be a YAML list (array)');
    } else {
      if (data.triggers.length < 3) {
        issues.errors.push(`triggers must have ≥3 items (found ${data.triggers.length})`);
      }
      for (const t of data.triggers) {
        if (/<[^>]+>/.test(String(t))) {
          issues.errors.push(`trigger contains XML/HTML tags: "${t}"`);
        }
        if (/^\s+|\s+$/.test(String(t))) {
          if (FIX_MODE) {
            const idx = fixed.triggers.indexOf(t);
            if (idx !== -1) fixed.triggers[idx] = t.trim();
            issues.fixes.push(`trigger trimmed: "${t}"`);
          } else {
            issues.warnings.push(`trigger has whitespace: "${t}"`);
          }
        }
      }
      if (FIX_MODE && fixed.triggers) {
        const sorted = [...fixed.triggers].sort((a, b) =>
          String(a).toLowerCase().localeCompare(String(b).toLowerCase())
        );
        if (sorted.join('|') !== fixed.triggers.join('|')) {
          fixed.triggers = sorted;
          issues.fixes.push('triggers sorted alphabetically');
        }
      }
    }
  }

  // Rebuild source if fixes applied
  let fixedData = null;
  if (FIX_MODE && issues.fixes.length > 0) {
    const newFM = serializeFrontMatter(fixed);
    fixedData = src.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${newFM}\n---`);
  }

  return { issues, fixedData };
}

// ─── File discovery ──────────────────────────────────────────────────────────

function findSkillFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = path.join(dir, entry.name, 'SKILL.md');
    if (fs.existsSync(skillMd)) results.push(skillMd);
  }
  return results.sort();
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log(head('═══ Skill Linter' + (FIX_MODE ? ' (--fix mode)' : '') + ' ═══'));

  const skillFiles = findSkillFiles(SKILLS_DIR);

  if (skillFiles.length === 0) {
    console.log(warn(`No SKILL.md files found in: ${SKILLS_DIR}`));
    process.exit(0);
  }

  console.log(info(`Found ${skillFiles.length} skills in ${SKILLS_DIR}\n`));

  let totalErrors   = 0;
  let totalWarnings = 0;
  let totalFixed    = 0;
  const failedSkills = [];

  for (const skillPath of skillFiles) {
    const skillName = path.basename(path.dirname(skillPath));
    const src = fs.readFileSync(skillPath, 'utf8');

    const { issues, fixedData } = validateSkill(skillPath, src);
    const hasErrors   = issues.errors.length > 0;
    const hasWarnings = issues.warnings.length > 0;
    const hasFixes    = issues.fixes.length > 0;

    totalErrors   += issues.errors.length;
    totalWarnings += issues.warnings.length;

    const status = hasErrors
      ? `${C.red}✖${C.reset}`
      : hasWarnings
        ? `${C.yellow}⚠${C.reset}`
        : `${C.green}✔${C.reset}`;

    console.log(`${status} ${C.bold}${skillName}${C.reset} ${C.dim}(${skillPath})${C.reset}`);

    for (const e of issues.errors)   console.log(`    ${err(e)}`);
    for (const w of issues.warnings) console.log(`    ${warn(w)}`);
    if (VERBOSE || hasFixes) {
      for (const f of issues.fixes) console.log(`    ${fixed(f)}`);
    }

    if (hasErrors) failedSkills.push(skillName);

    if (fixedData && !hasErrors) {
      fs.writeFileSync(skillPath, fixedData, 'utf8');
      totalFixed++;
      if (!VERBOSE) console.log(`    ${fixed(`wrote fixes`)}`);
    }
  }

  console.log(head('═══ Summary ═══'));
  console.log(`Total: ${skillFiles.length} skills`);
  console.log(`${totalErrors > 0 ? C.red : C.green}Errors: ${totalErrors}${C.reset}`);
  console.log(`${totalWarnings > 0 ? C.yellow : C.dim}Warnings: ${totalWarnings}${C.reset}`);
  if (FIX_MODE) console.log(`${C.cyan}Fixed: ${totalFixed} files${C.reset}`);

  if (failedSkills.length > 0) {
    console.log(`\n${C.red}Failed skills:${C.reset}`);
    failedSkills.forEach(s => console.log(`  - ${s}`));
    process.exit(1);
  } else {
    console.log(`\n${ok('All skills passed!')}`);
    process.exit(0);
  }
}

main();
