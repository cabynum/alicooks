# AliCooks Session Guide

Quick reference for starting and ending AI pair programming sessions.

## Slash Commands

| Command | Purpose |
| ----------------- | ---------------------------------------------- |
| `/alicooks.start` | Start a new session (loads context) |
| `/alicooks.idea` | Capture a feature idea to the backlog |
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
1. Check for uncommitted changes (git status) and commit if needed
2. Update the "Current Status" section in `.specify/memory/session-guide.md`
3. Update the blog post(s) in `blog/` if significant progress was made
```

## Current Status

**Last Updated**: 2024-12-18  
**Current Branch**: `001-meal-planner`  
**Current Phase**: Phase 6 complete ✅ — Ready for Phase 7

### Completed This Session

- ✅ **Phase 6 complete**: Edit & Delete Dishes working
  - `EditDishPage` for modifying existing dishes
  - Delete confirmation modal with warning about meal plan removal
  - Cascade delete: removes dish from all meal plans automatically
  - Route: `/edit/:dishId`
  - Dishes are tappable from HomePage to edit
- ✅ 454 tests passing (26 new tests for Phase 6)

### Phase Summary

| Phase | Tasks | Status |
| ---------------------------- | ------- | ----------- |
| Phase 1 (Foundation) | 1.1–1.9 | ✅ Complete |
| Phase 2 (Add a Dish) | 2.1–2.5 | ✅ Complete |
| Phase 3 (View My Dishes) | 3.1–3.5 | ✅ Complete |
| Phase 4 (Meal Suggestions) | 4.1–4.6 | ✅ Complete |
| Phase 5 (Plan a Menu) | 5.1–5.7 | ✅ Complete |
| Phase 6 (Edit & Delete) | 6.1–6.2 | ✅ Complete |

Full CRUD for dishes complete:

- Add dishes with name and type
- View all dishes on HomePage (tappable to edit)
- Edit dish name and type
- Delete dishes with confirmation modal
- Cascade delete from meal plans

### Test Count

| Layer | Tests |
| ------------------ | ------- |
| Storage Service | 39 |
| Suggestion Service | 20 |
| useDishes Hook | 15 |
| useSuggestion Hook | 17 |
| usePlans Hook | 25 |
| Button | 26 |
| Input | 22 |
| Card | 18 |
| EmptyState | 14 |
| DishTypeSelector | 18 |
| DishCard | 26 |
| DishList | 21 |
| SuggestionCard | 17 |
| DaySlot | 22 |
| DishForm | 28 |
| AddDishPage | 14 |
| EditDishPage | 26 |
| SuggestionPage | 16 |
| PlanPage | 20 |
| DayAssignmentPage | 22 |
| HomePage | 24 |
| App | 2 |
| **Total** | **454** |

### Recommended Next Steps

1. **Begin Phase 7 — Data Export**
   - 7.1 Create useExport hook (exportToFile, importFromFile)
   - 7.2 Add export UI (settings/menu with export option)
2. Optional: Add dish type filtering (Task 3.4, deferred)
3. Optional: Begin Phase 8 — Final Polish

### Key Files

| Purpose | Path |
| ------------------- | --------------------------------------------------- |
| Constitution | `.specify/memory/constitution.md` |
| **Ideas Backlog** | `.specify/memory/ideas.md` |
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

- None currently — markdown lint issue resolved (relaxed to 120 chars)

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
