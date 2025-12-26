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

**Last Updated**: 2024-12-26  
**Current Branch**: `master`  
**Repository**: <https://github.com/cabynum/alicooks>  
**Live URL**: <https://alicooks.vercel.app>  
**Current Phase**: Logo Design Exploration

### Completed This Session

- ✅ **Logo exploration page created**: `logo-exploration.html` with 19 typographic logo concepts
- ✅ **Sans-serif options (A-I)**: Stacked contrast, dot separator, color pop, yellow bar, yellow i-dot, all caps, underline, badge combo, period mark
- ✅ **Script options (J-S)**: Pacifico, Lobster, Satisfy, Caveat, Dancing Script, Kalam, Comfortaa, Baloo, Script+Sans hybrid, Script+Swash
- ✅ **Dark mode and size tests**: Included in exploration page
- ✅ **Committed to master**: Logo exploration ready for review

### Phase Summary

| Phase | Tasks | Status |
| ---------------------------- | ------- | ----------- |
| Phase 1 (Foundation) | 1.1–1.9 | ✅ Complete |
| Phase 2 (Add a Dish) | 2.1–2.5 | ✅ Complete |
| Phase 3 (View My Dishes) | 3.1–3.5 | ✅ Complete |
| Phase 4 (Meal Suggestions) | 4.1–4.6 | ✅ Complete |
| Phase 5 (Plan a Menu) | 5.1–5.7 | ✅ Complete |
| Phase 6 (Edit & Delete) | 6.1–6.2 | ✅ Complete |
| Phase 7 (Data Export) | 7.1–7.2 | ✅ Complete |
| Phase 8 (Final Polish) | 8.1–8.5 | ✅ Complete |

**All phases complete!** The 001-meal-planner feature is ready for production.

Core features:

- Add, view, edit, delete dishes
- Meal suggestions with random pairing
- Meal planning with day assignments
- Data export/import (Constitution principle IV: Data Ownership)
- Error boundaries with friendly recovery
- WCAG AA accessible

### Test Count

| Layer | Tests |
| ------------------ | ------- |
| Storage Service | 50 |
| Suggestion Service | 20 |
| useDishes Hook | 15 |
| useSuggestion Hook | 17 |
| usePlans Hook | 25 |
| useExport Hook | 14 |
| Button | 26 |
| Input | 22 |
| Card | 18 |
| CookTimePicker | 17 |
| UrlInput | 31 |
| EmptyState | 14 |
| ErrorBoundary | 14 |
| DishTypeSelector | 18 |
| DishCard | 32 |
| DishList | 37 |
| SuggestionCard | 17 |
| DaySlot | 22 |
| DishForm | 44 |
| PlanCard | 25 |
| AddDishPage | 14 |
| EditDishPage | 26 |
| SettingsPage | 23 |
| SuggestionPage | 16 |
| PlanPage | 20 |
| DayAssignmentPage | 22 |
| HomePage | 26 |
| App | 2 |
| **Total** | **627** |

### Recommended Next Steps

1. **Select logo direction** — Review `logo-exploration.html` and choose a direction to refine
   - Top candidates: Q (Baloo), R (Script+Sans), S (Script+Swash), or A (Stacked Contrast)
   - Consider how it works in app header, favicon, and app icon contexts
2. **Refine chosen logo** — Polish typography, spacing, and create final SVG assets
3. **Share with Aliya** — Get feedback from the primary user on logo choice
4. **PWA polish** — Update app icon, splash screen with final logo

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
| Blog Posts | `blog/` (Part 1–8) |
| **App Icon SVG** | `public/icons/icon-512.svg` |
| Icon Generation | `scripts/generate-icons.mjs` |
| **Design Mockup** | `design-mockup.html` |
| **Logo Exploration** | `logo-exploration.html` |
| Markdown Rules | `.cursor/rules/markdown-linting.mdc` |
| This Guide | `.specify/memory/session-guide.md` |

### Open Decisions

- **Logo direction**: 19 typography-first options created in `logo-exploration.html`
  - Palette: Black, white, sunflower yellow (`#FFB800`)
  - Sans-serif vs script style to be decided
  - Top candidates: Baloo (Q), Script+Sans hybrid (R), Stacked Contrast (A)
  - Character-based logos (like Crumbl) require illustration tools — deferred

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
- **Shut down dev servers** when ending sessions (`pkill -f vite`, etc.)
