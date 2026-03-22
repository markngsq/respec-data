#!/usr/bin/env node
/**
 * Windsurf Converter — Merge all Respec skills into single .windsurfrules
 * 
 * Windsurf uses a single .windsurfrules file in the project root.
 * Similar to Aider but with Windsurf-specific formatting.
 * 
 * Usage:
 *   node converters/windsurf.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SKILLS_DIR = path.join(__dirname, '../skills');
const OUTPUT_DIR = path.join(__dirname, '../integrations/windsurf');
const OUTPUT_FILE = path.join(OUTPUT_DIR, '.windsurfrules');

function getAllSkills() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = path.join(SKILLS_DIR, name);
      return fs.statSync(skillPath).isDirectory() && !name.startsWith('_');
    })
    .sort();
}

function extractSkillContent(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  
  if (!fs.existsSync(skillPath)) {
    return null;
  }
  
  const content = fs.readFileSync(skillPath, 'utf8');
  
  // Extract frontmatter and body
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n\n([\s\S]+)/);
  if (!frontmatterMatch) {
    return null;
  }
  
  let frontmatter;
  try {
    frontmatter = yaml.parse(frontmatterMatch[1]);
  } catch (err) {
    console.warn(`⚠ YAML parse error for ${skillName}, skipping`);
    return null;
  }
  const body = frontmatterMatch[2];
  
  return {
    name: frontmatter.displayName || frontmatter.name,
    vibe: frontmatter.vibe || '',
    emoji: frontmatter.emoji || '',
    category: frontmatter.category || '',
    body
  };
}

function buildWindsurfRules() {
  const skills = getAllSkills();
  
  let output = `# Windsurf Coding Rules (Respec Skills)\n\n`;
  output += `${skills.length} coding skills for AI-assisted development.\n`;
  output += `Auto-generated from Respec skill library.\n\n`;
  
  // Group by category
  const skillsByCategory = {};
  for (const skillName of skills) {
    const skill = extractSkillContent(skillName);
    if (!skill) continue;
    
    const category = skill.category || 'general';
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(skill);
  }
  
  // Output by category
  const categories = Object.keys(skillsByCategory).sort();
  
  for (const category of categories) {
    output += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    
    for (const skill of skillsByCategory[category]) {
      output += `### ${skill.emoji} ${skill.name}\n\n`;
      if (skill.vibe) {
        output += `> ${skill.vibe}\n\n`;
      }
      
      // Extract Critical Rules section if present
      const criticalRulesMatch = skill.body.match(/## 🚨 Critical Rules\n\n([\s\S]+?)(?=\n## |$)/);
      if (criticalRulesMatch) {
        output += criticalRulesMatch[1].trim() + '\n\n';
      } else {
        // If no critical rules, include first section
        const firstSection = skill.body.split('\n## ')[1];
        if (firstSection) {
          const sectionContent = firstSection.split('\n\n').slice(0, 3).join('\n\n');
          output += sectionContent + '\n\n';
        }
      }
      
      output += `---\n\n`;
    }
  }
  
  return output;
}

// Main
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('Building .windsurfrules for Windsurf...');
const rulesContent = buildWindsurfRules();

fs.writeFileSync(OUTPUT_FILE, rulesContent);

const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`   Size: ${fileSize} KB`);
console.log('\nTo use in Windsurf:');
console.log(`  cp ${OUTPUT_FILE} ./.windsurfrules`);
