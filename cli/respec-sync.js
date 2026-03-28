#!/usr/bin/env node
/**
 * Respec CLI - Sync Command
 * 
 * Usage:
 *   respec sync <skill-name>       Sync a single skill to Drive
 *   respec sync --all              Sync all skills to Drive
 *   respec sync --status           Show sync status
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const CONFIG_FILE = resolve(homedir(), '.openclaw/workspace/respec-data/protocols/gws-cli/config.json');
const SKILLS_DIR = resolve(homedir(), '.openclaw/workspace/respec-data/skills');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function loadConfig() {
  if (!existsSync(CONFIG_FILE)) {
    log('Error: GWS config not found. Run setup first.', 'red');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
}

function getUserFolder(config) {
  const usersRootId = config.folders.users;
  
  // Get user email from gws auth
  const authStatus = JSON.parse(
    execSync('gws auth status 2>&1 | tail -n +2', { encoding: 'utf-8' })
  );
  const userEmail = authStatus.user;
  
  // Check if user folder exists
  const listResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${usersRootId}\\" in parents and name = \\"${userEmail}\\" and trashed = false", "fields": "files(id,name)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  let userFolderId;
  if (listResult.files && listResult.files.length > 0) {
    userFolderId = listResult.files[0].id;
  } else {
    log(`Creating user folder for ${userEmail}...`, 'blue');
    const createResult = JSON.parse(
      execSync(
        `gws drive files create --json '{"name": "${userEmail}", "mimeType": "application/vnd.google-apps.folder", "parents": ["${usersRootId}"]}' 2>&1 | tail -n +2`,
        { encoding: 'utf-8' }
      )
    );
    userFolderId = createResult.id;
  }
  
  // Check if skills folder exists
  const skillsListResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${userFolderId}\\" in parents and name = \\"skills\\" and trashed = false", "fields": "files(id,name)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  let skillsFolderId;
  if (skillsListResult.files && skillsListResult.files.length > 0) {
    skillsFolderId = skillsListResult.files[0].id;
  } else {
    log('Creating skills folder...', 'blue');
    const createResult = JSON.parse(
      execSync(
        `gws drive files create --json '{"name": "skills", "mimeType": "application/vnd.google-apps.folder", "parents": ["${userFolderId}"]}' 2>&1 | tail -n +2`,
        { encoding: 'utf-8' }
      )
    );
    skillsFolderId = createResult.id;
  }
  
  return { userFolderId, skillsFolderId, userEmail };
}

function syncSkill(skillName, skillsFolderId) {
  const skillPath = join(SKILLS_DIR, skillName);
  
  if (!existsSync(skillPath)) {
    log(`Error: Skill '${skillName}' not found`, 'red');
    return false;
  }
  
  if (!statSync(skillPath).isDirectory()) {
    return false; // Skip non-directories
  }
  
  const skillMdPath = join(skillPath, 'SKILL.md');
  if (!existsSync(skillMdPath)) {
    log(`Warning: ${skillName} has no SKILL.md, skipping`, 'yellow');
    return false;
  }
  
  log(`Syncing ${skillName}...`, 'blue');
  
  // Check if skill folder exists in Drive
  const listResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${skillsFolderId}\\" in parents and name = \\"${skillName}\\" and trashed = false", "fields": "files(id,name)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  let skillFolderId;
  if (listResult.files && listResult.files.length > 0) {
    skillFolderId = listResult.files[0].id;
  } else {
    const createResult = JSON.parse(
      execSync(
        `gws drive files create --json '{"name": "${skillName}", "mimeType": "application/vnd.google-apps.folder", "parents": ["${skillsFolderId}"]}' 2>&1 | tail -n +2`,
        { encoding: 'utf-8' }
      )
    );
    skillFolderId = createResult.id;
  }
  
  // Check if SKILL.md exists in Drive
  const fileListResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${skillFolderId}\\" in parents and name = \\"SKILL.md\\" and trashed = false", "fields": "files(id,name,modifiedTime)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  if (fileListResult.files && fileListResult.files.length > 0) {
    // Update existing file
    const fileId = fileListResult.files[0].id;
    execSync(
      `gws drive files update --params '{"fileId": "${fileId}"}' --upload "${skillMdPath}" --upload-content-type text/markdown`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    log(`  ✓ Updated SKILL.md`, 'green');
  } else {
    // Create new file
    execSync(
      `gws drive files create --json '{"name": "SKILL.md", "parents": ["${skillFolderId}"], "mimeType": "text/markdown"}' --upload "${skillMdPath}" --upload-content-type text/markdown`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    log(`  ✓ Uploaded SKILL.md`, 'green');
  }
  
  return true;
}

function getAllSkills() {
  return readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = join(SKILLS_DIR, name);
      return statSync(skillPath).isDirectory() && existsSync(join(skillPath, 'SKILL.md'));
    });
}

function showStatus(config) {
  const { userEmail, skillsFolderId } = getUserFolder(config);
  
  log(`\nSync Status for ${userEmail}`, 'blue');
  log('─'.repeat(60), 'dim');
  
  // List all skills in Drive
  const driveSkills = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${skillsFolderId}\\" in parents and trashed = false", "fields": "files(id,name,modifiedTime)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  const localSkills = getAllSkills();
  
  log(`\nLocal skills: ${localSkills.length}`, 'dim');
  log(`Drive skills: ${driveSkills.files?.length || 0}`, 'dim');
  log('');
  
  // Show synced skills
  const synced = driveSkills.files || [];
  const syncedNames = synced.map(f => f.name);
  const notSynced = localSkills.filter(name => !syncedNames.includes(name));
  
  if (synced.length > 0) {
    log('Synced to Drive:', 'green');
    synced.forEach(file => {
      const date = new Date(file.modifiedTime).toLocaleString();
      log(`  ✓ ${file.name} ${colors.dim}(${date})${colors.reset}`, 'green');
    });
  }
  
  if (notSynced.length > 0) {
    log('\nNot synced:', 'yellow');
    notSynced.forEach(name => {
      log(`  ○ ${name}`, 'yellow');
    });
  }
  
  log('');
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
Respec CLI - Skill Sync

Usage:
  respec sync <skill-name>    Sync a single skill to Drive
  respec sync --all           Sync all skills to Drive
  respec sync --status        Show sync status
  respec sync --help          Show this help

Examples:
  respec sync nextjs          Sync just the nextjs skill
  respec sync --all           Sync all skills in respec-data/skills/
  respec sync --status        See what's synced vs local
  `);
  process.exit(0);
}

const config = loadConfig();

if (command === '--status') {
  showStatus(config);
} else if (command === '--all') {
  const { skillsFolderId } = getUserFolder(config);
  const skills = getAllSkills();
  
  log(`\nSyncing ${skills.length} skills to Drive...`, 'blue');
  log('─'.repeat(60), 'dim');
  
  let synced = 0;
  for (const skillName of skills) {
    if (syncSkill(skillName, skillsFolderId)) {
      synced++;
    }
  }
  
  log('─'.repeat(60), 'dim');
  log(`\n✓ Synced ${synced}/${skills.length} skills\n`, 'green');
} else {
  // Sync single skill
  const skillName = command;
  const { skillsFolderId } = getUserFolder(config);
  
  if (syncSkill(skillName, skillsFolderId)) {
    log(`\n✓ ${skillName} synced successfully\n`, 'green');
  } else {
    process.exit(1);
  }
}
