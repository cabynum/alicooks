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
**Current Phase**: Phase 0 complete ✅ — Ready for Phase 1

### Completed This Session

- ✅ **Task 0.5**: Setup React Router with `/` and `/add` routes
- ✅ **Task 0.6**: PWA foundation (manifest.json, icons, meta tags)
- ✅ Created placeholder `HomePage` and `AddDishPage` components
- ✅ **Fix**: Added PNG icons for PWA compatibility (SVGs don't work)

### Recommended Next Steps

When starting the next session, propose these options to the user:

1. **Start Phase 1** — Foundation Layer
   - Task 1.1: Define TypeScript types (`Dish`, `MealPlan`, etc.)
   - Task 1.2: Implement StorageService (dishes CRUD)
   - Task 1.3: Implement StorageService (plans CRUD)

2. **Quick win: UI primitives first**
   - Tasks 1.6–1.9: Build Button, Input, Card, EmptyState components
   - These are visual and satisfying to complete

**Recommendation**: Start with Task 1.1 (TypeScript types) — everything
else depends on these definitions.

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
