#!/usr/bin/env node
/**
 * health-check.js — Skill Health Dashboard
 * Analyzes all skills for quality, completeness, and maintenance status
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILLS_DIR = path.resolve(__dirname, '../skills');

// ANSI colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

// Get last modified date from git
function getLastModified(skillPath) {
  try {
    const result = execSync(
      `git log -1 --format=%ai "${skillPath}"`,
      { cwd: SKILLS_DIR, encoding: 'utf8' }
    ).trim();
    return result ? new Date(result) : null;
  } catch {
    return null;
  }
}

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

// Calculate quality score (0-100)
function calculateQualityScore(skillPath, frontmatter, content) {
  let score = 0;
  const issues = [];
  
  // Frontmatter completeness (40 points)
  const requiredFields = ['name', 'description', 'category', 'triggers'];
  const optionalFields = ['emoji', 'vibe', 'tags'];
  
  requiredFields.forEach(field => {
    if (frontmatter[field]) {
      score += 10;
    } else {
      issues.push(`Missing required field: ${field}`);
    }
  });
  
  optionalFields.forEach(field => {
    if (frontmatter[field]) score += 5;
  });
  
  // Description quality (10 points)
  if (frontmatter.description) {
    const desc = frontmatter.description;
    if (desc.length >= 100 && desc.length <= 1024) score += 5;
    if (desc.includes('when') || desc.includes('use')) score += 5;
  }
  
  // Triggers completeness (15 points)
  if (Array.isArray(frontmatter.triggers)) {
    if (frontmatter.triggers.length >= 3) score += 10;
    if (frontmatter.triggers.length >= 5) score += 5;
  }
  
  // Code examples (20 points)
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  if (codeBlockCount >= 1) score += 10;
  if (codeBlockCount >= 3) score += 10;
  
  // Documentation structure (15 points)
  const hasHeadings = /^#+\s+/m.test(content);
  const hasSections = (content.match(/^##\s+/gm) || []).length >= 3;
  if (hasHeadings) score += 5;
  if (hasSections) score += 10;
  
  return { score: Math.min(100, score), issues };
}

// Check if skill is stale (>6 months since update)
function isStale(lastModified) {
  if (!lastModified) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return lastModified < sixMonthsAgo;
}

// Analyze all skills
function analyzeSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`${C.red}Skills directory not found: ${SKILLS_DIR}${C.reset}`);
    process.exit(1);
  }
  
  const results = [];
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    
    const skillMdPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      results.push({
        name: entry.name,
        status: 'error',
        message: 'Missing SKILL.md',
        score: 0,
      });
      continue;
    }
    
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    
    if (!frontmatter) {
      results.push({
        name: entry.name,
        status: 'error',
        message: 'Invalid YAML frontmatter',
        score: 0,
      });
      continue;
    }
    
    const lastModified = getLastModified(skillMdPath);
    const { score, issues } = calculateQualityScore(skillMdPath, frontmatter, content);
    const stale = isStale(lastModified);
    const deprecated = frontmatter.deprecated === 'true' || frontmatter.deprecated === true;
    
    results.push({
      name: entry.name,
      status: deprecated ? 'deprecated' : stale ? 'stale' : score < 50 ? 'poor' : score < 80 ? 'good' : 'excellent',
      score,
      lastModified,
      stale,
      deprecated,
      issues,
      frontmatter,
    });
  }
  
  return results.sort((a, b) => a.score - b.score);
}

// Generate report
function generateReport(results) {
  console.log(`\n${C.bold}${C.blue}═══ Skill Health Dashboard ═══${C.reset}\n`);
  
  const total = results.length;
  const excellent = results.filter(r => r.score >= 80).length;
  const good = results.filter(r => r.score >= 50 && r.score < 80).length;
  const poor = results.filter(r => r.score < 50).length;
  const stale = results.filter(r => r.stale).length;
  const deprecated = results.filter(r => r.deprecated).length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`${C.bold}Summary:${C.reset}`);
  console.log(`  Total skills: ${total}`);
  console.log(`  ${C.green}Excellent (≥80):${C.reset} ${excellent}`);
  console.log(`  ${C.blue}Good (50-79):${C.reset} ${good}`);
  console.log(`  ${C.yellow}Poor (<50):${C.reset} ${poor}`);
  console.log(`  ${C.dim}Stale (>6mo):${C.reset} ${stale}`);
  console.log(`  ${C.dim}Deprecated:${C.reset} ${deprecated}`);
  if (errors > 0) console.log(`  ${C.red}Errors:${C.reset} ${errors}`);
  
  console.log(`\n${C.bold}Skills by Quality:${C.reset}\n`);
  
  for (const skill of results) {
    const statusColor = 
      skill.status === 'excellent' ? C.green :
      skill.status === 'good' ? C.blue :
      skill.status === 'poor' ? C.yellow :
      skill.status === 'deprecated' ? C.dim :
      skill.status === 'stale' ? C.dim :
      C.red;
    
    const scoreStr = skill.score !== undefined ? `${skill.score}%`.padStart(4) : 'N/A ';
    const statusStr = skill.status.padEnd(10);
    const nameStr = skill.name.padEnd(35);
    
    console.log(`  ${statusColor}${scoreStr}${C.reset}  ${statusStr}  ${nameStr}`);
    
    if (skill.stale && skill.lastModified) {
      const monthsAgo = Math.floor((Date.now() - skill.lastModified) / (1000 * 60 * 60 * 24 * 30));
      console.log(`         ${C.dim}⚠ Last updated ${monthsAgo} months ago${C.reset}`);
    }
    
    if (skill.deprecated) {
      console.log(`         ${C.dim}⚠ Deprecated${C.reset}`);
    }
    
    if (skill.issues && skill.issues.length > 0 && skill.score < 80) {
      skill.issues.slice(0, 2).forEach(issue => {
        console.log(`         ${C.dim}• ${issue}${C.reset}`);
      });
    }
  }
  
  console.log(`\n${C.bold}Recommendations:${C.reset}\n`);
  
  const needsWork = results.filter(r => r.score < 50 && r.status !== 'error');
  if (needsWork.length > 0) {
    console.log(`  ${C.yellow}▸ ${needsWork.length} skills need quality improvements${C.reset}`);
    needsWork.slice(0, 3).forEach(s => {
      console.log(`    - ${s.name} (${s.score}%)`);
    });
  }
  
  const staleSkills = results.filter(r => r.stale && !r.deprecated);
  if (staleSkills.length > 0) {
    console.log(`  ${C.dim}▸ ${staleSkills.length} skills haven't been updated in 6+ months${C.reset}`);
    staleSkills.slice(0, 3).forEach(s => {
      console.log(`    - ${s.name}`);
    });
  }
  
  if (errors > 0) {
    console.log(`  ${C.red}▸ ${errors} skills have errors (missing SKILL.md or invalid YAML)${C.reset}`);
  }
  
  console.log('');
}

// Main
const results = analyzeSkills();
generateReport(results);

// Exit with error if any critical issues
const criticalIssues = results.filter(r => r.status === 'error').length;
process.exit(criticalIssues > 0 ? 1 : 0);
