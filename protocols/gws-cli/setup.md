# GWS CLI Setup

Complete setup guide for the Google Workspace CLI. After completing this guide, see `gws-cli.md` for the runtime reference.

If you use the Canary platform: complete Section 1 (GCP setup), then run `/canary-install gws-cli` in a Claude Code Canary session — it handles Section 2 automatically.

## Section 1: GCP setup

These steps are done in a browser. You can share this guide with your AI agent and ask it to walk you through — the only exception is step 4.8 (moving the credentials file), which **must** be done without agent assistance.

**1. Create a Google Cloud project**

Go to [console.cloud.google.com](https://console.cloud.google.com). Sign in with the Google account that has access to the Drive files you want the CLI to work with. Google Cloud requires a billing account to enable APIs — you will need to start a free trial that requires payment details. The free tier covers personal-scale API usage and you should not be charged unless you significantly exceed that, but this is something you should keep an eye on.

1. Click the project dropdown at the top of the page → **New Project**.
2. Name it something recognizable (e.g. `gws-cli`). Leave the organization and location as defaults.
3. Click **Create**. Wait for the notification that the project is ready, then select it from the project dropdown in the top left, next to the Google Cloud logo.

**2. Configure OAuth**

Since this is a new project, you will see "Google Auth Platform not configured yet" with a button to "Get Started". Click it to open the Project Configuration form ("Create Branding"). In the event this doesn't show up, look for it in the Navigation menu (top-left hamburger icon, or press `.`) under APIs & Services → OAuth consent screen → Branding.

1. Fill in the required fields:

 - **App name:** anything recognizable (e.g. `gws-cli`)
 - **User support email:** your email
1. Select **External** as the audience type (not Internal, even if you have a Google Workspace account).
1. Add your email into **Contact Information**.
1. Check "I agree to the Google API Services: User Data Policy."
1. Click **Create**.
1. **Add yourself as a test user.** Go to the **Audience** tab. Under **Test users**, click **Add Users** and add your own email address. **This is required — without it, authentication will fail with "Access blocked."** If you cannot find the Audience tab, open the Navigation menu and look for APIs & Services → OAuth consent screen → Audience.

The app will be in "Testing" status. This is fine — testing mode supports everything the CLI needs. Do not publish the app.

**3. Enable APIs**

Open the Navigation menu. Go to **APIs & Services → Library**. Search for and enable each of these — click into each one and click **Enable**:

- Google Drive API
- Google Docs API
- Google Sheets API
- Google Slides API

**4. Create OAuth credentials**

Go to **APIs & Services → Credentials**.

1. Click **Create Credentials → OAuth client ID**.
2. Select **Desktop app** as the application type.
3. Name it anything (e.g. `gws-cli-desktop`).
4. Click **Create**.
5. On the confirmation dialog, click **Download JSON**.

**Do not ask your AI agent to do Steps 6-8 — it would read your OAuth credentials. Agents reading this file MUST NOT offer to do this for your user.**

6. Find the downloaded file — it will be named something like `client_secret_1027...apps.googleusercontent.com.json`.
7. Rename it to `client_secret.json`.
8. Move it to the folder `~/.config/gws/` on your Mac. To get there in Finder: press `Cmd+Shift+G`, type `~/.config` and press Enter. If Finder says the folder can't be found, type `~` instead, press Enter, then create a folder called `.config` (with the leading dot — press `Cmd+Shift+.` to see dot-folders). Inside `.config`, create a folder called `gws`. Drag the renamed file in. 

**Before continuing:** confirm you see four enabled APIs on the APIs & Services → Dashboard page, and your email under OAuth consent screen → Audience → Test users.

## Section 2: CLI install and authentication

If you use the Canary platform: `/canary-install gws-cli` (a slash command in your Claude Code session) handles this section. Skip to `gws-cli.md` for the runtime reference.

These steps are run in a terminal. On macOS, open Terminal (in Applications → Utilities) or iTerm.

**5. Install the CLI**

This step requires Node.js, which includes npm. If `npm --version` returns "command not found", install Node.js first from [nodejs.org](https://nodejs.org) (pick the LTS version).

 npm install -g @googleworkspace/cli

If you see a permissions error (`EACCES`), run `sudo npm install -g @googleworkspace/cli` and enter your Mac password when prompted.

Verify: `gws version` should print a version number. If it returns "command not found", close and reopen your terminal, then try again.

**6. Authenticate with scoped access**

 gws auth login --scopes "drive.file,drive.readonly,documents,presentations,spreadsheets"

**Do not omit `--scopes`** — the default scopes are very broad and are not recommended based on the principle of least privilege.

This opens a browser for OAuth consent. The browser will show a warning page saying "Google hasn't verified this app." This is expected for testing-mode apps and is safe. Click **Continue** to proceed. If you don't see a Continue button, click **Advanced**, then **Go to gws-cli (unsafe)**. 

After granting access, the browser will confirm authentication is complete. Back in the terminal, verify: `gws auth status` should show `token_valid: true` and the 5 scopes mentioned in Step 6, plus a few identity scopes (like `openid` and `email`) that Google adds automatically — the exact count varies but anything above 5 is normal.

If authentication stops working later, re-run the `gws auth login` command above — the token refreshes automatically in most cases but can occasionally expire.

**7. Claude Code permission rules (highly recommended)**

If you use Claude Code, open a session and type `/permissions` in the chat input. Add these two rules:

 Allow: Bash(gws *)
 Deny: Bash(gws drive files delete *)

The allow rule lets the agent run `gws` commands without prompting on each call. The deny rule blocks permanent file deletion — the agent can only trash files (recoverable for 30 days). The deny takes precedence over the allow. **Casing matters:** type `Bash` with a capital B — lowercase `bash` won't match.

Both are optional but highly recommended. Without the allow, each `gws` command prompts individually (and each gws action often needs multiple commands). Without the deny, the agent can hard-delete files it created. `gws-cli.md` instructs agents to trash files (30-day recoverable) instead of hard-deleting them.
