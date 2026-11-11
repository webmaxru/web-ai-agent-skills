---
name: "Integration Smoke Test"
description: "Verify PR-event runtime prompt context without repository edits."
argument-hint: "No arguments."
agent: "agent"
---

For this temporary workflow integration test, read `.github/aw/skill-update-runtime.md` in full with a read-only workspace file tool. Confirm it identifies `.github/prompts/integration-smoke-skill-update.prompt.md`, then report the identified prompt path in a final `noop` message. Do not use Bash or Git, edit or create files, or request a pull request.

This test intentionally requires no repository changes.
