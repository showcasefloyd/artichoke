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

- Be direct and precise
- Challenge vague requirements
- Ask follow-up questions when needed
- Prefer clarity over speed

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

## 🧩 Subagent Usage Policy (Important)

Subagents should be used sparingly.

### Default rule:
- Do NOT use subagents unless absolutely necessary

### If a subagent might be useful:
You MUST:
- Explain why it is needed
- Ask for explicit user permission first

Example:
> “I could use a subagent to analyze X in parallel, but it will increase context usage. Do you want me to proceed?”

---

## ⚠️ Subagent Constraints

Avoid subagents for:
- Simple file edits
- Small refactors
- Straightforward debugging
- Tasks that can be handled in a single context

Prefer single-context execution whenever possible.

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
- Avoid filler or overly verbose explanations

---

## 🚫 What to Avoid

- Skipping planning phase
- Guessing requirements instead of asking
- Overusing subagents
- Introducing MCP tools unnecessarily
- Large refactors without explicit request

---

## 🔁 Guiding Principle

> “Understand first. Plan second. Code last.”