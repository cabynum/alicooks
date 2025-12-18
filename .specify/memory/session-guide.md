# AliCooks Session Guide

Quick reference for starting and ending AI pair programming sessions.

## Slash Commands

| Command           | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `/alicooks.start` | Start a new session (loads context)            |
| `/alicooks.idea`  | Capture a feature idea to the backlog          |
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

**Last Updated**: 2024-12-18  
**Current Branch**: `001-meal-planner`  
**Current Phase**: Phase 3 complete ✅ — Ready for Phase 4

### Completed This Session

- ✅ **Phase 3 complete**: View My Dishes feature working
  - DishCard component with type badges (amber/emerald/stone)
  - DishList component with empty state and plate icon
  - HomePage rebuilt with DishList, FAB, and "coming soon" placeholders
- ✅ Created `/alicooks.idea` command for capturing feature ideas
- ✅ Created ideas backlog (`.specify/memory/ideas.md`)
- ✅ 264 tests passing (68 new tests for Phase 3)

### Phase Summary

| Phase                     | Tasks   | Status      |
| ------------------------- | ------- | ----------- |
| Phase 1 (Foundation)      | 1.1–1.9 | ✅ Complete |
| Phase 2 (Add a Dish)      | 2.1–2.5 | ✅ Complete |
| Phase 3 (View My Dishes)  | 3.1–3.5 | ✅ Complete |

Full view dishes flow verified in browser:

- Empty state shows plate icon and "Add a Dish" button
- Dishes display with name and type badge
- FAB appears when dishes exist
- Dish count updates correctly
- Clicking dish navigates to edit page (placeholder)

### Test Count

| Layer            | Tests   |
| ---------------- | ------- |
| Storage Service  | 39      |
| useDishes Hook   | 15      |
| Button           | 26      |
| Input            | 22      |
| Card             | 18      |
| EmptyState       | 14      |
| DishTypeSelector | 18      |
| DishCard         | 26      |
| DishList         | 21      |
| DishForm         | 28      |
| AddDishPage      | 14      |
| HomePage         | 21      |
| App              | 2       |
| **Total**        | **264** |

### Recommended Next Steps

1. **Begin Phase 4 — Get Meal Suggestions**
   - 4.1 SuggestionService (random entree + sides pairing)
   - 4.2 useSuggestion hook
   - 4.3 SuggestionCard component
   - 4.4 SuggestionPage
2. Optional: Add dish type filtering (Task 3.4, deferred)

### Key Files

| Purpose             | Path                                                |
| ------------------- | --------------------------------------------------- |
| Constitution        | `.specify/memory/constitution.md`                   |
| **Ideas Backlog**   | `.specify/memory/ideas.md`                          |
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
