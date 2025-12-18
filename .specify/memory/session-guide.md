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
**Current Phase**: Phase 4 complete ✅ — Ready for Phase 5

### Completed This Session

- ✅ **Phase 4 complete**: Get Meal Suggestions feature working
  - `SuggestionService` with `suggest()` and `suggestMany()` functions
  - `useSuggestion` hook with availability checking and helpful messages
  - `SuggestionCard` component with warm amber gradient, plate icon, animations
  - `SuggestionPage` with back navigation and "Try Another" functionality
  - Enabled "Suggest" button on HomePage (only when entrees exist)
  - Polished animations: fade-in, slide-up, gentle pulse on plate icon
- ✅ 337 tests passing (73 new tests for Phase 4)

### Phase Summary

| Phase                        | Tasks   | Status      |
| ---------------------------- | ------- | ----------- |
| Phase 1 (Foundation)         | 1.1–1.9 | ✅ Complete |
| Phase 2 (Add a Dish)         | 2.1–2.5 | ✅ Complete |
| Phase 3 (View My Dishes)     | 3.1–3.5 | ✅ Complete |
| Phase 4 (Meal Suggestions)   | 4.1–4.6 | ✅ Complete |

Full suggestion flow verified in browser:

- "Suggest" button disabled when no entrees exist
- "Suggest" button enabled when at least one entree exists
- Suggestion page shows random entree + side(s) pairing
- "Try Another" generates new random suggestion
- Helpful message when not enough variety
- Back navigation returns to home page
- Beautiful animated card with warm color scheme

### Test Count

| Layer             | Tests   |
| ----------------- | ------- |
| Storage Service   | 39      |
| Suggestion Service| 20      |
| useDishes Hook    | 15      |
| useSuggestion Hook| 17      |
| Button            | 26      |
| Input             | 22      |
| Card              | 18      |
| EmptyState        | 14      |
| DishTypeSelector  | 18      |
| DishCard          | 26      |
| DishList          | 21      |
| SuggestionCard    | 17      |
| DishForm          | 28      |
| AddDishPage       | 14      |
| SuggestionPage    | 16      |
| HomePage          | 24      |
| App               | 2       |
| **Total**         | **337** |

### Recommended Next Steps

1. **Begin Phase 5 — Plan a Menu**
   - 5.1 usePlans hook for plan state management
   - 5.2 DaySlot component for day display
   - 5.3 PlanPage for week view
   - 5.4 DayAssignmentPage for assigning dishes
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
