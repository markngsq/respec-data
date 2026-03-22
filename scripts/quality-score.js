#!/usr/bin/env node
/**
 * quality-score.js — Comprehensive quality scoring for skills
 * Generates detailed quality reports with actionable recommendations
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

// Detailed quality scoring with breakdowns
function scoreSkill(skillPath, skillId) {
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  
  if (!fs.existsSync(skillMdPath)) {
    return {
      id: skillId,
      error: 'Missing SKILL.md',
      totalScore: 0,
    };
  }
  
  const content = fs.readFileSync(skillMdPath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  
  if (!frontmatter) {
    return {
      id: skillId,
      error: 'Invalid YAML frontmatter',
      totalScore: 0,
    };
  }
  
  const scores = {
    frontmatter: 0, // 30pts
    description: 0, // 15pts
    triggers: 0,    // 15pts
    examples: 0,    // 20pts
    structure: 0,   // 15pts
    maintenance: 0, // 5pts
  };
  
  const feedback = [];
  
  // Frontmatter completeness (30pts)
  const required = ['name', 'description', 'category', 'triggers'];
  const optional = ['emoji', 'vibe', 'tags', 'version'];
  
  required.forEach(field => {
    if (frontmatter[field]) {
      scores.frontmatter += 7.5;
    } else {
      feedback.push({
        category: 'frontmatter',
        severity: 'high',
        message: `Missing required field: ${field}`,
      });
    }
  });
  
  optional.forEach(field => {
    if (frontmatter[field]) scores.frontmatter += 1.5;
  });
  
  // Description quality (15pts)
  if (frontmatter.description) {
    const desc = frontmatter.description;
    const len = desc.length;
    
    if (len >= 100 && len <= 1024) {
      scores.description += 5;
    } else if (len < 100) {
      feedback.push({
        category: 'description',
        severity: 'medium',
        message: `Description too short (${len} chars, recommend 100-1024)`,
      });
    } else {
      feedback.push({
        category: 'description',
        severity: 'low',
        message: `Description too long (${len} chars, recommend 100-1024)`,
      });
      scores.description += 3;
    }
    
    // Check for "when to use" guidance
    if (desc.toLowerCase().includes('when') || desc.toLowerCase().includes('use')) {
      scores.description += 5;
    } else {
      feedback.push({
        category: 'description',
        severity: 'high',
        message: 'Description should include "when to use" guidance',
      });
    }
    
    // Check for trigger phrases
    const triggerPhrases = ['create', 'build', 'implement', 'design', 'analyze', 'optimize'];
    const hasTriggers = triggerPhrases.some(p => desc.toLowerCase().includes(p));
    if (hasTriggers) {
      scores.description += 5;
    } else {
      feedback.push({
        category: 'description',
        severity: 'medium',
        message: 'Description should include action trigger phrases',
      });
    }
  }
  
  // Triggers completeness (15pts)
  if (Array.isArray(frontmatter.triggers)) {
    const count = frontmatter.triggers.length;
    if (count >= 5) {
      scores.triggers = 15;
    } else if (count >= 3) {
      scores.triggers = 10;
      feedback.push({
        category: 'triggers',
        severity: 'low',
        message: `Add ${5 - count} more trigger phrases (currently ${count}, recommend ≥5)`,
      });
    } else {
      scores.triggers = 5;
      feedback.push({
        category: 'triggers',
        severity: 'high',
        message: `Need more triggers (currently ${count}, minimum 3)`,
      });
    }
  } else {
    feedback.push({
      category: 'triggers',
      severity: 'high',
      message: 'No triggers defined',
    });
  }
  
  // Code examples (20pts)
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  if (codeBlocks >= 5) {
    scores.examples = 20;
  } else if (codeBlocks >= 3) {
    scores.examples = 15;
  } else if (codeBlocks >= 1) {
    scores.examples = 10;
    feedback.push({
      category: 'examples',
      severity: 'medium',
      message: `Add ${3 - Math.floor(codeBlocks)} more code examples (currently ${Math.floor(codeBlocks)})`,
    });
  } else {
    feedback.push({
      category: 'examples',
      severity: 'high',
      message: 'No code examples found',
    });
  }
  
  // Documentation structure (15pts)
  const sections = (content.match(/^##\s+/gm) || []).length;
  if (sections >= 5) {
    scores.structure = 15;
  } else if (sections >= 3) {
    scores.structure = 10;
  } else if (sections >= 1) {
    scores.structure = 5;
    feedback.push({
      category: 'structure',
      severity: 'medium',
      message: `Add ${3 - sections} more sections (currently ${sections}, recommend ≥3)`,
    });
  } else {
    feedback.push({
      category: 'structure',
      severity: 'high',
      message: 'No clear section structure',
    });
  }
  
  // Maintenance indicators (5pts)
  if (frontmatter.version) scores.maintenance += 2;
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) scores.maintenance += 2;
  if (frontmatter.dependencies) scores.maintenance += 1;
  
  const totalScore = Math.round(
    scores.frontmatter +
    scores.description +
    scores.triggers +
    scores.examples +
    scores.structure +
    scores.maintenance
  );
  
  return {
    id: skillId,
    totalScore,
    scores,
    feedback,
    grade: totalScore >= 90 ? 'A' :
           totalScore >= 80 ? 'B' :
           totalScore >= 70 ? 'C' :
           totalScore >= 60 ? 'D' : 'F',
  };
}

// Generate detailed report for single skill
function generateSkillReport(skillId) {
  const skillPath = path.join(SKILLS_DIR, skillId);
  const result = scoreSkill(skillPath, skillId);
  
  if (result.error) {
    console.log(`\n${C.red}Error: ${result.error}${C.reset}\n`);
    return;
  }
  
  const gradeColor = result.grade === 'A' ? C.green :
                     result.grade === 'B' ? C.blue :
                     result.grade === 'C' ? C.yellow :
                     C.red;
  
  console.log(`\n${C.bold}Quality Score: ${skillId}${C.reset}\n`);
  console.log(`  ${C.bold}Overall:${C.reset} ${gradeColor}${result.grade} (${result.totalScore}/100)${C.reset}\n`);
  
  console.log(`  ${C.bold}Breakdown:${C.reset}`);
  console.log(`    Frontmatter:   ${result.scores.frontmatter.toFixed(1)}/30`);
  console.log(`    Description:   ${result.scores.description.toFixed(1)}/15`);
  console.log(`    Triggers:      ${result.scores.triggers.toFixed(1)}/15`);
  console.log(`    Examples:      ${result.scores.examples.toFixed(1)}/20`);
  console.log(`    Structure:     ${result.scores.structure.toFixed(1)}/15`);
  console.log(`    Maintenance:   ${result.scores.maintenance.toFixed(1)}/5`);
  
  if (result.feedback.length > 0) {
    console.log(`\n  ${C.bold}Recommendations:${C.reset}\n`);
    
    const high = result.feedback.filter(f => f.severity === 'high');
    const medium = result.feedback.filter(f => f.severity === 'medium');
    const low = result.feedback.filter(f => f.severity === 'low');
    
    if (high.length > 0) {
      console.log(`    ${C.red}High priority (${high.length}):${C.reset}`);
      high.forEach(f => console.log(`      • ${f.message}`));
    }
    
    if (medium.length > 0) {
      console.log(`    ${C.yellow}Medium priority (${medium.length}):${C.reset}`);
      medium.forEach(f => console.log(`      • ${f.message}`));
    }
    
    if (low.length > 0) {
      console.log(`    ${C.dim}Low priority (${low.length}):${C.reset}`);
      low.forEach(f => console.log(`      • ${f.message}`));
    }
  }
  
  console.log('');
}

// Generate summary report for all skills
function generateSummaryReport() {
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const results = [];
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    
    const skillPath = path.join(SKILLS_DIR, entry.name);
    const result = scoreSkill(skillPath, entry.name);
    results.push(result);
  }
  
  results.sort((a, b) => b.totalScore - a.totalScore);
  
  console.log(`\n${C.bold}${C.blue}Quality Score Summary${C.reset}\n`);
  
  const byGrade = {
    A: results.filter(r => r.grade === 'A'),
    B: results.filter(r => r.grade === 'B'),
    C: results.filter(r => r.grade === 'C'),
    D: results.filter(r => r.grade === 'D'),
    F: results.filter(r => r.grade === 'F'),
  };
  
  const avg = Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / results.length);
  
  console.log(`${C.bold}Distribution:${C.reset}`);
  console.log(`  ${C.green}A (90-100):${C.reset} ${byGrade.A.length} skills`);
  console.log(`  ${C.blue}B (80-89):${C.reset}  ${byGrade.B.length} skills`);
  console.log(`  ${C.yellow}C (70-79):${C.reset}  ${byGrade.C.length} skills`);
  console.log(`  ${C.yellow}D (60-69):${C.reset}  ${byGrade.D.length} skills`);
  console.log(`  ${C.red}F (<60):${C.reset}    ${byGrade.F.length} skills`);
  console.log(`  ${C.dim}Average:${C.reset}   ${avg}/100`);
  
  console.log(`\n${C.bold}Needs Improvement (Grade C or below):${C.reset}\n`);
  
  const needsWork = [...byGrade.C, ...byGrade.D, ...byGrade.F].slice(0, 10);
  needsWork.forEach(skill => {
    const gradeColor = skill.grade === 'C' ? C.yellow : C.red;
    console.log(`  ${gradeColor}${skill.grade}${C.reset} ${skill.totalScore}% ${skill.id}`);
  });
  
  console.log('');
}

// Main
function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const skillArg = args.find(a => !a.startsWith('--'));

  if (jsonMode) {
    if (skillArg) {
      // Single skill JSON
      const skillPath = path.join(SKILLS_DIR, skillArg);
      const result = scoreSkill(skillPath, skillArg);
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Summary JSON for all skills
      const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
      const results = [];
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
        const skillPath = path.join(SKILLS_DIR, entry.name);
        results.push(scoreSkill(skillPath, entry.name));
      }
      results.sort((a, b) => b.totalScore - a.totalScore);

      const byGrade = {
        A: results.filter(r => r.grade === 'A').length,
        B: results.filter(r => r.grade === 'B').length,
        C: results.filter(r => r.grade === 'C').length,
        D: results.filter(r => r.grade === 'D').length,
        F: results.filter(r => r.grade === 'F').length,
      };
      const avg = Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / results.length);

      console.log(JSON.stringify({
        summary: { ...byGrade, average: avg, total: results.length },
        skills: results,
      }, null, 2));
    }
    return;
  }

  if (skillArg) {
    generateSkillReport(skillArg);
  } else {
    generateSummaryReport();
  }
}

main();
