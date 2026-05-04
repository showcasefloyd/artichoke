# AGENTS.md

Priorities:
1. Correctness
2. Simplicity
3. Readability
4. Maintainability
5. Performance (only when necessary)

---

## ⚙️ General Rules

- Do not over-engineer solutions.
- Prefer simple, explicit code over clever abstractions.
- Keep changes minimal and scoped strictly to the request.
- Do not modify unrelated files.
- If requirements are unclear, ask clarifying questions before implementing.
- Test that the backend and frontend are working before assuming that changes are corret

---

## 🧩 Tech Stack

### Frontend
- React (functional components only)
- Prefer TypeScript if already present in the project
- Hooks (`useState`, `useEffect`) over class components
- Avoid unnecessary state or re-renders

### Backend
- PHP (assume modern PHP 8+ unless otherwise specified)
- Prefer:
  - Simple procedural logic or lightweight classes
  - Native PHP functions over heavy frameworks (unless already in use)
- Keep backend logic clear and explicit

### Development

- Use Docker Containers
- Favor
  - Docker Compose over complex orchestration
  - Simple networking over premature optimization

---

## 🧱 Code Style

### General
- Use descriptive variable and function names
- Keep functions small and single-purpose
- Avoid deep nesting when possible
- Prefer explicit logic over implicit behavior

### React
- Keep components small and focused
- Co-locate related logic where it improves readability
- Avoid premature abstraction
- Only use `useMemo`, `useCallback`, etc. when there is a clear performance need

### PHP
- Write readable, linear request flows where possible
- Avoid unnecessary abstraction layers
- Sanitize inputs explicitly when handling external data
- Keep output logic separate from business logic when practical

---

## 🔌 Frontend ↔ Backend Integration

- Assume communication happens via HTTP (REST-style endpoints unless otherwise specified)
- Prefer JSON as the data format
- Keep API responses simple and consistent
- Avoid over engineering API layers unless required

---

## 🧪 Testing

- Prefer lightweight tests when applicable
- Focus on:
  - Core business logic
  - Utility functions
- Do not introduce testing frameworks unless already part of the project

---

## 📁 File & Project Structure

- Do not rename or move files unless explicitly requested
- Follow existing project structure and conventions
- Keep changes localized and predictable

---

## 🧾 Output Expectations

When making changes:
- Clearly explain what changed and why
- Provide complete, working code (no placeholders unless explicitly requested)
- Keep explanations concise and practical

---

## 🚫 What to Avoid

- Over-engineering or premature abstraction
- Introducing new dependencies without justification
- Large refactors unrelated to the request
- Ignoring existing code patterns or structure

---

## ❓ When Unsure

- Ask clarifying questions before proceeding
- Offer 1–2 reasonable implementation options
- If possible present reasonable pros and cons
- Default to the simplest working solution

---

## 🔁 Guiding Principle

> "Make it work, make it clear, improve only when needed."