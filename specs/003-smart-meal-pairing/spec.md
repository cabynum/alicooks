# Smart Meal Pairing

## Overview

Make meal suggestions smarter by allowing users to define which sides pair well with each entree. When suggesting meals, the system prefers user-defined pairings over random selection.

## Problem

Currently, meal suggestions pair entrees with random sides. This can result in odd combinations (e.g., Tacos with Mashed Potatoes). Users have no way to influence which sides get suggested with which entrees.

## Solution

Add a "Pairs well with" section to the dish form when the dish type is **Entree**. Users see a word bank of all existing sides and can select which ones complement this entree. Suggestions then weight paired sides more heavily.

## User Stories

1. **As a user adding an entree**, I want to select which sides pair well with it, so suggestions make sense.

2. **As a user editing an entree**, I want to add or remove side pairings at any time.

3. **As a household member**, I want to see and contribute to pairings defined by others.

4. **As a user getting suggestions**, I want the suggested sides to actually go well with the entree.

## User Flow

### Adding/Editing an Entree

```text
┌─────────────────────────────────────────────┐
│ Add a Dish                                  │
├─────────────────────────────────────────────┤
│ Name: [Grilled Chicken          ]           │
│                                             │
│ Type: (•) Entree  ( ) Side  ( ) Other       │
│                                             │
│ Cook Time: [30 min]                         │
│                                             │
│ Pairs well with:                            │
│ ┌─────────────────────────────────────────┐ │
│ │ [Rice Pilaf✓] [Roasted Veggies]         │ │
│ │ [Caesar Salad✓] [Mashed Potatoes]       │ │
│ │ [Green Beans] [Corn on the Cob]         │ │
│ │                                         │ │
│ │                        [+ Add New Side] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Recipe URL: [                    ]          │
│                                             │
│           [ Save Dish ]                     │
└─────────────────────────────────────────────┘
```

### Behavior

- "Pairs well with" section **only appears when Type = Entree**
- Shows all existing sides from the household as tappable chips
- Selected sides are visually highlighted (filled, checkmark, etc.)
- "Add New Side" opens a quick-add flow to create a side dish inline
- Pairings are saved with the entree

### Suggestion Weighting

When generating a suggestion:

1. Pick a random entree (existing behavior)
2. For each side slot:
   - If entree has defined pairings: **80% chance** to pick from paired sides
   - Otherwise (or 20% of the time): pick randomly for variety
3. Avoid suggesting the same side twice in one meal

## Data Model

### Dish Table Change

Add column to `dishes` table:

```sql
pairs_well_with UUID[] DEFAULT '{}'
```

This stores an array of dish IDs (the sides that pair well with this entree).

### TypeScript Type

```typescript
interface Dish {
  id: string;
  householdId: string;
  name: string;
  type: 'entree' | 'side' | 'other';
  cookTimeMinutes?: number;
  recipeUrl?: string;
  addedBy: string;
  pairsWellWith: string[];  // Array of side dish IDs
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

## UI Components

### PairingSelector

New component for selecting side pairings:

```typescript
interface PairingSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  householdId: string;
}
```

- Fetches all sides for the household
- Displays as tappable chips/tags
- Supports multi-select
- Includes "Add New Side" action

### DishForm Updates

- Conditionally render PairingSelector when `type === 'entree'`
- Pass current pairings and update handler
- Handle the inline "Add New Side" flow

## Suggestion Algorithm Update

Update `src/services/suggestion.ts`:

```typescript
function pickSide(entree: Dish, allSides: Dish[]): Dish {
  const pairedSides = allSides.filter(s => 
    entree.pairsWellWith?.includes(s.id)
  );
  
  // 80% chance to use paired side if available
  if (pairedSides.length > 0 && Math.random() < 0.8) {
    return randomFrom(pairedSides);
  }
  
  // Otherwise random
  return randomFrom(allSides);
}
```

## Migration

```sql
-- Add pairs_well_with column to dishes
ALTER TABLE dishes 
ADD COLUMN pairs_well_with UUID[] DEFAULT '{}';
```

## Future Enhancement (Stashed)

- **AI Pairing Suggestions**: Button to ask AI "what sides go well with this?"
- Not in scope for v1, but UI should not preclude adding this later

## Success Criteria

1. Users can select side pairings when adding/editing entrees
2. Pairings sync across household members
3. Suggestions prefer paired sides when available
4. Users can still get variety (not locked into only paired sides)
5. Works offline (pairings stored locally, synced when online)

## Out of Scope

- AI-powered pairing suggestions (future)
- Pairing sides with other sides
- Pairing "other" type dishes
- Bi-directional pairings (if A pairs with B, B doesn't auto-pair with A)
