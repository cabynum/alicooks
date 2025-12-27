# DishCourse Session Guide

Quick reference for starting and ending AI pair programming sessions.

## Slash Commands

| Command | Purpose |
| ----------------- | ---------------------------------------------- |
| `/dishcourse.start` | Start a new session (loads context) |
| `/dishcourse.idea` | Capture a feature idea to the backlog |
| `/dishcourse.lint` | Check all markdown files for linting errors |
| `/dishcourse.save` | End a session (saves context, suggests commit) |

## Starting a New Session

Type `/dishcourse.start` in Cursor, or paste this prompt:

```text
Let's continue working on DishCourse.

Please read these files to get up to speed:
- `.specify/memory/constitution.md` (project principles)
- `.specify/memory/session-guide.md` (this file - for current status)

Current status: [see below]
```

## Ending a Session

Type `/dishcourse.save` in Cursor, or ask:

```text
Before we end, please:
1. Check for uncommitted changes (git status) and commit if needed
2. Update the "Current Status" section in `.specify/memory/session-guide.md`
3. Update the blog post(s) in `blog/` if significant progress was made
```

## Current Status

**Last Updated**: 2024-12-27  
**Current Branch**: `002-family-collaboration`  
**Repository**: <https://github.com/cabynum/dishcourse>  
**Live URL**: <https://havedishcourse.vercel.app>  
**Current Phase**: Specifying Family Collaboration Feature

### Completed This Session

- ✅ **Ideas backlog updated**: Added onboarding flow and micro-interactions to ideas.md
- ✅ **Family Collaboration spec created** using spec-kit workflow:
  - Created branch `002-family-collaboration`
  - Wrote full specification with 7 user stories (P1-P3)
  - Defined 31 functional requirements
  - Created quality checklist (all items passing)
- ✅ **Key design decisions made**:
  - Multiple households allowed (users can belong to more than one)
  - Conflict prevention via edit locking (auto-release after inactivity)
  - Magic link authentication (passwordless, email-based)
- ✅ **SMS/iMessage invites specified**:
  - Support for phone numbers AND iMessage email addresses (e.g., iCloud)
  - Invites arrive in Messages app, not email inbox

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

1. **Run `/speckit.plan`** — Create technical implementation plan for family collaboration
2. **Create onboarding flow** — Use mascots for welcoming first-run experience (in ideas backlog)
3. **Add micro-interactions** — Polish touch feedback and transitions (in ideas backlog)

### Key Files

| Purpose | Path |
| ------------------- | --------------------------------------------------- |
| Constitution | `.specify/memory/constitution.md` |
| **Ideas Backlog** | `.specify/memory/ideas.md` |
| **Collab Spec** | `specs/002-family-collaboration/spec.md` |
| Collab Checklist | `specs/002-family-collaboration/checklists/requirements.md` |
| Meal Planner Spec | `specs/001-meal-planner/spec.md` |
| Meal Planner Plan | `specs/001-meal-planner/plan.md` |
| Meal Planner Tasks | `specs/001-meal-planner/tasks.md` |
| Data Model | `specs/001-meal-planner/data-model.md` |
| Components | `specs/001-meal-planner/contracts/components.md` |
| Quality Checklist | `specs/001-meal-planner/checklists/requirements.md` |
| Blog Posts | `blog/` (Part 1–8) |
| **App Icon SVG** | `public/icons/icon-512.svg` |
| Icon Generation | `scripts/generate-icons.mjs` |
| **Design Mockup** | `design-mockup.html` |
| **Mascot Mockup** | `mascot-mockup.html` |
| **Logo Exploration** | `logo-exploration.html` |
| **Mascot (Single)** | `public/mascot.png` |
| **Mascot (Duo)** | `public/mascot-duo.png` |
| Markdown Rules | `.cursor/rules/markdown-linting.mdc` |
| This Guide | `.specify/memory/session-guide.md` |

### Open Decisions

- **Collaboration feature**: Specification complete, ready for technical planning
  - See `specs/002-family-collaboration/spec.md` for full details
  - Next: Run `/speckit.plan` to create implementation plan

### Branding Assets (Finalized)

- **Mascots**: Friendly anthropomorphic plate characters
  - Single (`public/mascot.png`) — for small contexts (avatar, app icon)
  - Duo (`public/mascot-duo.png`) — for large contexts (splash, empty states, marketing)
- **Palette**: Black (#1A1A1A), Charcoal (#2C2C2C), White, Sunflower Yellow (#FFB800)
- **Typography**: "DishCourse" with yellow "Dish" + white "Course" (Outfit font)

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
- **Shut down dev servers** when ending sessions (`pkill -f vite`, etc.)
