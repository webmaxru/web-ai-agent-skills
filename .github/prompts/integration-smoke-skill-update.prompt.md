---
name: "Integration Smoke Test"
description: "Make a temporary one-line change to an internal smoke-test file to verify the weekly update workflow."
argument-hint: "No arguments."
agent: "agent"
---

For this temporary workflow integration test, create only the new file `skills/integration-smoke/assets/weekly-update-smoke.txt` with the single line `verified`. Do not edit any other files.

Create one draft pull request titled `integration-smoke: verify cross-repo weekly caller`, and state in its body that this is a temporary workflow test with no skill content changes.
