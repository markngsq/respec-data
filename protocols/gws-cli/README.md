# GWS CLI Protocol

Google Workspace CLI integration for Respec skills.

## Files

- **[setup.md](setup.md)** - Complete installation and authentication guide
- **[reference.md](reference.md)** - Runtime reference for Drive, Docs, Sheets, Slides

## Overview

The GWS CLI (`@googleworkspace/cli`) provides OAuth-based Google Workspace access for AI coding agents. Skills that work with Google Docs, Sheets, Slides, or Drive files can use this CLI to read, write, and manage files without browser automation or filesystem mounts.

## When to use

Use GWS CLI when a skill needs to:
- Read or write Google Docs/Sheets/Slides content
- List, upload, download, or manage files in Google Drive
- Work with comments, revisions, or sharing permissions
- Operate on native Google Workspace formats (not exported PDFs/CSVs)

## Quick start

1. Follow [setup.md](setup.md) to install and authenticate
2. Reference [reference.md](reference.md) for CLI patterns
3. Add to skill SKILL.md as needed

## Security model

- **OAuth scopes:** `drive.file`, `drive.readonly`, `documents`, `presentations`, `spreadsheets`
- **Read:** Unrestricted (any file the user can access)
- **Write:** Document content on any file (reversible via version history)
- **File management:** Only files the CLI created (403 on others)
- **Delete:** Blocked via Claude Code permission deny rule

See reference.md § What the agent can and can't do for details.

## Skills using GWS CLI

_(Add skills here as they adopt GWS CLI)_

- None yet

## Related

- **MCP Builder** (`mcp-builder` skill) - For building MCP servers that wrap GWS APIs
- **Senior Architect** (`senior-architect` skill) - For designing GWS-integrated systems
