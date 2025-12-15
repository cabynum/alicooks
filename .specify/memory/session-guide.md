# AliCooks Session Guide

Quick reference for starting and ending AI pair programming sessions.

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/alicooks.start` | Start a new session (loads context) |
| `/alicooks.lint` | Check all markdown files for linting errors |
| `/alicooks.save` | End a session (saves context, suggests commit) |

## Starting a New Session

Type `/alicooks.start` in Cursor, or paste this prompt:

```text
Let's continue working on AliCooks.

Please read these files to get up to speed:
- `.specify/memory/constitution.md` (project principles)
- `.specify/memory/session-guide.md` (this file - for current status)

Current status: [see below]
```

## Ending a Session

Type `/alicooks.save` in Cursor, or ask:

```text
Before we end, please:
1. Update the "Current Status" section in `.specify/memory/session-guide.md`
2. Update the blog post(s) in `blog/` if significant progress was made
3. Suggest a git commit message for today's work
```

## Current Status

**Last Updated**: 2024-12-15  
**Current Branch**: `001-meal-planner`  
**Current Phase**: Phase 0 in progress (Task 0.1 complete)

### Completed This Session

- ✅ Created task breakdown: `specs/001-meal-planner/tasks.md` (47 tasks)
- ✅ **Task 0.1**: Initialized Vite + React 19 + TypeScript 5.9 project
- ✅ Configured strict mode and path aliases (`@/` → `src/`)
- ✅ Verified dev server runs at localhost:5173

### Recommended Next Steps

When starting the next session, propose these options to the user:

1. **Continue Phase 0** — Pick up where we left off
   - Task 0.2: Add Tailwind CSS
   - Task 0.3: Create folder structure
   - Task 0.4: Setup testing (Vitest)
   - Task 0.5: Setup routing (React Router)
   - Task 0.6: PWA foundation

2. **Complete Phase 0 + start Phase 1** — Finish setup, begin foundation
   - All remaining Phase 0 tasks
   - Start on types and StorageService

**Recommendation**: Continue with Task 0.2 (Tailwind CSS).

### Key Files

| Purpose | Path |
|---------|------|
| Constitution | `.specify/memory/constitution.md` |
| Feature Spec | `specs/001-meal-planner/spec.md` |
| Implementation Plan | `specs/001-meal-planner/plan.md` |
| **Task Breakdown** | `specs/001-meal-planner/tasks.md` |
| Data Model | `specs/001-meal-planner/data-model.md` |
| Component Contracts | `specs/001-meal-planner/contracts/components.md` |
| Quality Checklist | `specs/001-meal-planner/checklists/requirements.md` |
| Blog Posts | `blog/` (Part 1 & Part 2) |
| Markdown Rules | `.cursor/rules/markdown-linting.mdc` |
| This Guide | `.specify/memory/session-guide.md` |

### Open Decisions

- **Markdown lint cleanup**: 227 pre-existing lint errors (mostly line length).
  Consider a dedicated cleanup pass or relaxing the 80-char rule.

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
