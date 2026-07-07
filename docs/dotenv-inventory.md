# Dotenv Command Inventory

Curated inventory of shell functions, aliases, and scripts from the [`dotenv`](https://github.com/angelcantugr/dotenv) stow repo, gathered to help pick good Stream Deck button candidates for this plugin's `src/config/dev-workflow.config.ts`.

This is a **curated subset** (~160 of ~1,661 unique zsh functions/aliases), plus every standalone script/git-hook/tmux-script the automated indexer doesn't cover, plus a bare listing of installer/bootstrap scripts for completeness (these are setup scripts, generally poor Stream Deck fits).

## How to regenerate the raw data

```bash
python3 ~/GithubRepositories/angelcantugr/dotenv/stow-packages/zsh/.local/bin/dotenv-shell-lookup-v2 \
  --root ~/GithubRepositories/angelcantugr/dotenv/stow-packages/zsh/.config/zsh \
  --unique --no-cache --format json
```
This dumps every zsh function/alias with name/kind/description/usage/examples/category. The curation here re-runs a scoring pass (documented > has usage/examples > function-over-alias, excludes internal `_`/`-help`/`fzf-*` helpers) and takes the top ~15 per category. Standalone scripts, tmux scripts, and git hooks (not covered by the indexer) were inventoried manually by reading each file's header/argparse block.

## Legend

- **no args**: safe direct Stream Deck key, no property inspector config needed
- **needs arg(s)**: use the action's property inspector to capture a value (session name, file path, etc.)
- **interactive/launch-only**: opens a TUI or picker; wire as "open in terminal", not "run and forget"

## Zsh Functions & Aliases (curated)

### Claude (15)

- **`cc-agent`** (function) — `cc-agent <task> [base-branch]`
  Agent mode in worktree
  - Examples: cc-agent "refactor authentication" main
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-agent <task> [base-branch]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_advanced.zsh:36`
- **`cc-ask`** (function) — `cc-ask <question>`
  Quick question to Claude
  - Examples: cc-ask "how do I implement authentication?"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-ask <question>_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_interactive.zsh:8`
- **`cc-batch`** (function) — `cc-batch <operation> <files...>`
  Batch operations on multiple files
  - Examples: cc-batch "add error handling" src/*.go
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-batch <operation> <files...>_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_advanced.zsh:70`
- **`cc-branch`** (function) — `cc-branch <feature>`
  Suggest branch name for feature
  - Examples: cc-branch "user authentication"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-branch <feature>_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_git.zsh:96`
- **`cc-diff`** (function) — `cc-diff [commit-ish]`
  Explain a diff in plain English
  - Examples: cc-diff          (staged changes) | cc-diff HEAD~1 | cc-diff main
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-diff [commit-ish]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_git.zsh:203`
- **`cc-docs`** (function) — `cc-docs [scope]`
  Generate documentation
  - Examples: cc-docs | cc-docs "API endpoints"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-docs [scope]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_workflows.zsh:199`
- **`cc-init`** (function) — `cc-init [dir] [--force]`
  Bootstrap a repository for Claude Code
  - Examples: cc-init | cc-init /path/to/repo --force
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-init [dir] [--force]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_init.zsh:14`
- **`cc-issue`** (function) — `cc-issue [issue-number]`
  Create an issue worktree and launch Claude inside it with the issue as context Combines gwt-issue (worktree creation) + cc-worktree (Claude session).
  - Examples: cc-issue | cc-issue 42
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-issue [issue-number]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_workflows.zsh:319`
- **`cc-json`** (function) — `cc-json <prompt> [schema]`
  JSON structured output
  - Examples: cc-json "list all API endpoints" endpoints-schema.json
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-json <prompt> [schema]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_advanced.zsh:132`
- **`cc-perf`** (function) — `cc-perf [file|dir]`
  Performance analysis agent — file/dir is optional; falls back to git changed files
  - Examples: cc-perf src/query.go | cc-perf          (analyzes recently changed files)
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-perf [file|dir]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_advanced.zsh:173`
- **`cc-pipe`** (function) — `cc-pipe <prompt>`
  Pipe/streaming output mode (plumbing primitive for scripting)
  - Examples: cc-pipe "explain the authentication flow"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-pipe <prompt>_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_advanced.zsh:106`
- **`cc-setup`** (function) — `cc-setup [project-type]`
  Project setup wizard
  - Examples: cc-setup nodejs | cc-setup
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-setup [project-type]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_workflows.zsh:223`
- **`cc-sp`** (function) — `cc-sp <system-prompt>`
  One-off interactive session with an inline system prompt  Intentionally bypasses _claude_build_cmd to stay minimal: no stored prompts, no file I/O — just model + inline prompt.
  - Examples: cc-sp "You are a Go performance expert. Prioritize allocation efficiency."
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-sp <system-prompt>_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_interactive.zsh:80`
- **`cc-test`** (function) — `cc-test <file>`
  Generate tests for code
  - Examples: cc-test src/auth.go
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-test <file>_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_workflows.zsh:157`
- **`cc-todo`** (function) — `cc-todo [pattern]`
  Scan and prioritize TODO/FIXME comments
  - Examples: cc-todo | cc-todo "FIXME"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cc-todo [pattern]_
  - `stow-packages/zsh/.config/zsh/claude-zsh/_code-ops.zsh:93`

### Codex (15)

- **`cdx-ask`** (function) — `cdx-ask <question>`
  Quick question to Codex
  - Examples: cdx-ask "how do I implement authentication?"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-ask <question>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_quick.zsh:17`
- **`cdx-batch`** (function) — `cdx-batch <operation> <files...>`
  Batch operations on multiple files
  - Examples: cdx-batch "add error handling" src/*.go
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-batch <operation> <files...>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_advanced.zsh:82`
- **`cdx-cloud`** (function) — `cdx-cloud [note]`
  Cloud task browser (if supported)
  - Examples: cdx-cloud
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-cloud [note]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_advanced.zsh:188`
- **`cdx-edit`** (function) — `cdx-edit <file> [instruction]`
  Edit file with guidance
  - Examples: cdx-edit auth.go "add error handling"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-edit <file> [instruction]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_code.zsh:48`
- **`cdx-exec`** (function) — `cdx-exec <task>`
  Non-interactive exec mode
  - Examples: cdx-exec "add error handling to main.go"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-exec <task>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_quick.zsh:74`
- **`cdx-fix`** (function) — `cdx-fix [error]`
  Fix last failed command
  - Examples: cdx-fix
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-fix [error]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_quick.zsh:93`
- **`cdx-flow`** (function) — `cdx-flow <advanced|yolo> [task...]`
  Workflow-oriented Codex runner
  - Examples: cdx-flow advanced "refactor auth module" | cdx-flow yolo
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-flow <advanced|yolo> [task...]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_advanced.zsh:23`
- **`cdx-image`** (function) — `cdx-image <image> [prompt]`
  Multimodal image input
  - Examples: cdx-image screenshot.png "what's wrong with this UI?"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-image <image> [prompt]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_advanced.zsh:216`
- **`cdx-json`** (function) — `cdx-json <prompt>`
  JSON structured output
  - Examples: cdx-json "list all API endpoints"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-json <prompt>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_advanced.zsh:164`
- **`cdx-learn`** (function) — `cdx-learn <topic>`
  Learning session with examples
  - Examples: cdx-learn "Go concurrency patterns"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-learn <topic>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_learning.zsh:19`
- **`cdx-mode`** (function) — `cdx-mode [untrusted|on-request|never]`
  Set approval mode
  - Examples: cdx-mode on-request
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-mode [untrusted|on-request|never]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_model.zsh:104`
- **`cdx-model`** (function) — `cdx-model [model]`
  Switch Codex model
  - Examples: cdx-model gpt-5.2-codex
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-model [model]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_model.zsh:17`
- **`cdx-pr`** (function) — `cdx-pr [target-branch]`
  Create PR description
  - Examples: cdx-pr main
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-pr [target-branch]_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_git.zsh:42`
- **`cdx-quiz`** (function) — `cdx-quiz <topic>`
  Generate quiz questions (ADHD recall prompts)
  - Examples: cdx-quiz "JavaScript closures"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-quiz <topic>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_learning.zsh:137`
- **`cdx-test`** (function) — `cdx-test <file>`
  Generate tests for code
  - Examples: cdx-test src/auth.go
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cdx-test <file>_
  - `stow-packages/zsh/.config/zsh/codex-zsh/_code.zsh:113`

### Cursor (15)

- **`agent-ask`** (function) — `agent-ask "how do I implement X?"`
  Quick question to cursor agent
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_interactive.zsh:20`
- **`agent-batch`** (function) — `agent-batch "operation" [files...]`
  Batch operations with agent
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-batch "operation" [files...]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_advanced.zsh:200`
- **`agent-debug`** (function) — `agent-debug [issue_description]`
  Debug session with agent
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-debug [issue_description]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_operations.zsh:81`
- **`agent-docs`** (function) — `agent-docs [scope]`
  Generate documentation
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-docs [scope]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_operations.zsh:66`
- **`agent-edit`** (function) — `agent-edit [file] [instruction]`
  Edit file with agent guidance
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-edit [file] [instruction]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_operations.zsh:214`
- **`agent-fix`** (function) — `agent-fix [error_description]`
  Fix last failed command or current error
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-fix [error_description]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_interactive.zsh:67`
- **`agent-learn`** (function) — `agent-learn [topic]`
  Learning session with agent
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-learn [topic]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_workflows.zsh:138`
- **`agent-lint`** (function) — `agent-lint [file]`
  Fix linting issues
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-lint [file]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_operations.zsh:331`
- **`agent-plan`** (function) — `agent-plan "planning request"`
  Read-only planning (no edits, analyze and propose)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_advanced.zsh:115`
- **`agent-quick`** (function) — `agent-quick "task description"`
  One-liner agent interactions
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_interactive.zsh:89`
- **`agent-setup`** (function) — `agent-setup [project_type]`
  Project setup assistance
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-setup [project_type]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_workflows.zsh:54`
- **`agent-test`** (function) — `agent-test [file]`
  Generate or improve tests
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: agent-test [file]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_operations.zsh:42`
- **`cursor-goto`** (function) — `cursor-goto <file:line[:column]>`
  Open file at line (and optional column)
  - Examples: cursor-goto src/main.ts:42
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cursor-goto <file:line[:column]>_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_cursor.zsh:44`
- **`cursor-issue`** (function) — `cursor-issue [notes]`
  AI-assisted issue draft using Cursor Agent CLI + repo context
  - Examples: cursor-issue "capture flaky tests on CI"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cursor-issue [notes]_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_github.zsh:13`
- **`cursor-pr-summary`** (function) — `cursor-pr-summary <pr-number>`
  AI summary/digest for PRs using Cursor Agent CLI
  - Examples: cursor-pr-summary 123
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: cursor-pr-summary <pr-number>_
  - `stow-packages/zsh/.config/zsh/cursor-zsh/_github.zsh:130`

### DevOps (15)

- **`adr-list`** (function) — `adr-list`
  List all ADRs
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/devops-zsh/_docs.zsh:42`
- **`aws-cf-ls`** (function) — `aws-cf-ls [filter]`
  ── aws-cf-ls — list stacks with color-coded status ────────────────────────── Alias: cfls
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-cf-ls [filter]_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_platform.zsh:211`
- **`aws-check`** (function) — `aws-check [profile]`
  Validate credentials for a profile
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-check [profile]_
  - `stow-packages/zsh/.config/zsh/saml2aws-zsh/_credentials.zsh:23`
- **`aws-clean`** (function) — `aws-clean [--dry-run]`
  Remove expired named profiles from ~/.aws/credentials. Protected profiles (sea, decaf, expeso, cc) are never removed. Uses `aws configure get expiration` — same mechanism as aws-expiry — so it works regardless of which field name saml2aws writes to the credentials file.
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-clean [--dry-run]_
  - `stow-packages/zsh/.config/zsh/saml2aws-zsh/_credentials.zsh:132`
- **`aws-cost`** (function) — `aws-cost [days]   (default: 7)`
  ── aws-cost — cost explorer: top services + daily bar chart ───────────────── Alias: awscost
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-cost [days]   (default: 7)_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_workflows.zsh:9`
- **`aws-exec`** (function) — `aws-exec <profile> <command> [args...]`
  Run a command with AWS credentials injected as environment variables. Uses saml2aws exec mode — credentials are NOT written to ~/.aws/credentials.
  - Examples: aws-exec sea aws sts get-caller-identity
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-exec <profile> <command> [args...]_
  - `stow-packages/zsh/.config/zsh/saml2aws-zsh/_exec.zsh:14`
- **`aws-find`** (function) — `aws-find <name-or-tag-value>`
  ── aws-find — search resources by Name tag across services ────────────────── Searches EC2 instances, RDS instances, Lambda functions, EKS clusters Alias: awsfind
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-find <name-or-tag-value>_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_workflows.zsh:65`
- **`aws-guard`** (function) — `aws-guard [profile]`
  Auto-relogin if credentials are expiring within 15 minutes (900 seconds) Useful to call at the top of scripts that need long-running AWS access
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-guard [profile]_
  - `stow-packages/zsh/.config/zsh/saml2aws-zsh/_credentials.zsh:109`
- **`aws-roles`** (function) — `aws-roles [profile]`
  Browse available IAM roles for a profile via saml2aws. Displays friendly "account-name → role" format using _s2a_build_role_menu. Requires saml2aws >= 2.x. If 'unknown command' error appears, update saml2aws.
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-roles [profile]_
  - `stow-packages/zsh/.config/zsh/saml2aws-zsh/_exec.zsh:48`
- **`aws-s3-cp`** (function) — `aws-s3-cp <src> <dst>`
  ── aws-s3-cp — copy with progress ──────────────────────────────────────────── Alias: s3cp
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-s3-cp <src> <dst>_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_s3.zsh:49`
- **`aws-s3-du`** (function) — `aws-s3-du [bucket]   (fzf picker if omitted)`
  ── aws-s3-du — disk usage per bucket/prefix ────────────────────────────────── Alias: s3du
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-s3-du [bucket]   (fzf picker if omitted)_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_s3.zsh:128`
- **`aws-s3-ls`** (function) — `aws-s3-ls [s3://bucket/prefix]`
  ── aws-s3-ls — list buckets or a prefix ───────────────────────────────────── Alias: s3ls
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-s3-ls [s3://bucket/prefix]_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_s3.zsh:9`
- **`aws-s3-rm`** (function) — `aws-s3-rm <s3://bucket/key>`
  ── aws-s3-rm — delete single object with confirm ──────────────────────────── Alias: s3rm
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: aws-s3-rm <s3://bucket/key>_
  - `stow-packages/zsh/.config/zsh/awscli-zsh/_s3.zsh:65`
- **`ci-logs`** (function) — `ci-logs [run-id]`
  View CI logs with fzf job picker
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ci-logs [run-id]_
  - `stow-packages/zsh/.config/zsh/devops-zsh/_cicd.zsh:49`
- **`ci-retry`** (function) — `ci-retry [run-id]`
  Retry failed CI jobs
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ci-retry [run-id]_
  - `stow-packages/zsh/.config/zsh/devops-zsh/_cicd.zsh:79`

### FZF Utilities (15)

- **`edit`** (function) — `edit`
  Open the current directory in your default editor
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_navigation.zsh:19`
- **`fcat`** (function) — `fcat`
  Fuzzy find and display file with bat
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_navigation.zsh:61`
- **`fcd`** (function) — `fcd`
  Fuzzy cd into a directory
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_navigation.zsh:23`
- **`fcp`** (function) — `fcp`
  Fuzzy copy - select files with fzf, then select destination directory
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_fileops.zsh:18`
- **`fcph`** (function) — `fcph`
  Fuzzy copy here - select files and copy them to current directory
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_fileops.zsh:108`
- **`fedit`** (function) — `fedit`
  Fuzzy find and edit a file
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_navigation.zsh:34`
- **`fff`** (function) — `fff`
  Fuzzy find file (prints path to stdout)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_navigation.zsh:52`
- **`fkill`** (function) — `fkill`
  Fuzzy kill a process
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_process.zsh:16`
- **`fmv`** (function) — `fmv`
  Fuzzy move - select files with fzf, then select destination directory
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_fileops.zsh:63`
- **`fmvh`** (function) — `fmvh`
  Fuzzy move here - select files and move them to current directory
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_fileops.zsh:146`
- **`fssh`** (function) — `fssh`
  Jump to a host from ~/.ssh/config
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_process.zsh:31`
- **`rgf`** (function) — `rgf [initial_query]`
  As you type, the search updates in real-time. Multi-select opens results in buffers.
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: rgf [initial_query]_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_search.zsh:53`
- **`rgrepal`** (function) — `rgrepal <search_pattern> <replace_pattern>`
  Find and replace across files
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: rgrepal <search_pattern> <replace_pattern>_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_search.zsh:118`
- **`tree-dirs`** (function) — `tree-dirs [depth]`
  Show only directories
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: tree-dirs [depth]_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_project.zsh:289`
- **`zsh-clean`** (function) — `zsh-clean [--dry-run]`
  Clean Zsh compiled cache files and force recompilation
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: zsh-clean [--dry-run]_
  - `stow-packages/zsh/.config/zsh/fzf-zsh/_terminal.zsh:50`

### Git (15)

- **`find-repo`** (function) — `find-repo`
  Fuzzy find and jump to a git repository
  - Examples: find-repo (interactive)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_utils.zsh:10`
- **`ga-stage`** (function) — `ga-stage`
  Interactive file staging/unstaging with diff preview Features: Color-coded files, working directory first, unstage capability
  - Examples: ga-stage (select files interactively)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_staging.zsh:12`
- **`gb-delete`** (function) — `gb-delete`
  Fuzzy delete branches with safety checks
  - Examples: gb-delete (interactive)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_branch.zsh:180`
- **`gb-switch`** (function) — `gb-switch`
  Fuzzy switch branches with preview
  - Examples: gb-switch (interactive)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_branch.zsh:30`
- **`gc-reflog`** (function) — `gc-reflog [days]`
  Clean up reflog
  - Examples: gc-reflog 30
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gc-reflog [days]_
  - `stow-packages/zsh/.config/zsh/git-zsh/_cleanup.zsh:74`
- **`gh-at`** (function) — `gh-at [file]`
  View exact file state at any historical commit
  - Examples: gh-at src/api.js
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gh-at [file]_
  - `stow-packages/zsh/.config/zsh/git-zsh/_history.zsh:238`
- **`gh-file`** (function) — `gh-file [file]`
  Interactive patch browser for a file's full history
  - Examples: gh-file src/api.js
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gh-file [file]_
  - `stow-packages/zsh/.config/zsh/git-zsh/_history.zsh:65`
- **`gh-func`** (function) — `gh-func <funcname> [file]`
  Track how a specific function/method evolved using git log -L
  - Examples: gh-func myFunction src/api.js
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gh-func <funcname> [file]_
  - `stow-packages/zsh/.config/zsh/git-zsh/_history.zsh:193`
- **`gh-search`** (function) — `gh-search [-r] <pattern> [file]`
  Pickaxe search — find commits that added or removed a string/regex
  - Examples: gh-search "myFunction" | gh-search -r "my.*Function" src/api.js
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gh-search [-r] <pattern> [file]_
  - `stow-packages/zsh/.config/zsh/git-zsh/_history.zsh:124`
- **`grb-onto`** (function) — `grb-onto`
  Rebase current branch onto target Alias: grbo
  - Examples: grbo (then select target branch)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_merge.zsh:312`
- **`grs-hard`** (function) — `grs-hard`
  Hard reset with commit selection (DANGEROUS)
  - Examples: grs-hard (interactive)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_revert.zsh:186`
- **`gwt-add`** (function) — `gwt-add <branch-name> [base-branch] [--session]`
  Add a new worktree as a flat sibling at project root gwt-add hotfix/bug main gwt-add feature/new-api --session
  - Examples: gwt-add feature/new-api
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gwt-add <branch-name> [base-branch] [--session]_
  - `stow-packages/zsh/.config/zsh/git-zsh/_worktree.zsh:144`
- **`gwt-jump`** (function) — `gwt-jump`
  Fuzzy search and jump to a worktree Note: Detached worktrees appear at end of list
  - Examples: gwt-jump (select from list)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/git-zsh/_worktree.zsh:217`
- **`gwt-pr`** (function) — `gwt-pr <pr-number>`
  Create a worktree for a GitHub PR by number Works with same-repo PRs and fork PRs; handles .bare/, .git/, and old-style bare layouts.
  - Examples: gwt-pr 123
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gwt-pr <pr-number>_
  - `stow-packages/zsh/.config/zsh/git-zsh/_worktree.zsh:764`
- **`prlg`** (function) — `prlg <pr-number>`
  View PR in Lazygit (checkout first, then open Lazygit)
  - Examples: prlg 123
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: prlg <pr-number>_
  - `stow-packages/zsh/.config/zsh/git-zsh/_tui.zsh:70`

### GitHub (15)

- **`1on1-prep`** (function) — `1on1-prep <github-username>`
  Prepare for 1:1 meeting
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: 1on1-prep <github-username>_
  - `stow-packages/zsh/.config/zsh/github-zsh/_team.zsh:97`
- **`ghme`** (function) — `ghme`
  Open your GitHub profile
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:62`
- **`ghrepo`** (function) — `ghrepo <repo-name>`
  Open one of your repositories
  - Examples: ghrepo dotenv
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ghrepo <repo-name>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:66`
- **`ghub`** (function) — `ghub [path]`
  GitHub navigation ghub: GitHub navigation shortcut
  - Examples: ghub angelcantugr/dotenv
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ghub [path]_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:59`
- **`nvissue`** (function) — `nvissue <issue-number>`
  Open Neovim with Octo for issue
  - Examples: nvissue 42
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvissue <issue-number>_
  - `stow-packages/zsh/.config/zsh/github-zsh/_neovim.zsh:26`
- **`nvpr`** (function) — `nvpr <pr-number>`
  Open Neovim with Octo for PR review
  - Examples: nvpr 123
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvpr <pr-number>_
  - `stow-packages/zsh/.config/zsh/github-zsh/_neovim.zsh:13`
- **`nvprlist`** (function) — `nvprlist`
  List PRs in Neovim
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/github-zsh/_neovim.zsh:38`
- **`prcompare`** (function) — `prcompare <pr-number> [base-branch]`
  Compare PR with base branch
  - Examples: prcompare 123 main
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: prcompare <pr-number> [base-branch]_
  - `stow-packages/zsh/.config/zsh/github-zsh/_pr-review.zsh:103`
- **`prfzf`** (function) — `prfzf [options]`
  Smart PR browser with live filters
  - Examples: prfzf --open
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: prfzf [options]_
  - `stow-packages/zsh/.config/zsh/github-zsh/_pr-review.zsh:150`
- **`prmyprs`** (function) — `prmyprs`
  List PRs I created
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/github-zsh/_pr-review.zsh:138`
- **`prneedreview`** (function) — `prneedreview`
  List my PRs that need review
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/github-zsh/_pr-review.zsh:131`
- **`prquick`** (function) — `prquick <pr-number> [approve|comment|changes]`
  Quick PR review: view diff and approve/comment
  - Examples: prquick 123 approve
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: prquick <pr-number> [approve|comment|changes]_
  - `stow-packages/zsh/.config/zsh/github-zsh/_pr-review.zsh:56`
- **`prreview_nvim`** (function) — `prreview_nvim <pr-number>`
  Review a PR: checkout, view in terminal, then open in Neovim
  - Examples: prreview_nvim 123
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: prreview_nvim <pr-number>_
  - `stow-packages/zsh/.config/zsh/github-zsh/_pr-review.zsh:24`
- **`retro-prep`** (function) — `retro-prep [days]`
  Gather retro data
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: retro-prep [days]_
  - `stow-packages/zsh/.config/zsh/github-zsh/_team.zsh:130`
- **`team-prs`** (function) — `team-prs [--all]`
  List all open PRs from your team
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: team-prs [--all]_
  - `stow-packages/zsh/.config/zsh/github-zsh/_team.zsh:20`

### Knowledge Management (15)

- **`note-add`** (function) — `note-add "title" [tags...]`
  Create a linked note
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: note-add "title" [tags...]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_notes.zsh:21`
- **`note-graph`** (function) — `note-graph`
  Visualize note graph (text-based)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_notes.zsh:197`
- **`note-link`** (function) — `note-link "note1" "note2"`
  Link two notes together Without args: fzf-powered selection for both notes
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_notes.zsh:70`
- **`note-recent`** (function) — `note-recent [count]`
  Show recently modified notes
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: note-recent [count]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_notes.zsh:235`
- **`note-search`** (function) — `note-search <keyword>`
  Search notes
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: note-search <keyword>_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_notes.zsh:215`
- **`note-tags`** (function) — `note-tags`
  Browse notes by YAML frontmatter tags
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_notes.zsh:263`
- **`review-add`** (function) — `review-add "question" "answer" [difficulty]`
  Add a review card
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: review-add "question" "answer" [difficulty]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_review.zsh:20`
- **`review-due`** (function) — `review-due`
  Show cards due for review
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_review.zsh:60`
- **`til-add`** (function) — `til-add "what I learned" [tag]`
  Quick TIL capture
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: til-add "what I learned" [tag]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:21`
- **`til-edit`** (function) — `til-edit [date]`
  Edit a TIL file Without args: fzf picker over TIL files with preview With date arg: opens that file directly in $EDITOR
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: til-edit [date]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:155`
- **`til-export`** (function) — `til-export [month]`
  Export TILs to blog post format
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: til-export [month]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:125`
- **`til-list`** (function) — `til-list [days]`
  List recent TILs
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: til-list [days]_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:110`
- **`til-random`** (function) — `til-random`
  Random TIL for review
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:88`
- **`til-search`** (function) — `til-search <keyword>`
  Search TILs (pipes through fzf with preview when available)
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: til-search <keyword>_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:61`
- **`til-tags`** (function) — `til-tags`
  Browse TIL entries by tag
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/knowledge-zsh/_til.zsh:199`

### Neovim (15)

- **`dev-env`** (function) — `dev-env [project_type]`
  Setup development environment in current directory
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: dev-env [project_type]_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:202`
- **`nv`** (function)
  Default Neovim launcher (terminal-based, tmux-friendly)
  - _no documented args; verify manually before wiring a button_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_launcher.zsh:18`
- **`nvi`** (function)
  Force Neovide GUI (for when you need Cmd key support)
  - _no documented args; verify manually before wiring a button_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_launcher.zsh:29`
- **`nvide-current`** (function) — `Call from terminal Neovim with :!nvide-current %`
  Quick switch: Open file under cursor in Neovide
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_launcher.zsh:84`
- **`nvide-open`** (function) — `Run this from terminal Neovim to open same file in Neovide GUI`
  Open current file in Neovide from tmux
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_launcher.zsh:62`
- **`nvim-clean`** (function) — `nvim-clean`
  Clean neovim cache and compiled files
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:66`
- **`nvim-grep`** (function) — `nvim-grep <pattern>`
  Use neovim to search and edit files with ripgrep
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvim-grep <pattern>_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:140`
- **`nvim-health`** (function) — `nvim-health`
  Check neovim health
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:60`
- **`nvim-notes`** (function) — `nvim-notes [note_name]`
  Quick note taking with neovim
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvim-notes [note_name]_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:159`
- **`nvim-plugins`** (function) — `nvim-plugins`
  Update neovim plugins
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:53`
- **`nvim-session`** (function) — `nvim-session [session_name]`
  Start neovim with session management
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvim-session [session_name]_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:29`
- **`nvopen`** (function) — `nvopen <pattern>`
  Open all files matching pattern in neovim buffers
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvopen <pattern>_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:235`
- **`nvproject`** (function) — `nvproject [extensions...]`
  Create markdown concatenation and open in neovim
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvproject [extensions...]_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:226`
- **`nvrecent`** (function) — `nvrecent [cwd|all]`
  Open recent files tracked by Neovim oldfiles
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: nvrecent [cwd|all]_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:80`
- **`project-nvim`** (function) — `project-nvim`
  Open neovim in a project directory (fzf picker)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/neovim-zsh/_tools.zsh:183`

### Other / Misc (15)

- **`ab`** (function) — `ab <url>`
  Open in background (no focus, Vim-like :hide)
  - Examples: ab "youtube.com" (opens in background)
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ab <url>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:44`
- **`ae`** (function) — `ae <url>`
  Open and focus Arc (Vim-like :e edit)
  - Examples: ae "github.com"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ae <url>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:34`
- **`an`** (function) — `an <url>`
  Open in new Arc window (Vim-like :new)
  - Examples: an "news.ycombinator.com"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: an <url>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:39`
- **`ao`** (function) — `ao <url>`
  Open URL in Arc (short: 'a'rc 'o'pen)
  - Examples: ao "google.com"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: ao <url>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:29`
- **`arcset`** (function) — `arcset [search]`
  Quick access to Arc settings (Vim-like :set) arcset: Quick access to Arc settings
  - Examples: arcset passwords
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: arcset [search]_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:132`
- **`devdocs`** (function) — `devdocs <query>`
  DevDocs.io search
  - Examples: devdocs "nginx"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: devdocs <query>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:99`
- **`gsearch`** (function) — `gsearch <query>`
  Google search (gsearch = google search, avoiding git 'gs' alias conflict) gsearch: Google search
  - Examples: gsearch "best tacos in austin"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: gsearch <query>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:86`
- **`locals`** (function) — `locals [port]`
  Localhost with https locals: Open localhost with HTTPS
  - Examples: locals 8443
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: locals [port]_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:122`
- **`muxa`** (function) — `muxa <session-name>`
  Attach to session (or start if doesn't exist)
  - Examples: muxa my-app
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: muxa <session-name>_
  - `stow-packages/zsh/.config/zsh/tmuxinator-aliases.zsh:259`
- **`muxgo`** (function) — `muxgo [dir]`
  Quick start - intelligently picks template
  - Examples: muxgo ~/projects/my-app
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: muxgo [dir]_
  - `stow-packages/zsh/.config/zsh/tmuxinator-aliases.zsh:185`
- **`so`** (function) — `so <query>`
  Stack Overflow (so = stack overflow) so: Stack Overflow search
  - Examples: so "python list comprehension"
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: so <query>_
  - `stow-packages/zsh/.config/zsh/arc-aliases.zsh:80`
- **`tsa`** (function) — `tsa [session-name]`
  Attach to session (creates if doesn't exist)
  - Examples: tsa my-project
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: tsa [session-name]_
  - `stow-packages/zsh/.config/zsh/tmuxinator-aliases.zsh:51`
- **`tsk`** (function) — `tsk <session-name>`
  Kill session with confirmation
  - Examples: tsk my-project
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: tsk <session-name>_
  - `stow-packages/zsh/.config/zsh/tmuxinator-aliases.zsh:32`
- **`tsn`** (function) — `tsn [session-name]`
  Quick session creation
  - Examples: tsn my-project
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: tsn [session-name]_
  - `stow-packages/zsh/.config/zsh/tmuxinator-aliases.zsh:17`
- **`tsr`** (function) — `tsr <new-name>`
  Rename current session
  - Examples: tsr main-dev
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: tsr <new-name>_
  - `stow-packages/zsh/.config/zsh/tmuxinator-aliases.zsh:86`

### Security (10)

- **`attack-surface`** (function) — `attack-surface`
  Show attack surface (listening ports and services)
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/security-zsh/_reporting.zsh:55`
- **`sec-deps`** (function) — `sec-deps`
  Audit dependencies for known vulnerabilities
  - _no required args — good direct key candidate_
  - `stow-packages/zsh/.config/zsh/security-zsh/_scanning.zsh:16`
- **`sec-report`** (function) — `sec-report [out.md]`
  Generate a security report file
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: sec-report [out.md]_
  - `stow-packages/zsh/.config/zsh/security-zsh/_reporting.zsh:16`
- **`sec-scan`** (function) — `sec-scan [path]`
  Comprehensive security scan (secrets + SAST + dependencies)
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: sec-scan [path]_
  - `stow-packages/zsh/.config/zsh/security-zsh/_scanning.zsh:90`
- **`sec-secrets`** (function) — `sec-secrets [path] [--history]`
  Scan for secrets in code or git history
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: sec-secrets [path] [--history]_
  - `stow-packages/zsh/.config/zsh/security-zsh/_scanning.zsh:52`
- **`sech`** (alias)
  security-help
  - _no documented args; verify manually before wiring a button_
  - `stow-packages/zsh/.config/zsh/security-zsh/_help.zsh:66`
- **`secreport`** (alias)
  sec-report
  - _no documented args; verify manually before wiring a button_
  - `stow-packages/zsh/.config/zsh/security-zsh/_help.zsh:65`
- **`secscan`** (alias)
  sec-scan
  - _no documented args; verify manually before wiring a button_
  - `stow-packages/zsh/.config/zsh/security-zsh/_help.zsh:64`
- **`secsec`** (alias)
  sec-secrets
  - _no documented args; verify manually before wiring a button_
  - `stow-packages/zsh/.config/zsh/security-zsh/_help.zsh:63`
- **`threat-model`** (function) — `threat-model [component-name]`
  Threat modeling checklist
  - _needs argument(s) — use Stream Deck property inspector text field. Usage: threat-model [component-name]_
  - `stow-packages/zsh/.config/zsh/security-zsh/_reporting.zsh:40`

## Standalone Scripts, Tmux Scripts & Git Hooks

Executables not covered by the zsh indexer — `.local/bin/`, `tmux/scripts/`, `git/hooks/`, and select `tools/*` utilities.

### Standalone (uncategorized) (8)

- **`alfred-search.py / alfred-search.sh`** (python + bash) — `alfred-search.sh <query>`
  Alfred Script Filter backend for the unified shortcuts database (fuzzy search over shortcuts.json).
  - _designed for Alfred's script-filter protocol (JSON out), not a standalone terminal action — skip_
  - `tools/shortcuts/alfred-search.sh`
- **`business-canvas-generator`** (python) — `business-canvas-generator --input data.json --output canvas`
  Generates a Business Model Canvas (SVG + PNG) from a JSON input file.
  - _needs a JSON input file path — good for a fixed project template, not a generic key_
  - `stow-packages/zsh/.local/bin/business-canvas-generator`
- **`dotenv-starship-git-context`** (zsh) — `dotenv-starship-git-context`
  Prints git repo(branch) context for the starship prompt, handling worktrees.
  - _prompt-integration plumbing, not a user-facing action — skip_
  - `stow-packages/zsh/.local/bin/dotenv-starship-git-context`
- **`notify-input-needed`** (zsh) — `notify-input-needed <cmd> <duration>`
  Sends a desktop notification when a shell command is waiting on input; called by a precmd hook, not by hand.
  - _internal plumbing invoked by shell hooks — skip_
  - `stow-packages/zsh/.local/bin/notify-input-needed`
- **`notify-verify`** (zsh) — `notify-verify`
  Verifies the input-notification system is correctly installed and loaded.
  - _no args, diagnostic check — decent 'health check' button candidate_
  - `stow-packages/zsh/.local/bin/notify-verify`
- **`parse-shortcuts.py`** (python) — `parse-shortcuts.py`
  Parses UNIFIED_KEYBOARD_SHORTCUTS.md into the structured shortcuts.json database.
  - _maintenance/build step for the shortcuts DB, run after editing the source markdown — 'rebuild shortcuts db' button_
  - `tools/shortcuts/parse-shortcuts.py`
- **`show-category.py / show-category.sh (shortcuts)`** (python + bash) — `show-category.sh [category]  (menu if omitted)`
  Displays all keyboard shortcuts for a given category from the unified shortcuts.json database (also used by Alfred).
  - _shows a menu if no category given, otherwise prints a category directly — could wire one button per category (e.g. 'navigation')_
  - `tools/shortcuts/show-category.sh`
- **`vscode-launcher.sh`** (bash) — `vscode-launcher.sh [path]`
  Launches VS Code or VS Code Insiders, picking whichever is available.
  - _already covered conceptually by APP_LAUNCHERS in dev-workflow.config.ts; useful if you want the insiders/stable fallback logic specifically_
  - `tools/vscode/vscode-launcher.sh`

### Git (5)

- **`copilot-git-helper`** (python) — `copilot-git-helper commit-draft | pr-draft | --version`
  Generates Conventional Commit messages and PR drafts via the Copilot CLI.
  - _no required args beyond subcommand — good candidate, one button per subcommand (commit-draft, pr-draft)_
  - `stow-packages/zsh/.local/bin/copilot-git-helper`
- **`copilot-squash.py`** (python) — `copilot-squash.py <commit-range>  (e.g. HEAD~5..HEAD)`
  Aggregates metadata commits in a range into one semantic conventional-commit message via Copilot CLI.
  - _requires a commit-range arg tied to current repo state — property-inspector text field, situational use_
  - `stow-packages/git/.config/git/hooks/lib/copilot-squash.py`
- **`metadata-parser.py`** (python) — `imported by copilot-squash.py`
  Library: parses/aggregates the [type:*][task:*][context:*] structured commit message format. Not a standalone CLI.
  - _library module, not directly invokable — skip_
  - `stow-packages/git/.config/git/hooks/lib/metadata-parser.py`
- **`pre-push (git hook template)`** (bash) — `installed as .git/hooks/pre-push, runs automatically on 'git push'`
  Git pre-push hook: detects metadata-format commits being pushed and auto-invokes squash-helper before allowing the push.
  - _not directly invoked by a user action — skip_
  - `stow-packages/git/.config/git/hooks/templates/pre-push`
- **`squash-helper.sh`** (bash) — `squash-helper.sh <commit-range> [--dry-run]`
  Orchestrates squashing metadata commits: calls copilot-squash.py, performs git ops, rolls back on failure.
  - _needs commit-range arg; mainly invoked automatically by the pre-push hook, not by hand — low priority_
  - `stow-packages/git/.config/git/hooks/lib/squash-helper.sh`

### Tmux (4)

- **`tmux-daily-note.sh`** (zsh) — `tmux-daily-note.sh`
  Opens today's Obsidian daily note in nvim (falls back to ~/notes/daily-<date>.md).
  - _no args, opens editor on today's note — strong direct-key candidate_
  - `stow-packages/tmux/.config/tmux/scripts/tmux-daily-note.sh`
- **`tmux-hud.sh`** (bash) — `tmux-hud.sh`
  Prints a small dashboard: current session, git branch/status, active task, focus-timer remaining.
  - _no args, read-only status view — good 'show status' button (output shown in a pane/popup)_
  - `stow-packages/tmux/.config/tmux/scripts/tmux-hud.sh`
- **`tmux-next-attention.sh`** (bash) — `tmux-next-attention.sh`
  Jumps to the next tmux window flagged as needing attention (notification system).
  - _no args — good direct-key candidate for quick triage_
  - `stow-packages/tmux/.config/tmux/scripts/tmux-next-attention.sh`
- **`tmux-sessionizer.sh`** (bash) — `tmux-sessionizer.sh`
  fzf-driven interactive tmux session manager: list/switch/create sessions from repo directories.
  - _interactive fzf picker — launch-only button (open a terminal running this)_
  - `stow-packages/tmux/.config/tmux/scripts/tmux-sessionizer.sh`

### Knowledge Management (3)

- **`copilot-zsh-history-analyzer.sh`** (zsh) — `copilot-zsh-history-analyzer.sh [--days N] [--history-file PATH] [--output PATH] [--model NAME] [--max-samples N] [--verbose]`
  Analyzes zsh history for command patterns vs. existing functions and generates AI-powered automation proposals via Copilot.
  - _all flags have defaults, runnable with zero args — good 'find new automation ideas' button, but slow/AI-call heavy so best as an occasional-use key_
  - `scripts/copilot-zsh-history-analyzer.sh`
- **`history-analyze`** (zsh) — `history-analyze [summary|today|patterns|timeline|project <keyword>|reconstruct <date>]`
  Analyzes shell history for context reconstruction, patterns, and productivity insights.
  - _several no-arg subcommands (summary, today, patterns, timeline) are great direct-key candidates_
  - `stow-packages/zsh/.local/bin/history-analyze`
- **`markdown-reader.zsh (mdread family)`** (zsh) — `mdread <file>  (and sibling mdread-* variants)`
  Text-to-speech functions for markdown docs: mdread, mdread-clean, mdread-summary, mdread-keypoints, mdread-simple, mdread-list, mdread-find, mdread-recover.
  - _mdread-list / mdread-find are no-arg and good direct keys; the rest need a file path — property-inspector text field_
  - `tools/markdown-reader/markdown-reader.zsh`

### GitHub (2)

- **`gh_board.py`** (python) — `python tools/gh_board.py --interval 120 --limit 200`
  LazyGit-style terminal GitHub board: your issues/PRs to review, PRs you opened, auto-refreshing.
  - _interactive full-screen board — launch-only button, great 'open my GitHub board' key_
  - `tools/gh_board.py`
- **`ghissues`** (bash (launches python/textual TUI)) — `ghissues`
  Interactive GitHub issue browser (Textual TUI), launched via uv.
  - _interactive full-screen TUI — good as a 'launch app in terminal' button, not a run-and-forget action_
  - `stow-packages/zsh/.local/bin/ghissues`

### Neovim (2)

- **`nvim-help`** (bash) — `nvim-help`
  fzf-driven browser over extracted Neovim keymaps/config (nvim-helper package).
  - _interactive fzf browser — launch-only button_
  - `stow-packages/nvim-helper/.local/bin/nvim-help`
- **`nvim-work`** (bash) — `nvim-work`
  Creates/attaches a 'nvim-focused-work' tmux session with nvim + nvim-help + terminal panes.
  - _no args, idempotent (attaches if exists) — excellent 'start my work session' button, this is exactly the kind of thing this Stream Deck plugin's TMUX_SESSIONS is for_
  - `stow-packages/nvim-helper/.local/bin/nvim-work`

### Codex (1)

- **`test-rules.sh (codex)`** (bash) — `test-rules.sh [--pretty] [--rules PATH]`
  Validates Codex CLI execpolicy rules by running test commands against them.
  - _no required args — decent 'validate codex rules' diagnostic button_
  - `tools/codex/test-rules.sh`

### DevOps (1)

- **`repo-discovery.sh`** (bash) — `repo-discovery.sh [--verbose] > ~/.cache/dotenv/repos.txt`
  Scans ~/GithubRepositories and ~/GitRepositories, builds a TSV cache of repos + worktrees.
  - _no required args — good 'refresh repo cache' button_
  - `stow-packages/zsh/.local/bin/repo-discovery.sh`

## Installer & Bootstrap Scripts (completeness — poor Stream Deck fits)

One-shot/idempotent setup scripts. Listed so nothing from the repo scan is silently dropped, but these aren't repeatable actions worth a dedicated key.

- **`bootstrap-aerospace.sh`** — Bootstrap script for AeroSpace window manager environment. (`bootstrap-aerospace.sh`)
- **`bootstrap-alfred.sh`** — Bootstrap script for Alfred workflow setup. (`bootstrap-alfred.sh`)
- **`bootstrap-claude-lsp.sh`** — Bootstrap script for the Claude Code LSP integration. (`bootstrap-claude-lsp.sh`)
- **`bootstrap-claude-marketplace.sh`** — Bootstrap script for the local Claude Code plugin marketplace. (`bootstrap-claude-marketplace.sh`)
- **`bootstrap-claude.sh`** — Bootstrap script for Claude Code configuration. (`bootstrap-claude.sh`)
- **`bootstrap-codex-marketplace.sh`** — Bootstrap script for the local Codex plugin marketplace. (`bootstrap-codex-marketplace.sh`)
- **`bootstrap-codex.sh`** — Bootstrap for Codex CLI configuration (skills location + team config). (`bootstrap-codex.sh`)
- **`bootstrap-copilot-marketplace.sh`** — Bootstrap script for the GitHub Copilot CLI plugin marketplace. (`bootstrap-copilot-marketplace.sh`)
- **`bootstrap-copilot.sh`** — Bootstrap for GitHub Copilot CLI configuration. (`bootstrap-copilot.sh`)
- **`bootstrap-cursor.sh`** — Bootstrap script for Cursor editor configuration. (`bootstrap-cursor.sh`)
- **`bootstrap-devbox.sh`** — Bootstrap script for Devbox environment setup. (`bootstrap-devbox.sh`)
- **`bootstrap-gemini.sh`** — Bootstrap script for Gemini CLI configuration. (`bootstrap-gemini.sh`)
- **`bootstrap-goenv.sh`** — Installs and configures goenv (Go version management). (`bootstrap-goenv.sh`)
- **`bootstrap-jetbrains.sh`** — Bootstrap script for JetBrains IDE environment. (`bootstrap-jetbrains.sh`)
- **`bootstrap-learning-system.sh`** — One-command setup for the AI-powered learning capture system. (`bootstrap-learning-system.sh`)
- **`bootstrap-neovim.sh`** — Bootstrap script for Neovim environment configuration. (`bootstrap-neovim.sh`)
- **`bootstrap-nvm.sh`** — Installs and configures nvm (Node version management). (`bootstrap-nvm.sh`)
- **`bootstrap-tmux.sh`** — Installs tmux + TPM and configures Ghostty/Neovim integration. (`bootstrap-tmux.sh`)
- **`bootstrap-vscode-insiders.sh`** — Bootstrap script for VS Code Insiders setup. (`bootstrap-vscode-insiders.sh`)
- **`bootstrap-vscode.sh`** — Bootstrap script for VS Code environment configuration. (`bootstrap-vscode.sh`)
- **`bootstrap-zed.sh`** — Bootstrap script for Zed editor configuration. (`bootstrap-zed.sh`)
- **`bootstrap-zsh.sh`** — Bootstrap script for zsh environment configuration. (`bootstrap-zsh.sh`)
- **`scripts/install.sh`** — Master installer for the whole dotenv repo; can install all tools or a selected subset. (`scripts/install.sh`)
- **`scripts/test-install-scripts.sh`** — Validates the aerospace/sketchybar install scripts without actually running them. (`scripts/test-install-scripts.sh`)
- **`arc/install-vimium.sh`** — Installs/configures the Vimium extension in Arc browser. (`tools/arc/install-vimium.sh`)
- **`arc/install.sh`** — Installs & configures Arc browser for the dev workflow. (`tools/arc/install.sh`)
- **`crush/install.sh`** — Installs Charmbracelet's Crush AI coding agent. (`tools/crush/install.sh`)
- **`homebrew/install.sh`** — Installs all Homebrew dependencies from the repo's Brewfile. (`tools/homebrew/install.sh`)
- **`homebrew/sync.sh`** — Updates Homebrew deps and ensures all required tools are current. (`tools/homebrew/sync.sh`)
- **`markdown-reader/install-markdown-reader.sh`** — Installs the markdown-reader zsh functions. (`tools/markdown-reader/install-markdown-reader.sh`)
- **`markdown-reader/test-markdown-reader.sh`** — Smoke-tests the markdown-reader functions. (`tools/markdown-reader/test-markdown-reader.sh`)
- **`pipx/install.sh`** — Ensures pipx-managed Python CLI apps are installed/up to date. (`tools/pipx/install.sh`)
- **`shortcuts/alfred-setup-guide.sh`** — Prints a visual step-by-step guide for setting up the Alfred shortcuts workflow. (`tools/shortcuts/alfred-setup-guide.sh`)
- **`shortcuts/install-alfred-workflow.sh`** — Auto-creates and installs the Alfred Shortcuts Quick Reference workflow. (`tools/shortcuts/install-alfred-workflow.sh`)

