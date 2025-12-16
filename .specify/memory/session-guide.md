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

**Last Updated**: 2024-12-16  
**Current Branch**: `001-meal-planner`  
**Current Phase**: Phase 0 in progress (Tasks 0.1–0.4 complete)

### Completed This Session

- ✅ **Task 0.2**: Added Tailwind CSS v4 with Vite plugin
- ✅ **Task 0.3**: Created folder structure (components, pages, hooks, services, types, utils, tests)
- ✅ **Task 0.4**: Setup testing with Vitest + React Testing Library
- ✅ Established conventions: commit after each task, update tasks.md checkboxes

### Recommended Next Steps

When starting the next session, propose these options to the user:

1. **Continue Phase 0** — Two tasks remain
   - Task 0.5: Setup routing (React Router)
   - Task 0.6: PWA foundation

2. **Complete Phase 0 + start Phase 1** — Finish setup, begin foundation
   - All remaining Phase 0 tasks
   - Start on types (Task 1.1) and StorageService (Task 1.2)

**Recommendation**: Continue with Task 0.5 (React Router).

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

- **Markdown lint cleanup**: ~195 pre-existing lint errors (mostly line length).
  Consider a dedicated cleanup pass or relaxing the 80-char rule.

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
