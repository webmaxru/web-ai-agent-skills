# Skill automation

The shared workflows are maintained in [ai-native-dev](https://github.com/webmaxru/ai-native-dev/tree/main/.github/automation). See its [automation index](https://github.com/webmaxru/ai-native-dev/blob/main/.github/automation/README.md), [weekly update guide](https://github.com/webmaxru/ai-native-dev/blob/main/.github/automation/weekly-updates.md), and [release guide](https://github.com/webmaxru/ai-native-dev/blob/main/.github/automation/release.md).

## Repository settings

- `AUTO_SHIP`: unset or any value other than `false` enables merging eligible skill-update PRs after an authorized human approval.
- `AUTO_RELEASE`: unset or any value other than `false` enables automatic releases after skill changes are merged. Manual workflow dispatch remains available when this is `false`.
- `COPILOT_GITHUB_TOKEN`: required by the weekly skill-update worker; it must be available to the calling repository.

The weekly prompts and skills remain in this repository. The plugin version is mirrored in `.claude-plugin/plugin.json`, `.github/plugin/plugin.json`, and `package.json`; there is no local marketplace manifest to update.
