---
name: "Add Agent Plugin Distribution"
description: "Add Claude Code, VS Code (GitHub Copilot), and Copilot CLI plugin distribution to an agent skills repository. Creates plugin manifests, marketplace catalogs, and README documentation so all skills can be installed as a single plugin."
argument-hint: "plugin-name=<name> owner=<GitHub owner/repo> author=<author name>"
---

Add agent plugin distribution support to this repository so all skills in the `skills/` directory can be installed as a single plugin across Claude Code, VS Code (GitHub Copilot), and GitHub Copilot CLI.

## Required inputs

Before starting, collect these values. If any are missing, ask the user:

1. **Plugin name** — kebab-case identifier for the plugin (for example, `web-ai-skills`). This becomes the namespace prefix in Claude Code (`/plugin-name:skill-name`) and the install target in Copilot CLI.
2. **Repository owner/name** — GitHub `owner/repo` (for example, `webmaxru/web-ai-agent-skills`).
3. **Author name** — display name for the plugin author.
4. **Plugin description** — one-sentence summary of what the skills cover.
5. **License** — license identifier (default: `MIT`).
6. **Keywords** — list of discovery tags relevant to the skills.

## Before editing

- Read the repository `README.md` to understand existing structure and conventions.
- Inventory the `skills/` directory to build the skill list for the description and plugin structure tree.
- Verify each skill has a `SKILL.md` with `name` and `description` frontmatter (required by all three plugin hosts).

## Phase 1: Create plugin manifest

Create `.claude-plugin/plugin.json` at the repository root. This manifest is read by Claude Code, VS Code, and Copilot CLI.

Use this structure, replacing placeholders with collected values:

```json
{
  "name": "<plugin-name>",
  "version": "1.0.0",
  "description": "<plugin-description>",
  "author": {
    "name": "<author-name>"
  },
  "homepage": "https://github.com/<owner>/<repo>",
  "repository": "https://github.com/<owner>/<repo>",
  "license": "<license>",
  "keywords": [<keywords>]
}
```

Do not add component path overrides — the default `skills/` directory is auto-discovered.

## Phase 2: Create marketplace catalogs

Two marketplace files are needed so all three environments can discover the plugin when the repository is added as a marketplace.

### Claude Code and VS Code catalog

Create `.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "<owner>-<repo>",
  "version": "1.0.0",
  "description": "<plugin-description>",
  "owner": {
    "name": "<author-name>"
  },
  "plugins": [
    {
      "name": "<plugin-name>",
      "description": "<plugin-description>",
      "source": ".",
      "category": "development"
    }
  ]
}
```

### Copilot CLI catalog

Create `.github/plugin/marketplace.json`:

```json
{
  "name": "<owner>-<repo>",
  "owner": {
    "name": "<author-name>"
  },
  "metadata": {
    "description": "<plugin-description>",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "<plugin-name>",
      "description": "<plugin-description>",
      "version": "1.0.0",
      "source": "."
    }
  ]
}
```

The marketplace name (`<owner>-<repo>`) must be consistent across both files.

## Phase 3: Update README

Make three additions to the README. Adapt the content to match the repository's existing tone and structure.

### 3a: Quick Install section

Add a "Quick Install as Plugin" section early in the README (after the project description, before the table of contents or detailed install instructions). Keep it concise — one command block per environment:

```markdown
## Quick Install as Plugin

Install all skills at once as a single agent plugin. Pick your environment:

**Claude Code**

\`\`\`bash
/plugin marketplace add <owner>/<repo>
/plugin install <plugin-name>@<owner>-<repo>
\`\`\`

**VS Code (GitHub Copilot)**

Run **Chat: Install Plugin From Source** from the Command Palette and enter:

\`\`\`text
https://github.com/<owner>/<repo>
\`\`\`

**GitHub Copilot CLI**

\`\`\`bash
copilot plugin marketplace add <owner>/<repo>
copilot plugin install <plugin-name>
\`\`\`
```

### 3b: Agent Plugin Distribution section

Add a detailed "Agent Plugin Distribution" section (after Included Skills or equivalent, before Supporting Assets or equivalent). Include subsections for:

**Claude Code** with:
- Local testing via `claude --plugin-dir`
- Marketplace install via `/plugin install`
- Self-hosted marketplace via `/plugin marketplace add`

**VS Code (GitHub Copilot)** with:
- Note that agent plugins are in preview (`chat.plugins.enabled` setting)
- Local testing via `chat.pluginLocations` setting
- Install from source via Command Palette
- Marketplace via `chat.plugins.marketplaces` setting
- Workspace recommendation via `enabledPlugins` and `extraKnownMarketplaces`

**GitHub Copilot CLI** with:
- Local install via `copilot plugin install ./path`
- Marketplace install via `copilot plugin marketplace add`
- Uninstall via `copilot plugin uninstall`

**Plugin structure** showing the directory tree with:
- `.claude-plugin/plugin.json` and `marketplace.json`
- `.github/plugin/marketplace.json`
- `skills/` with each skill listed

### 3c: Table of contents

If the README has a table of contents, add entries for the new sections.

## Phase 4: Verify

After all files are created and the README is updated:

1. Confirm `.claude-plugin/plugin.json` is valid JSON.
2. Confirm `.claude-plugin/marketplace.json` is valid JSON and the `plugins[].name` matches the `name` in `plugin.json`.
3. Confirm `.github/plugin/marketplace.json` is valid JSON and the `plugins[].name` matches the `name` in `plugin.json`.
4. Confirm every skill in `skills/` has a `SKILL.md` with `name` and `description` in YAML frontmatter.
5. Confirm the README quick-install commands use the correct `<owner>/<repo>`, `<plugin-name>`, and marketplace name.

## Reference documentation

- Claude Code plugins: https://code.claude.com/docs/en/plugins
- Claude Code plugin reference: https://code.claude.com/docs/en/plugins-reference
- Claude Code plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- VS Code agent plugins: https://code.visualstudio.com/docs/copilot/customization/agent-plugins
- Copilot CLI plugin creation: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating
- Copilot CLI plugin marketplaces: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace
