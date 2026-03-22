#!/usr/bin/env node
/**
 * GitHub Copilot Converter — Direct copy to ~/.copilot/agents/
 * 
 * Copilot supports .md files in ~/.copilot/agents/ directory.
 * We can copy SKILL.md files directly with minimal conversion.
 * 
 * Usage:
 *   node converters/copilot.js <skill-name>
 *   node converters/copilot.js --all
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../skills');
const OUTPUT_DIR = path.join(__dirname, '../integrations/copilot');

function convertSkillToCopilot(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  
  if (!fs.existsSync(skillPath)) {
    console.error(`❌ Skill ${skillName} not found`);
    return false;
  }
  
  const content = fs.readFileSync(skillPath, 'utf8');
  
  // Copilot uses .md files directly
  // Just copy with a README explaining context
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${skillName}.md`);
  fs.writeFileSync(outputPath, content);
  
  console.log(`✅ ${skillName} → ${outputPath}`);
  return true;
}

function convertAll() {
  const skills = fs.readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = path.join(SKILLS_DIR, name);
      return fs.statSync(skillPath).isDirectory() && !name.startsWith('_');
    });
  
  let success = 0;
  let failed = 0;
  
  for (const skill of skills) {
    if (convertSkillToCopilot(skill)) {
      success++;
    } else {
      failed++;
    }
  }
  
  // Create README
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  const readme = `# Respec Skills for GitHub Copilot

${success} skills exported from Respec skill library.

## Installation

Copy all .md files to your Copilot agents directory:

\`\`\`bash
mkdir -p ~/.copilot/agents
cp *.md ~/.copilot/agents/
\`\`\`

## Usage

Copilot will automatically load these skills as context when relevant.

## Skills Included

${skills.map(s => `- ${s}`).join('\n')}
`;
  
  fs.writeFileSync(readmePath, readme);
  
  console.log(`\n✅ Converted ${success} skills to Copilot format`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} skills`);
  }
  console.log(`\nOutput: ${OUTPUT_DIR}/`);
  console.log('\nTo use in GitHub Copilot:');
  console.log(`  mkdir -p ~/.copilot/agents`);
  console.log(`  cp ${OUTPUT_DIR}/*.md ~/.copilot/agents/`);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log('Usage:');
  console.log('  node converters/copilot.js <skill-name>');
  console.log('  node converters/copilot.js --all');
  process.exit(args[0] === '--help' ? 0 : 1);
}

if (args[0] === '--all') {
  convertAll();
} else {
  const skillName = args[0];
  if (convertSkillToCopilot(skillName)) {
    console.log('\nTo use in GitHub Copilot:');
    console.log(`  mkdir -p ~/.copilot/agents`);
    console.log(`  cp ${OUTPUT_DIR}/${skillName}.md ~/.copilot/agents/`);
  } else {
    process.exit(1);
  }
}
