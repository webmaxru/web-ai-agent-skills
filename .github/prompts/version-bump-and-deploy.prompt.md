---
name: "Version Bump & Deploy"
description: "Scan skills and saved prompts for version consistency, bump versions where needed, commit, push, and deploy skills if any were bumped. Detects both local-vs-remote drift and same-version content changes in git history."
argument-hint: "Optional: scope to a specific skill or prompt, e.g. /skills/agent-package-manager or /prompts/version-bump-and-deploy.prompt.md"
agent: "agent"
---

Scan skills and saved prompts to detect whether a version bump is needed, perform it if so, commit, push, and deploy.

CI now handles this automatically after skill changes are merged; use this prompt only as a manual fallback.

**Scope constraint:** Only scan the following two repository-root directories. Do NOT scan any other locations (e.g., `apm_modules/`, `.github/skills/`, `.github/prompts/`, or any nested skill/prompt directories elsewhere in the tree):

- `/skills` — skill directories
- `/prompts` — saved prompt files

## Step 1: Gather current state

1. List all skill directories directly under `/skills`. For each, read the YAML frontmatter of `SKILL.md` and extract `metadata.version`. Ignore skill directories found anywhere else in the repo.
2. List all prompt files directly under `/prompts`. For each, read the YAML frontmatter and note whether a `version` field exists. Ignore prompt files found anywhere else in the repo.
3. Fetch the latest remote state:
   ```bash
   git fetch origin
   ```
4. Determine the default remote branch name (`main` or `master`):
   ```bash
   git symbolic-ref refs/remotes/origin/HEAD | sed 's|refs/remotes/origin/||'
   ```
   Use the result as `BRANCH` in subsequent commands.

## Step 2: Check each skill for version bump need

For each skill directory `/skills/<skill-name>/`, evaluate **both** criteria:

**Criterion A — Local differs from remote:**
```bash
git diff origin/BRANCH -- skills/<skill-name>/
```
If any diff exists (uncommitted changes, committed-but-not-pushed changes, or both), this criterion is met.

**Criterion B — Repo contains two consecutive content states with the same version:**
Find the two most recent commits that touched this skill:
```bash
git log -2 --format="%H" origin/BRANCH -- skills/<skill-name>/
```
If two commits are found, extract `metadata.version` from `SKILL.md` at each commit:
```bash
git show <commit1>:skills/<skill-name>/SKILL.md
git show <commit2>:skills/<skill-name>/SKILL.md
```
Parse the `metadata.version` from the YAML frontmatter of each. If:
- The two commits have **different file content** but the **same `metadata.version`**, this criterion is met.
- If only one commit exists (first commit for this skill), criterion B does not apply.

A skill **needs a version bump** if criterion A **or** criterion B (or both) is met.

For each skill, report:
- Which criteria triggered (A, B, or both)
- Current `metadata.version`
- Brief summary of what changed

## Step 3: Check each saved prompt for version bump need

For each file in `/prompts/`:

**Criterion A — Local differs from remote:**
```bash
git diff origin/BRANCH -- prompts/<filename>
```
If any diff exists, note the prompt has local changes.

**Criterion B — Same version, different content:**
Only applies if the prompt file has a `version` field in its YAML frontmatter. If it does, apply the same two-commit comparison logic as for skills. If the prompt has **no version field**, criterion B does not apply.

A prompt **needs a version bump** only if it has a `version` field and criterion A or B is met.
If it has no `version` field, only report that it has uncommitted/unpushed changes (criterion A) for awareness, but do not add a version field.

## Step 4: Perform version bumps

For each skill that needs a version bump:
1. Read the current `metadata.version` from `SKILL.md`.
2. Increment the **minor** segment by 1 (e.g., `"1.2"` → `"1.3"`, `"2.5"` → `"2.6"`).
3. If the version uses three segments, increment the **patch** segment (e.g., `"1.2.0"` → `"1.2.1"`).
4. Update the `metadata.version` field in the skill's `SKILL.md` frontmatter.

For each prompt that has a `version` field and needs a bump:
1. Apply the same increment logic as above.

Maintain a list of all skills and prompts that were bumped. This list is needed for later steps.

If no skills or prompts need bumping, report "All versions are up to date" and **stop**.

## Step 5: Commit and push

1. Stage all modified files:
   ```bash
   git add skills/ prompts/
   ```
2. Commit with a message listing what was bumped:
   ```bash
   git commit -m "chore: version bump <comma-separated list of bumped skill/prompt names>"
   ```
3. Push to the remote:
   ```bash
   git push origin BRANCH
   ```
4. If push is rejected due to remote changes:
   ```bash
   git pull --rebase origin BRANCH
   git push origin BRANCH
   ```

## Step 6: Deploy skills if any were bumped

If **at least one skill** was version-bumped in Step 4, deploy the full skill collection using the **agent-skill-deploy** skill.

1. Read the [agent-skill-deploy SKILL.md](../../skills/agent-skill-deploy/SKILL.md).
2. Follow its deploy workflow in full: pre-flight → analyze → confirm version and surfaces with user → dry run → bump → commit → tag → user approval → push and deploy.
3. Use the bumped skill versions as context for the deploy analysis.

If **no skills** were bumped (only prompts had changes), skip deployment entirely.
