# AliCooks Session Guide

Quick reference for starting and ending AI pair programming sessions.

## Slash Commands

| Command           | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `/alicooks.start` | Start a new session (loads context)            |
| `/alicooks.lint`  | Check all markdown files for linting errors    |
| `/alicooks.save`  | End a session (saves context, suggests commit) |

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
**Current Phase**: Phase 2 complete ✅ — Ready for Phase 3

### Completed This Session

- ✅ **Bug resolved**: Dishes now display correctly after adding
  - Root cause: Stale Vite cache (`node_modules/.vite`)
  - Fix: Cleared cache and restarted dev server
- ✅ Added `npm run dev:fresh` script to prevent future cache issues
- ✅ Removed debug console.log statements (cleanup)
- ✅ Updated `tasks.md` to mark Phase 1 & 2 tasks complete
- ✅ Created **blog/part-4-first-feature.md** documenting Phase 2 and the cache debugging lesson
- ✅ 196 tests passing

### Phase 1 & 2 Summary

All code complete and working:

| Phase                | Tasks   | Status      |
| -------------------- | ------- | ----------- |
| Phase 1 (Foundation) | 1.1–1.9 | ✅ Complete |
| Phase 2 (Add a Dish) | 2.1–2.5 | ✅ Complete |

Full add dish flow verified in browser:

- Navigate to `/add`
- Enter dish name, select type
- Submit → dish saved to localStorage
- Navigate back to `/` → dish appears in list

### Test Count

| Layer            | Tests   |
| ---------------- | ------- |
| Storage Service  | 34      |
| useDishes Hook   | 15      |
| Button           | 26      |
| Input            | 22      |
| Card             | 18      |
| EmptyState       | 14      |
| DishTypeSelector | 18      |
| DishForm         | 28      |
| AddDishPage      | 14      |
| App              | 2       |
| **Total**        | **196** |

### Recommended Next Steps

1. **Begin Phase 3 — View My Dishes**
   - 3.1 DishCard component (display dish with type badge)
   - 3.2 DishList component (list of DishCards + empty state)
   - 3.3 HomePage polish (integrate DishList, improve layout)
2. Optional: Add dish type filtering (Task 3.4)

### Key Files

| Purpose             | Path                                                |
| ------------------- | --------------------------------------------------- |
| Constitution        | `.specify/memory/constitution.md`                   |
| Feature Spec        | `specs/001-meal-planner/spec.md`                    |
| Implementation Plan | `specs/001-meal-planner/plan.md`                    |
| **Task Breakdown**  | `specs/001-meal-planner/tasks.md`                   |
| Data Model          | `specs/001-meal-planner/data-model.md`              |
| Component Contracts | `specs/001-meal-planner/contracts/components.md`    |
| Quality Checklist   | `specs/001-meal-planner/checklists/requirements.md` |
| Blog Posts          | `blog/` (Part 1 & Part 2)                           |
| Markdown Rules      | `.cursor/rules/markdown-linting.mdc`                |
| This Guide          | `.specify/memory/session-guide.md`                  |

### Open Decisions

- None currently — markdown lint issue resolved (relaxed to 120 chars)

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
