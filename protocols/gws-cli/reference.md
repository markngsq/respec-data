# GWS CLI

Last verified: `@googleworkspace/cli` v0.18.1, 2026-03-22

Google Workspace integration via the `gws` CLI (`@googleworkspace/cli`). Gives agents Drive API access to files, folders, Google Docs, Sheets, Slides, and other GWS types — without filesystem mounts or browser automation. All operations go through OAuth-scoped REST calls wrapped in shell commands.

## Setup

Install via `/canary-install gws-cli`. For manual setup or non-Canary projects, see `canary/protocols/gws-cli-setup.md`. For project-specific configuration (folder IDs), see § Project configuration.

## Constraints

- **Confirm writes.** Always confirm with the user before executing write, update, or create commands — unless the current instruction explicitly requests the operation (e.g., "append these rows to the tracker")
- **Trash only — never hard delete.** Use `gws drive files update --json '{"trashed": true}'` to remove files. `gws drive files delete` performs a permanent, unrecoverable hard delete under the `drive.file` scope. This command is banned — enforce via CC permission deny rule (`deny Bash(gws drive files delete *)`)
- **Drive mutations are CLI-created-only.** Drive-level operations (trash, rename, move, permission changes) only work on files this OAuth client created. Content edits via Docs/Sheets/Slides APIs work on any file the user can access. If you get a 403 on a Drive operation, this is why — do not retry.

## What the agent can and can't do

Google's OAuth scopes and CC permission rules together determine capabilities. The agent can see everything, edit any document (reversibly), manage only its own files, and permanently delete nothing.

- **Read:** any file, any document content — unrestricted
- **Edit document content** (Docs, Sheets, Slides): any file the user can access, even files the CLI didn't create — damage is recoverable via version history, but not prevented. The "confirm writes" constraint is behavioral (the agent follows it), not enforced at the API level
- **File management** (trash, rename, move): only files the CLI created — others return 403
- **Permanent delete:** blocked if the deny rule from the install step is in place (`deny Bash(gws drive files delete *)`). The install instructions prompt you to add this rule via `/permissions` — it cannot be added automatically. Without it, the CLI can hard-delete files it created

**Technical detail:** OAuth scopes are `drive.file`, `drive.readonly`, `documents`, `presentations`, `spreadsheets`. Content scopes bypass `drive.file` — that's why document edits work on any file. Drive-level 403 errors return `appNotAuthorizedToFile`. Hard-delete block is CC-level: `deny Bash(gws drive files delete *)`.

## CLI syntax

```bash
gws <service> <resource> [sub-resource] <method> [flags]
```

### Services

| Service | What it covers |
| -------- | -------------------------------------------------------------------- |
| `drive` | Files, folders, permissions, comments, revisions |
| `docs` | Google Docs content (read structure, insert/delete text, formatting) |
| `sheets` | Google Sheets (cell values, tabs, formatting) |
| `slides` | Google Slides (presentations, slides, page elements) |

### Flags

| Flag | Description |
| ------------------------------ | ------------------------------------------------------- |
| `--params '{"key": "val"}'` | URL/query parameters (fileId, documentId, q, fields) |
| `--json '{"key": "val"}'` | Request body (name, mimeType, parents, requests) |
| `-o, --output <PATH>` | Save binary responses to file |
| `--upload <PATH>` | Upload file content (multipart) |
| `--upload-content-type <MIME>` | MIME type for uploaded file |
| `--format <FORMAT>` | Output format: `json` (default), `table`, `yaml`, `csv` |
| `--dry-run` | Validate locally without calling the API |
| `--page-all` | Auto-paginate (NDJSON output) |

Helper commands (`+upload`, `+read`, `+append`, `+write`) accept their own flags not listed here — run `gws <service> +<command> --help` to see them.

### URL-to-ID extraction

All Google URLs use `/d/{ID}/` — extract the ID between `/d/` and the next `/`.

| URL pattern | Type |
| -------------------------------------------------- | -------------- |
| `https://docs.google.com/document/d/{ID}/edit` | Google Docs |
| `https://docs.google.com/spreadsheets/d/{ID}/edit` | Google Sheets |
| `https://docs.google.com/presentation/d/{ID}/edit` | Google Slides |
| `https://drive.google.com/file/d/{ID}/view` | Any Drive file |

## Common patterns

Reach for a helper first, raw API second (§ Raw API reference). If neither covers your case, or a documented pattern produces unexpected results, use `gws schema` to verify current syntax (§ Discovery).

**Keyring noise:** All `gws` commands print `Using keyring backend: keyring` to stdout before the JSON response. When parsing output, pipe through `2>&1 | tail -n +2`. This merges stderr into stdout before stripping the first line — if the command errors, the pipe may eat the first line of the error message. **If output is empty or a parser fails, always re-run the bare `gws` command without any pipe.** `gws schema` is the exception — it outputs clean JSON, no pipe needed.

### Drive

`gws drive files list` returns trashed files by default — every list query must include `trashed = false` in the `q` parameter.

- **List files in a folder:** `gws drive files list` with `q` filtering by parent ID and `trashed = false`. Always request specific `fields` — recommended default: `files(id,name,mimeType,modifiedTime)`. For folders with many files, add `--page-all` to auto-paginate — output switches to NDJSON (one JSON object per line).
- **Upload a file:** `gws drive +upload ./file.pdf --parent FOLDER_ID` (MIME type auto-detected, `--parent` and `--name` optional). Or use raw API (§ Raw API: upload a local file).
- **Download a file:** `gws drive files get --params '{"fileId": "ID", "alt": "media"}' -o /tmp/filename`. Works for PDFs, images, markdown, any non-GWS-native type. Does not work on native Google files (Docs, Sheets, Slides) — use export instead.
- **Export a native Google file:** `gws drive files export --params '{"fileId": "ID", "mimeType": "application/pdf"}' -o /tmp/filename.pdf`. Common MIME types: `application/pdf`, `text/plain` (Docs only), `text/csv` (Sheets, first tab only). Max 10 MB.
- **Trash a file:** `gws drive files update --params '{"fileId": "ID"}' --json '{"trashed": true}'`. Recoverable for 30 days.
- **Comments:** `gws drive comments list` to read, `gws drive replies create` to reply. Works on any file type. See § Raw API: comments — read and reply.

### Docs

- **Read a Google Doc:** `gws docs documents get` returns structured JSON (body → content → paragraphs → elements → textRuns). See § Raw API: read document structure for a parser.
- **Append text:** `gws docs +write --document DOC_ID --text "Text to append"`. Inserts at the end of the document body. Plain text only.
- **Surgical edits (insert, delete, replace):** `gws docs documents batchUpdate` with `insertText`, `deleteContentRange`, or combined operations. See § Raw API: surgical edit.
- **Apply formatting (headings, styles):** `gws docs documents batchUpdate` with `updateParagraphStyle`. Named styles: `HEADING_1` through `HEADING_6`, `NORMAL_TEXT`, `TITLE`, `SUBTITLE`. Use `gws schema docs.documents.batchUpdate` for the full request spec.

### Sheets

Sheet range strings containing `!` (e.g. `Posts!G5`) fail with "Invalid --params JSON" when passed inside `--params` JSON values. Use `\u0021` in place of `!`. The `+read` helper is not affected — it takes `--range` as a separate flag. `+append` has no range flag at all.

- **Read a Sheet:** `gws sheets +read --spreadsheet SHEET_ID --range "Tab Name!A1:D10"`. Returns computed values (not formulas). Read-only.
- **Append rows:** `gws sheets +append --spreadsheet SHEET_ID --json-values '[["Alice", 100, true]]'`. **Do not pass `--range`** — the helper auto-detects the table boundary and appends after the last occupied row. Always appends to the first tab; for multi-tab spreadsheets, use the raw API `values append` with a range targeting the tab (e.g. `Tab Name!A1`). `--json-values` takes a JSON array of rows — preserves types, supports multiple rows, and is the format agents naturally produce. `--values 'Alice,100,true'` is available as shorthand for simple string appends, but do not pass JSON to `--values` — it will be silently inserted as a literal string.
- **Write to specific cells:** `gws sheets spreadsheets values update` (§ Raw API: write cells).
- **Delete a row:** `gws sheets spreadsheets batchUpdate` with `deleteDimension` (§ Raw API: delete a row).

### Slides

No helpers available for Slides — all operations use the raw API.

- **Read a Slides deck:** `gws slides presentations get` returns all slides with page elements. Parse with python for readable text extraction (§ Raw API: read presentation content).
- **Write to Slides:** `gws slides presentations batchUpdate` with `insertText` targeting shape objectIds. Read the presentation first to get element IDs (§ Raw API: write to a slide).

## Discovery

Everything above covers the most common GWS operations. For methods not covered, the CLI provides two self-service discovery tools — use these before reaching into the Raw API reference.

### gws schema — parameter lookup

```bash
gws schema drive.files.list
```

Returns the full parameter spec for any API method — names, types, required/optional, defaults, descriptions:

```json
{
 "parameters": {
 "q": {
 "type": "string",
 "required": false,
 "description": "A search query combining one or more search terms..."
 }
 }
}
```

Use parameter names as keys in `--params` (for URL/query parameters) or `--json` (for request body fields). Uses a local cache (~70ms). Use `gws schema` when you know the method and need its parameters. Note: `gws schema` outputs clean JSON — do not apply the keyring `tail -n +2` pipe.

### gws generate-skills — method catalog

```bash
gws generate-skills
```

Generates SKILL.md files for all GWS services (Drive, Docs, Sheets, Slides, Gmail, Calendar, and more) into a local `skills/` directory. Covers every API resource and method. Use `generate-skills` when you need to discover what methods exist across services. Do not commit the generated files.

## Raw API reference

For operations beyond the helpers, use the raw API pattern: `gws <service> <resource> <method> --params '...' --json '...'`. Examples that pipe to a processor include the keyring skip (`2>&1 | tail -n +2`) inline; examples that don't, omit it for readability — add it when chaining.

**Durability:** The API methods and parameters below come from Google's versioned REST APIs (Drive v3, Docs v1, Sheets v4, Slides v1) and are stable. The CLI wrapper layer (flag syntax like `--params`/`--json`, helper commands like `+read`/`+append`, and output quirks like keyring noise) may change with CLI updates — check the `Last verified` date at the top of this document.

**Index:** Drive (list, create, upload, trash, download) · Docs (read, surgical edit) · Sheets (write cells, delete row) · Slides (read, write) · Comments (read, reply)

### Drive — list files in a folder

```bash
gws drive files list --params '{
 "q": "\"FOLDER_ID\" in parents and trashed = false",
 "fields": "files(id,name,mimeType,modifiedTime)"
}'
```

### Drive — create a native Google Doc

```bash
gws drive files create --json '{
 "name": "Document Title",
 "mimeType": "application/vnd.google-apps.document",
 "parents": ["FOLDER_ID"]
}'
```

### Drive — upload a local file

```bash
gws drive files create \
 --json '{"name": "file.md", "parents": ["FOLDER_ID"]}' \
 --upload /path/to/local/file.md \
 --upload-content-type text/markdown
```

### Drive — trash a file

```bash
gws drive files update \
 --params '{"fileId": "FILE_ID"}' \
 --json '{"trashed": true}'
```

### Drive — download a file

```bash
gws drive files get \
 --params '{"fileId": "FILE_ID", "alt": "media"}' \
 -o /tmp/filename
```

### Docs — read document structure

```bash
gws docs documents get --params '{"documentId": "DOC_ID"}' \
 2>&1 | tail -n +2 | python3 -c " # skip keyring line
import sys, json
doc = json.load(sys.stdin)
for elem in doc.get('body', {}).get('content', []):
 if 'paragraph' in elem:
 for pe in elem['paragraph'].get('elements', []):
 text = pe.get('textRun', {}).get('content', '').rstrip('\n')
 if text: print(text)
"
```

### Docs — surgical edit (delete + insert)

```bash
gws docs documents batchUpdate \
 --params '{"documentId": "DOC_ID"}' \
 --json '{
 "requests": [
 {"deleteContentRange": {"range": {"startIndex": START, "endIndex": END}}},
 {"insertText": {"location": {"index": START}, "text": "Replacement"}}
 ]
 }'
```

Requests execute in order within one atomic call. Each mutation shifts subsequent indices — a delete of 10 characters shifts all later indices by -10. When combining multiple operations, process from highest index to lowest to avoid shifting, or calculate indices against the document state after each preceding request. Read the doc first to get current indices.

### Sheets — write cells

```bash
gws sheets spreadsheets values update \
 --params '{
 "spreadsheetId": "SHEET_ID",
 "range": "Tab\u0021A1:C3",
 "valueInputOption": "USER_ENTERED"
 }' \
 --json '{"values": [["Name", "Type", "Status"], ["Row 1", "Value", "Done"]]}'
```

Note the `\u0021` in place of `!` — required in `--params` JSON. `USER_ENTERED` parses formulas and dates; `RAW` inserts literal strings.

### Sheets — delete a row

```bash
gws sheets spreadsheets batchUpdate \
 --params '{"spreadsheetId": "SHEET_ID"}' \
 --json '{
 "requests": [{
 "deleteDimension": {
 "range": {"sheetId": 0, "dimension": "ROWS",
 "startIndex": ROW_MINUS_1, "endIndex": ROW}
 }
 }]
 }'
```

Row indices are 0-based. Spreadsheet row 2 (first data row) is `startIndex: 1, endIndex: 2`.

### Slides — read presentation content

```bash
gws slides presentations get --params '{"presentationId": "PRES_ID"}' \
 2>&1 | tail -n +2 | python3 -c " # skip keyring line
import sys, json
pres = json.load(sys.stdin)
for i, slide in enumerate(pres.get('slides', [])):
 print(f'--- Slide {i+1} ---')
 for elem in slide.get('pageElements', []):
 if 'shape' in elem:
 for te in elem['shape'].get('text', {}).get('textElements', []):
 content = te.get('textRun', {}).get('content', '').strip()
 if content: print(f' {content}')
"
```

### Slides — write to a slide

```bash
gws slides presentations batchUpdate \
 --params '{"presentationId": "PRES_ID"}' \
 --json '{
 "requests": [
 {"insertText": {"objectId": "ELEMENT_ID", "text": "Hello",
 "insertionIndex": 0}}
 ]
 }'
```

Read the presentation first to get shape `objectId` values. Predefined layouts for new slides: `BLANK`, `TITLE`, `TITLE_AND_BODY`, `TITLE_AND_TWO_COLUMNS`.

### Comments — read and reply

```bash
# Read comments on any file
gws drive comments list --params '{
 "fileId": "FILE_ID",
 "fields": "comments(id,content,quotedFileContent,author,resolved)"
}'

# Reply to a comment (fields parameter is required)
gws drive replies create \
 --params '{"fileId": "FILE_ID", "commentId": "COMMENT_ID",
 "fields": "id,content,author"}' \
 --json '{"content": "Reply text"}'
```

## Reference

### Behavioral findings

Tested and verified patterns that inform how agents should work with GWS via CLI.

- **Rapid writes are safe.** 20 rapid API appends to the same doc: zero errors, zero rate limiting. Drive coalesced 21 calls into 2 visible revisions. Safe to iterate on a document without throttling.
- **Concurrent access works.** API writes land live in the browser while a human has the doc open. No conflict, no overwrite — behaves like two humans co-editing. No "close the file first" convention needed.
- **Targeted insertion by index.** `batchUpdate` with character indices enables surgical edits at any point. Indices shift after each mutation within a batchUpdate — order requests accordingly or combine them.
- **Round-trip fidelity.** Agent creates structured doc → human edits in browser → agent reads back. All content preserved, including comments and replies. No format degradation — native GWS format eliminates conversion losses.

### Project configuration

Each tenant project stores its GWS identifiers in `canary-local/config.local.md` — one row per known folder or file, with name, ID, and type:

| Variable | Value | Description |
|---|---|---|
| GWS_PROJECT_WORKSPACE | `1xABC...` | Project workspace folder |

Platform-level shared identifiers (like cross-project Canary Post folders) live in `canary/config.md` — see § Canary Post for an example.

## Troubleshooting

| Symptom | Cause | Fix |
| ----------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `gws: command not found` | CLI not installed | Re-run `/canary-install gws-cli` or see `canary/protocols/gws-cli-setup.md` § 5 |
| Checking or updating CLI version | — | `gws version` to check; `npm update -g @googleworkspace/cli` to update. After updating: (1) the next command will prompt for macOS Keychain access — approve with "Always Allow" to re-cache; (2) test a few commands — CLI updates can change output format or flag behavior, which may break patterns in this document. Check the `Last verified` version at the top. |
| `token_valid: false` on `gws auth status` | Token expired | `gws auth login` (interactive, browser-based) |
| 403 on file update/trash | File not created by this OAuth client | Expected — `drive.file` scope only covers CLI-created files. Content edits (Docs/Sheets/Slides API) still work. Do not retry. |
| "Invalid --params JSON " with `!` | Exclamation mark in JSON value | Replace `!` with `\u0021` in `--params` JSON strings |
| Trashed files appearing in listings | Default API behavior | Add `trashed = false` to the `q` parameter |
| `Using keyring backend: keyring` noise | CLI prints to stdout before response | Pipe through `2>&1` then `tail -n +2` |
| 403 on `files delete` | Permission deny rule | By design — use `files update` with `{"trashed": true}` instead |
| Empty output or parse error after piping | Keyring pipe masking an error | Re-run the `gws` command without the `tail -n +2` pipe to see raw output |
