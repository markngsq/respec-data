#!/usr/bin/env node
/**
 * Respec CLI - Contribute Command
 * 
 * Usage:
 *   respec contribute submit <skill-name>    Submit a skill for review
 *   respec contribute list                    List pending contributions
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const CONFIG_FILE = resolve(homedir(), '.openclaw/workspace/respec-data/protocols/gws-cli/config.json');
const SKILLS_DIR = resolve(homedir(), '.openclaw/workspace/respec-data/skills');
const GITHUB_TOKEN_FILE = resolve(homedir(), '.openclaw/workspace/credentials/github.json');

// Colors
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
    log('Error: GWS config not found', 'red');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
}

function loadGitHubToken() {
  if (!existsSync(GITHUB_TOKEN_FILE)) {
    log('Error: GitHub token not found at credentials/github.json', 'red');
    log('Create the file with: {"pat": "ghp_..."}', 'dim');
    process.exit(1);
  }
  const creds = JSON.parse(readFileSync(GITHUB_TOKEN_FILE, 'utf-8'));
  return creds.pat || creds.token;
}

function validateSkill(skillName) {
  const skillPath = join(SKILLS_DIR, skillName);
  
  if (!existsSync(skillPath)) {
    log(`Error: Skill '${skillName}' not found`, 'red');
    return false;
  }
  
  const skillMdPath = join(skillPath, 'SKILL.md');
  if (!existsSync(skillMdPath)) {
    log(`Error: ${skillName} has no SKILL.md`, 'red');
    return false;
  }
  
  // Parse frontmatter
  const content = readFileSync(skillMdPath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
  
  if (!frontmatterMatch) {
    log(`Error: ${skillName} has no valid frontmatter`, 'red');
    return false;
  }
  
  // Check required fields
  const frontmatter = frontmatterMatch[1];
  const required = ['name', 'description', 'vibe'];
  const missing = required.filter(field => !frontmatter.includes(`${field}:`));
  
  if (missing.length > 0) {
    log(`Error: Missing required frontmatter fields: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log(`✓ Skill validation passed`, 'green');
  return true;
}

function getUserFolder(config) {
  const usersRootId = config.folders.users;
  
  const authStatus = JSON.parse(
    execSync('gws auth status 2>&1 | tail -n +2', { encoding: 'utf-8' })
  );
  const userEmail = authStatus.user;
  
  const listResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${usersRootId}\\" in parents and name = \\"${userEmail}\\" and trashed = false", "fields": "files(id)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  const userFolderId = listResult.files[0]?.id;
  
  if (!userFolderId) {
    log('Error: User folder not found. Run `respec sync --status` first.', 'red');
    process.exit(1);
  }
  
  const skillsListResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${userFolderId}\\" in parents and name = \\"skills\\" and trashed = false", "fields": "files(id)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  const skillsFolderId = skillsListResult.files[0]?.id;
  
  return { userEmail, skillsFolderId };
}

function moveToStaging(config, skillName, skillsFolderId) {
  const stagingId = config.folders.staging;
  
  // Find skill folder in user's skills
  const listResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${skillsFolderId}\\" in parents and name = \\"${skillName}\\" and trashed = false", "fields": "files(id,name)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  const skillFolderId = listResult.files[0]?.id;
  
  if (!skillFolderId) {
    log(`Error: ${skillName} not found in Drive. Run \`respec sync ${skillName}\` first.`, 'red');
    process.exit(1);
  }
  
  // Move to staging (update parents)
  log(`Moving ${skillName} to staging...`, 'blue');
  
  execSync(
    `gws drive files update --params '{"fileId": "${skillFolderId}", "addParents": "${stagingId}", "removeParents": "${skillsFolderId}"}' --json '{}' 2>&1 > /dev/null`,
    { encoding: 'utf-8' }
  );
  
  log(`✓ Moved to staging`, 'green');
  return skillFolderId;
}

function createGitHubIssue(token, skillName, userEmail, driveUrl) {
  log('Creating GitHub issue...', 'blue');
  
  const title = `Contribute: ${skillName}`;
  const body = `## Skill Contribution

**Skill name:** ${skillName}
**Contributor:** ${userEmail}
**Drive folder:** ${driveUrl}

**Maturity:** seed

---

This contribution was submitted via \`respec contribute submit\`.

**Review checklist:**
- [ ] Frontmatter valid (name, description, vibe, triggers)
- [ ] SKILL.md follows template
- [ ] Description includes [What] + [When] + [Key capabilities]
- [ ] Trigger phrases tested
- [ ] No XML tags in content
- [ ] Examples provided

Once approved, the respec-data GitHub Action will create a PR from the Drive folder to main.`;

  const payload = JSON.stringify({
    title,
    body,
    labels: ['contribution', 'needs-review']
  });
  
  try {
    const result = execSync(
      `curl -s -X POST \\
        -H "Authorization: token ${token}" \\
        -H "Accept: application/vnd.github.v3+json" \\
        https://api.github.com/repos/markngsq/respec-data/issues \\
        -d '${payload}'`,
      { encoding: 'utf-8' }
    );
    
    const issue = JSON.parse(result);
    
    if (issue.html_url) {
      log(`✓ Issue created: ${issue.html_url}`, 'green');
      return issue.html_url;
    } else {
      log(`Error creating issue: ${result}`, 'red');
      process.exit(1);
    }
  } catch (err) {
    log(`Error: ${err.message}`, 'red');
    process.exit(1);
  }
}

function submitSkill(skillName) {
  log(`\nSubmitting '${skillName}' for review...\n`, 'blue');
  log('─'.repeat(60), 'dim');
  
  // 1. Validate
  if (!validateSkill(skillName)) {
    process.exit(1);
  }
  
  // 2. Load config & auth
  const config = loadConfig();
  const token = loadGitHubToken();
  const { userEmail, skillsFolderId } = getUserFolder(config);
  
  // 3. Move to staging
  const skillFolderId = moveToStaging(config, skillName, skillsFolderId);
  const driveUrl = `https://drive.google.com/drive/folders/${skillFolderId}`;
  
  // 4. Create GitHub issue
  const issueUrl = createGitHubIssue(token, skillName, userEmail, driveUrl);
  
  log('─'.repeat(60), 'dim');
  log(`\n✓ Contribution submitted successfully!\n`, 'green');
  log(`Skill: ${skillName}`, 'dim');
  log(`Status: Pending review in staging`, 'dim');
  log(`Issue: ${issueUrl}\n`, 'dim');
}

function listContributions(config) {
  const stagingId = config.folders.staging;
  
  log(`\nPending Contributions\n`, 'blue');
  log('─'.repeat(60), 'dim');
  
  const listResult = JSON.parse(
    execSync(
      `gws drive files list --params '{"q": "\\"${stagingId}\\" in parents and trashed = false", "fields": "files(id,name,modifiedTime)"}' 2>&1 | tail -n +2`,
      { encoding: 'utf-8' }
    )
  );
  
  const pending = listResult.files || [];
  
  if (pending.length === 0) {
    log('No pending contributions\n', 'dim');
    return;
  }
  
  pending.forEach(file => {
    const date = new Date(file.modifiedTime).toLocaleString();
    log(`  • ${file.name} ${colors.dim}(${date})${colors.reset}`);
  });
  
  log('');
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
Respec CLI - Contribute

Usage:
  respec contribute submit <skill-name>    Submit a skill for review
  respec contribute list                    List pending contributions
  
Examples:
  respec contribute submit my-new-skill     Submit 'my-new-skill' for review
  respec contribute list                     See what's in staging
  `);
  process.exit(0);
}

const config = loadConfig();

if (command === 'submit') {
  const skillName = args[1];
  if (!skillName) {
    log('Error: Skill name required', 'red');
    log('Usage: respec contribute submit <skill-name>', 'dim');
    process.exit(1);
  }
  submitSkill(skillName);
} else if (command === 'list') {
  listContributions(config);
} else {
  log(`Unknown command: ${command}`, 'red');
  log('Run `respec contribute --help` for usage', 'dim');
  process.exit(1);
}
