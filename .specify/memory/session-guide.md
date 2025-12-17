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

**Last Updated**: 2024-12-17  
**Current Branch**: `001-meal-planner`  
**Current Phase**: Phase 1 in progress — Foundation Layer

### Completed This Session

- ✅ **Task 1.1**: Define TypeScript types (`Dish`, `MealPlan`, `DayAssignment`)
- ✅ **Task 1.2**: Implement StorageService (dishes CRUD)
- ✅ **Task 1.3**: Implement StorageService (plans CRUD + export/import)
- ✅ **Task 1.5**: Create `useDishes` hook for React state management
- ✅ 54 unit tests passing (storage + hook)

### Recommended Next Steps

When starting the next session, propose these options to the user:

1. **Continue Phase 1 — UI Primitives**
   - Task 1.6: Button component (primary, secondary, ghost variants)
   - Task 1.7: Input component (with label and error display)
   - Task 1.8: Card component (with padding/elevation options)
   - Task 1.9: EmptyState component (friendly empty state display)

2. **Jump to Phase 2 — Add a Dish**
   - Skip UI primitives for now, build with Tailwind directly
   - Task 2.1–2.5: DishTypeSelector, DishForm, AddDishPage

**Recommendation**: Build UI primitives first (1.6–1.9). They're quick,
satisfying, and will make the Add Dish flow faster to build.

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
