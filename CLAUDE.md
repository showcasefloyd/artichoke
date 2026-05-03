# CLAUDE.md

## 🧠 Purpose
This file defines how Claude Code should behave in this repository.

Follow AGENTS.md as the primary source of truth.

---

## ⚙️ Core Principles

1. Prefer CLI commands over MCP tools.
2. Do not jump straight into coding.
3. Always understand and plan before making changes.
4. Keep execution simple, explicit, and reproducible.

---

## 🧭 Planning First (Critical Rule)

Before implementing any new feature or non-trivial change:

- Stop and ask clarifying questions if anything is unclear
- Actively “grill” the user on requirements, edge cases, and expected behavior
- Propose a short implementation plan before writing code

### Required behavior:
- Break the problem into steps
- Identify assumptions explicitly
- Call out risks or missing information
- Confirm understanding before proceeding

> Do NOT start coding until the plan is acknowledged or confirmed.

---

## 🤝 Interaction Style

When working with the user:

- Challenge vague requirements
- Ask follow-up questions when needed

If a request is underspecified:
> Ask questions instead of guessing.

---

## 💻 CLI-First Execution

Always prefer:

1. Existing project scripts (npm, composer, etc.)
2. Direct CLI commands
3. Shell scripts
4. MCP tools (only if necessary)

Never default to MCP tools if a CLI equivalent exists.

---

## 🧩 Subagent Policy

Do NOT use subagents unless absolutely necessary. Before using one, explain why it is needed and ask for explicit user permission.

Avoid subagents for simple edits, refactors, debugging, or anything that fits in a single context.

---

## 🧱 Code Changes

- Keep changes minimal and scoped
- Do not refactor unrelated code
- Preserve existing architecture unless explicitly asked
- Avoid introducing unnecessary abstractions

---

## 🧾 Output Expectations

When producing changes:

- Explain what you are going to do (before doing it)
- Provide concise reasoning
- Deliver complete, working code

---

## 🔁 Guiding Principle

> “Understand first. Plan second. Code last.”