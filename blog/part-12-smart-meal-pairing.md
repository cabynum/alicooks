# Part 12: Smart Meal Pairing — From Random to Relevant

**Date**: 2026-01-12  
**Branch**: `master`  
**Spec**: `specs/003-smart-meal-pairing/spec.md`

## The Problem

DishCourse has a "Suggest a Meal" feature that picks an entree and random sides.
It works, but the randomness creates odd combinations. Tacos with mashed potatoes.
Stir-fry with mac and cheese. Technically possible dinners, but not what you'd
actually serve together.

The feature was always a placeholder for something smarter. Today we're designing
that "something smarter."

## The Options We Considered

When thinking about intelligent meal pairing, we explored several approaches:

### Option A: User-Defined Pairings

Let users explicitly connect sides to entrees. "Grilled Chicken pairs well with
Rice Pilaf, Caesar Salad, and Roasted Veggies."

**Pros**: No AI, works offline, reflects actual family preferences  
**Cons**: Requires user effort, empty until defined

### Option B: AI-Inferred Pairings

Use an LLM to analyze the dish list and infer what goes together based on cuisine
and flavor profiles.

**Pros**: Works immediately, zero user effort  
**Cons**: API costs, network dependency, might not match preferences

### Option C: Cuisine Matching

Tag dishes with cuisine type (Mexican, Italian, etc.) and prefer sides from
matching cuisines.

**Pros**: Simple, no AI  
**Cons**: Another field to fill out, less precise than true pairing

### Option D: Hybrid

Start with AI suggestions, let users override. Best of both worlds, but most
complex to build.

## The Decision: User-Defined, With a Word Bank

We chose **Option A with great UX**. The insight: if selecting pairings is
*delightful*, users will actually do it. The friction isn't the concept — it's
the implementation.

Our approach: when adding or editing an entree, show a "Pairs well with" section
displaying all existing sides as tappable chips. Users simply tap the sides that
go well with this dish. No typing, no searching, just recognition and selection.

```text
┌─────────────────────────────────────────────┐
│ Pairs well with:                            │
│ ┌─────────────────────────────────────────┐ │
│ │ [Rice Pilaf ✓] [Roasted Veggies]        │ │
│ │ [Caesar Salad ✓] [Mashed Potatoes]      │ │
│ │ [Green Beans] [Corn on the Cob]         │ │
│ │                        [+ Add New Side] │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

This design:

- **Surfaces existing data** — No need to remember what sides you have
- **Low friction** — Tap to select, no typing
- **Builds over time** — Each entree you edit adds knowledge
- **Household benefit** — One person's pairings help everyone

## The Algorithm: Weighted Random

When generating a meal suggestion, we don't want to *only* use defined pairings.
That would feel repetitive. Instead, we weight the randomness:

```text
Pick an entree (random)
│
├── Does entree have defined pairings?
│   │
│   ├── YES: 80% chance to pick from paired sides
│   │        20% chance to pick randomly (variety)
│   │
│   └── NO: Pick randomly (current behavior)
│
└── Avoid duplicates in same meal
```

The 80/20 split gives suggestions coherence while maintaining variety. You'll
usually get sensible pairings, occasionally something unexpected that might
surprise you.

## The Data Model

Simple addition to the `dishes` table:

```sql
ALTER TABLE dishes 
ADD COLUMN pairs_well_with UUID[] DEFAULT '{}';
```

A PostgreSQL UUID array. Each entree stores the IDs of sides that pair well
with it. Empty by default — the feature degrades gracefully to random selection
until users define pairings.

In TypeScript:

```typescript
interface Dish {
  id: string;
  name: string;
  type: 'entree' | 'side' | 'other';
  // ... existing fields ...
  pairsWellWith: string[];  // Array of side dish IDs
}
```

## Why Not Bi-Directional?

One design question: if Grilled Chicken pairs with Rice Pilaf, should Rice Pilaf
automatically pair with Grilled Chicken?

We chose **no**. The relationship is one-way: entrees define which sides go with
them. Reasons:

1. **Simpler mental model** — "When I add an entree, I pick its sides"
2. **Sides don't suggest meals** — The flow starts with an entree
3. **Avoids weird edge cases** — What if Rice Pilaf "pairs well with" 50 entrees?

The UI only shows "Pairs well with" for entrees, not sides or other dishes.

## The Quick-Add Flow

What if you're adding an entree and realize you forgot to add a side first?
We don't want users to abandon their entree form, add the side, then come back.

Solution: "Add New Side" button inline in the pairing selector. Opens a minimal
form to quickly create a side dish, which immediately appears in the word bank
ready to select.

This keeps users in flow while letting them expand their dish library on the fly.

## Future: AI Enhancement (Stashed)

We deliberately designed the UI to accommodate a future enhancement: an AI-powered
"Suggest Pairings" button. The idea:

- User adds "Grilled Salmon" as a new entree
- User clicks "Suggest Pairings"
- AI analyzes their existing sides and recommends: "Lemon Rice, Asparagus, Caesar Salad"
- User reviews and confirms

This isn't in v1, but the architecture supports it. The AI would just pre-populate
the selection; users retain full control.

## Implementation Plan

The work breaks into five phases:

| Phase | What | Effort |
| ----- | ---- | ------ |
| 1 | Data model (migration, types) | Small |
| 2 | PairingSelector component + DishForm integration | Medium |
| 3 | Data layer (save/sync pairings) | Small |
| 4 | Suggestion algorithm update | Medium |
| 5 | Testing | Medium |

Estimated: 2-3 focused sessions.

## Design Principles in Action

This feature embodies several Constitution principles:

**I. User-First Simplicity** — Tapping chips is intuitive. No complex pairing
rules to learn or configure.

**II. Delight Over Features** — We're enhancing an existing feature rather than
adding a new half-baked one. Suggestions will feel smarter without new UI to
learn.

**III. Smart Defaults** — Empty pairings = random (still works). Defined pairings
= smarter. The feature is invisible until you use it.

**V. Mobile-Ready** — Tappable chips are perfect for touch. The word bank layout
works on narrow screens.

## What's Next

After Smart Meal Pairing, the roadmap continues to **Meal Proposals & Voting** —
the feature that turns DishCourse from a meal database into a family decision
tool. Propose a meal, notify the household, vote on it together.

Combined, these features complete the core vision: smart suggestions that the
whole family can agree on.

---

*Making random less random, one pairing at a time.*

January 2026
