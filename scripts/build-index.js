#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.resolve(__dirname, '../skills');
const OUTPUT_FILE = path.resolve(__dirname, '../capabilities.json');

// Synonym map
const SYNONYMS = {
  database: ['sql', 'orm', 'prisma', 'postgres', 'mysql', 'sqlite'],
  react: ['jsx', 'hooks', 'components', 'nextjs'],
  nextjs: ['react', 'next', 'app-router'],
  css: ['style', 'tailwind', 'design'],
  frontend: ['ui', 'react', 'nextjs'],
  backend: ['api', 'server', 'node'],
  api: ['backend', 'rest', 'graphql'],
  test: ['testing', 'jest', 'vitest', 'playwright'],
  docker: ['container', 'devops'],
  security: ['auth', 'oauth'],
  performance: ['optimize', 'speed'],
  llm: ['ai', 'gpt', 'claude', 'prompt'],
  git: ['version-control', 'branch'],
  docs: ['documentation', 'readme'],
  typescript: ['ts', 'javascript'],
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'be', 'have', 'has',
  'do', 'will', 'when', 'where', 'that', 'this', 'use', 'how', 'what',
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/[\s\-]+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function expandWithSynonyms(tokens) {
  const expanded = new Set(tokens);
  for (const t of tokens) {
    const syns = SYNONYMS[t];
    if (syns) syns.forEach(s => expanded.add(s));
  }
  return [...expanded];
}

function parseSkillMd(content, skillName) {
  const lines = content.split('\n');
  const result = {
    name: skillName,
    title: '',
    description: '',
    triggers: [],
    keywords: [],
  };

  let descLines = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!result.title && trimmed.startsWith('# ')) {
      result.title = trimmed.replace(/^#\s+/, '');
    }
    if (trimmed && trimmed.length > 30 && !trimmed.startsWith('#')) {
      descLines.push(trimmed);
    }
    if (/use when/i.test(trimmed)) {
      result.triggers.push(trimmed.replace(/.*use when\s*/i, ''));
    }
  }

  result.description = descLines.slice(0, 3).join(' ');
  const allText = [result.title, result.description, ...result.triggers].join(' ');
  result.keywords = [...new Set(expandWithSynonyms(tokenize(allText)))];

  return result;
}

function scanSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Skills directory not found: ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skills = [];
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;

    const content = fs.readFileSync(skillMdPath, 'utf8');
    skills.push(parseSkillMd(content, entry.name));
  }

  return skills;
}

function buildInvertedIndex(skills) {
  const index = {};

  for (const skill of skills) {
    const weights = {};

    tokenize(skill.title).forEach(t => {
      weights[t] = (weights[t] || 0) + 10;
    });

    skill.triggers.forEach(tr => {
      tokenize(tr).forEach(t => {
        weights[t] = (weights[t] || 0) + 5;
      });
    });

    tokenize(skill.description).forEach(t => {
      weights[t] = (weights[t] || 0) + 3;
    });

    skill.keywords.forEach(k => {
      if (!(k in weights)) weights[k] = 1;
    });

    for (const [token, weight] of Object.entries(weights)) {
      if (!index[token]) index[token] = [];
      index[token].push({ skill: skill.name, weight });
    }
  }

  for (const token of Object.keys(index)) {
    index[token].sort((a, b) => b.weight - a.weight);
  }

  return index;
}

function detectConflicts(skills, index) {
  const conflicts = [];
  const seen = new Set();

  for (const [token, postings] of Object.entries(index)) {
    if (postings.length < 2) continue;
    const highWeight = postings.filter(p => p.weight >= 5);
    if (highWeight.length < 2) continue;

    for (let i = 0; i < highWeight.length; i++) {
      for (let j = i + 1; j < highWeight.length; j++) {
        const a = highWeight[i].skill;
        const b = highWeight[j].skill;
        const key = [a, b].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);

        const tokensA = new Set(skills.find(s => s.name === a)?.keywords || []);
        const tokensB = new Set(skills.find(s => s.name === b)?.keywords || []);
        const shared = [...tokensA].filter(t => tokensB.has(t)).length;
        const overlap = shared / Math.min(tokensA.size, tokensB.size);

        if (overlap > 0.4) {
          conflicts.push({
            skills: [a, b],
            sharedTokens: shared,
            overlapRatio: Math.round(overlap * 100) / 100,
            severity: overlap > 0.7 ? 'high' : overlap > 0.55 ? 'medium' : 'low',
          });
        }
      }
    }
  }

  return conflicts.sort((a, b) => b.overlapRatio - a.overlapRatio);
}

function main() {
  const startTime = Date.now();
  console.log('🔍 Scanning skills...');

  const skills = scanSkills();
  console.log(`   Found ${skills.length} skills`);

  console.log('📇 Building inverted index...');
  const index = buildInvertedIndex(skills);
  const tokenCount = Object.keys(index).length;
  console.log(`   Indexed ${tokenCount} unique tokens`);

  console.log('⚠️  Detecting conflicts...');
  const conflicts = detectConflicts(skills, index);
  console.log(`   Found ${conflicts.length} potential overlaps`);

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      skillCount: skills.length,
      tokenCount,
      conflictCount: conflicts.length,
      buildTimeMs: Date.now() - startTime,
    },
    skills: skills.reduce((acc, s) => {
      acc[s.name] = {
        title: s.title,
        description: s.description,
        triggers: s.triggers,
        keywords: s.keywords,
      };
      return acc;
    }, {}),
    index,
    conflicts,
    synonyms: SYNONYMS,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`✅ Wrote ${OUTPUT_FILE} (${Math.round(fs.statSync(OUTPUT_FILE).size / 1024)}KB)`);
  console.log(`   Build time: ${Date.now() - startTime}ms`);
}

main();
