#!/usr/bin/env node
/**
 * check-updates.js — Auto-update notifications
 * Checks for skill updates and alerts users
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SKILLS_DIR = path.resolve(__dirname, '../skills');
const VERSION_FILE = path.resolve(__dirname, '../.skill-versions.json');

// ANSI colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Parse YAML frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  
  const data = {};
  const lines = match[1].split(/\r?\n/);
  let lastKey = null;
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    
    const listItem = line.match(/^(\s*)-\s+(.*)/);
    if (listItem && lastKey) {
      if (!Array.isArray(data[lastKey])) data[lastKey] = [];
      data[lastKey].push(listItem[2].trim());
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
      lastKey = key;
    }
  }
  
  return data;
}

// Get git commit hash for skill
function getCommitHash(skillPath) {
  try {
    return execSync(
      `git log -1 --format=%H "${skillPath}"`,
      { cwd: SKILLS_DIR, encoding: 'utf8' }
    ).trim();
  } catch {
    return null;
  }
}

// Get git commit date
function getCommitDate(skillPath) {
  try {
    return execSync(
      `git log -1 --format=%ai "${skillPath}"`,
      { cwd: SKILLS_DIR, encoding: 'utf8' }
    ).trim();
  } catch {
    return null;
  }
}

// Calculate content hash (ignores whitespace/formatting changes)
function getContentHash(content) {
  // Normalize content: strip YAML frontmatter, collapse whitespace
  const withoutFrontmatter = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const normalized = withoutFrontmatter
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 8);
}

// Load previous versions
function loadVersions() {
  if (!fs.existsSync(VERSION_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  } catch {
    return {};
  }
}

// Save versions
function saveVersions(versions) {
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versions, null, 2));
}

// Scan all skills
function scanSkills() {
  const current = {};
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    
    const skillMdPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) continue;
    
    const commitHash = getCommitHash(skillMdPath);
    const commitDate = getCommitDate(skillMdPath);
    const contentHash = getContentHash(content);
    
    current[entry.name] = {
      name: frontmatter.name || entry.name,
      version: frontmatter.version || '1.0.0',
      commitHash,
      commitDate,
      contentHash,
    };
  }
  
  return current;
}

// Compare versions and detect changes
function detectUpdates(previous, current) {
  const updates = {
    new: [],
    updated: [],
    removed: [],
    unchanged: [],
  };
  
  const prevKeys = Object.keys(previous);
  const currKeys = Object.keys(current);
  
  // New skills
  for (const key of currKeys) {
    if (!prevKeys.includes(key)) {
      updates.new.push({
        id: key,
        ...current[key],
      });
    }
  }
  
  // Removed skills
  for (const key of prevKeys) {
    if (!currKeys.includes(key)) {
      updates.removed.push({
        id: key,
        ...previous[key],
      });
    }
  }
  
  // Updated or unchanged
  for (const key of currKeys) {
    if (!prevKeys.includes(key)) continue; // already handled as new
    
    const prev = previous[key];
    const curr = current[key];
    
    // Check if content changed (ignore whitespace-only changes)
    const contentChanged = prev.contentHash !== curr.contentHash;
    const versionChanged = prev.version !== curr.version;
    const commitChanged = prev.commitHash !== curr.commitHash;
    
    if (contentChanged || versionChanged || commitChanged) {
      updates.updated.push({
        id: key,
        from: prev,
        to: curr,
        changes: {
          content: contentChanged,
          version: versionChanged,
          commit: commitChanged,
        },
      });
    } else {
      updates.unchanged.push({
        id: key,
        ...curr,
      });
    }
  }
  
  return updates;
}

// Generate report
function generateReport(updates, options = {}) {
  const { new: newSkills, updated, removed, unchanged } = updates;
  const total = newSkills.length + updated.length + removed.length + unchanged.length;
  
  console.log(`\n${C.bold}${C.blue}═══ Skill Update Check ═══${C.reset}\n`);
  
  if (options.summary !== false) {
    console.log(`${C.bold}Summary:${C.reset}`);
    console.log(`  Total skills: ${total}`);
    if (newSkills.length > 0) console.log(`  ${C.green}New:${C.reset} ${newSkills.length}`);
    if (updated.length > 0) console.log(`  ${C.yellow}Updated:${C.reset} ${updated.length}`);
    if (removed.length > 0) console.log(`  ${C.dim}Removed:${C.reset} ${removed.length}`);
    console.log(`  ${C.dim}Unchanged:${C.reset} ${unchanged.length}`);
  }
  
  if (newSkills.length > 0) {
    console.log(`\n${C.bold}${C.green}New Skills:${C.reset}\n`);
    newSkills.forEach(skill => {
      console.log(`  ${C.green}+${C.reset} ${skill.name} (${skill.id})`);
      if (skill.commitDate) {
        console.log(`    ${C.dim}Added: ${new Date(skill.commitDate).toLocaleDateString()}${C.reset}`);
      }
    });
  }
  
  if (updated.length > 0) {
    console.log(`\n${C.bold}${C.yellow}Updated Skills:${C.reset}\n`);
    updated.forEach(skill => {
      console.log(`  ${C.yellow}~${C.reset} ${skill.to.name} (${skill.id})`);
      
      const changes = [];
      if (skill.changes.version) {
        changes.push(`${skill.from.version} → ${skill.to.version}`);
      }
      if (skill.changes.content) {
        changes.push('content changed');
      }
      if (skill.changes.commit && !skill.changes.content) {
        changes.push('metadata updated');
      }
      
      if (changes.length > 0) {
        console.log(`    ${C.dim}${changes.join(', ')}${C.reset}`);
      }
      
      if (skill.to.commitDate) {
        console.log(`    ${C.dim}Updated: ${new Date(skill.to.commitDate).toLocaleDateString()}${C.reset}`);
      }
    });
  }
  
  if (removed.length > 0) {
    console.log(`\n${C.bold}${C.dim}Removed Skills:${C.reset}\n`);
    removed.forEach(skill => {
      console.log(`  ${C.dim}-${C.reset} ${skill.name} (${skill.id})`);
    });
  }
  
  if (options.recommendations !== false && (newSkills.length > 0 || updated.length > 0)) {
    console.log(`\n${C.bold}Recommendations:${C.reset}\n`);
    
    if (newSkills.length > 0) {
      console.log(`  ${C.green}▸ ${newSkills.length} new skill${newSkills.length > 1 ? 's' : ''} available${C.reset}`);
      console.log(`    Run ${C.cyan}respec install <skill-name>${C.reset} to add`);
    }
    
    if (updated.length > 0) {
      console.log(`  ${C.yellow}▸ ${updated.length} skill${updated.length > 1 ? 's have' : ' has'} updates${C.reset}`);
      console.log(`    Run ${C.cyan}respec update${C.reset} to sync`);
    }
  }
  
  console.log('');
}

// Main
function main() {
  const args = process.argv.slice(2);
  const options = {
    save: !args.includes('--no-save'),
    summary: !args.includes('--no-summary'),
    recommendations: !args.includes('--no-recommendations'),
    json: args.includes('--json'),
  };
  
  const previous = loadVersions();
  const current = scanSkills();
  const updates = detectUpdates(previous, current);
  
  if (options.json) {
    console.log(JSON.stringify(updates, null, 2));
  } else {
    generateReport(updates, options);
  }
  
  if (options.save) {
    saveVersions(current);
  }
  
  // Exit with code 1 if updates available (for CI)
  const hasUpdates = updates.new.length > 0 || updates.updated.length > 0;
  process.exit(hasUpdates && args.includes('--ci') ? 1 : 0);
}

main();
