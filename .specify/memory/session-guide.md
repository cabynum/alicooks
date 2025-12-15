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
**Current Phase**: Tasks created, ready to build

### Completed This Session

- ✅ Created comprehensive task breakdown: `specs/001-meal-planner/tasks.md`
- ✅ 47 tasks organized across 8 phases (P0 Setup → P1-P4 Features → Polish)
- ✅ Tasks aligned with user story priorities and constitution principles

### Recommended Next Steps

When starting the next session, propose these options to the user:

1. **Start Phase 0: Project Setup** — Initialize the Vite project and tooling
   - Task 0.1: Create Vite + React + TypeScript project
   - Task 0.2: Add Tailwind CSS
   - Task 0.3: Create folder structure
   - Estimated time: ~30 minutes

2. **Complete Phase 0 + Phase 1** — Setup plus foundation layer
   - All of Phase 0 plus types, StorageService, UI primitives
   - Gets us ready to build the first feature (Add a Dish)
   - Estimated time: ~2-3 hours

3. **Jump to a specific task** — If resuming mid-phase
   - Review `tasks.md` and pick up where we left off

**Recommendation**: Option 1 for a shorter session, Option 2 for a full work session.

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

None at this time.

### Notes

- Use two trailing spaces for line breaks (not tables) unless truly tabular
- All markdown files must pass linting before merge
- **Update `blog/` when significant progress is made** — capture decisions in real-time
- Entity naming: **Dish** (individual item) → **Meal** (combination) → **MealPlan** (schedule)
