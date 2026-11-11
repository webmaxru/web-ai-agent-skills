---
name: "Integration Smoke Test"
description: "Make a temporary one-line change to an internal smoke-test file to verify the weekly update workflow."
argument-hint: "No arguments."
agent: "agent"
---

For this temporary workflow integration test, update only `assets/weekly-update-integration-smoke.txt` by replacing its single line `initial` with `verified`. Do not edit any skill files or any other files.

Create one draft pull request titled `integration-smoke: verify cross-repo weekly caller`, and state in its body that this is a temporary workflow test with no skill content changes.
