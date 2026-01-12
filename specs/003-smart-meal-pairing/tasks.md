# Smart Meal Pairing — Implementation Tasks

## Phase 1: Data Model

### Task 1.1: Database Migration

Add `pairs_well_with` column to dishes table.

**File**: `supabase/migrations/012_pairs_well_with.sql`

```sql
ALTER TABLE dishes 
ADD COLUMN pairs_well_with UUID[] DEFAULT '{}';
```

**Acceptance**: Column exists, defaults to empty array.

---

### Task 1.2: Update TypeScript Types

Add `pairsWellWith` to Dish type.

**File**: `src/types/dish.ts`

**Acceptance**: Type includes optional `pairsWellWith: string[]`

---

### Task 1.3: Update Local DB Schema

Add field to Dexie schema for offline support.

**File**: `src/lib/db.ts`

**Acceptance**: Local dishes table includes pairsWellWith field.

---

## Phase 2: UI Components

### Task 2.1: Create PairingSelector Component

Word bank component showing all household sides as selectable chips.

**File**: `src/components/meals/PairingSelector.tsx`

**Props**:
- `selectedIds: string[]`
- `onChange: (ids: string[]) => void`  
- `sides: Dish[]` (filtered list of sides)
- `onAddNewSide?: () => void`

**Behavior**:
- Display sides as tappable chips
- Selected chips are highlighted
- Multi-select supported
- "Add New Side" button at end

**Acceptance**: Component renders, selection works, visually clear.

---

### Task 2.2: Integrate into DishForm

Show PairingSelector when dish type is "entree".

**File**: `src/components/meals/DishForm.tsx`

**Changes**:
- Add state for `pairsWellWith`
- Conditionally render PairingSelector
- Pass value to save handler

**Acceptance**: PairingSelector appears for entrees, hidden for sides/other.

---

### Task 2.3: Quick-Add Side Flow

"Add New Side" creates a side dish inline without leaving the form.

**Options**:
- Modal with minimal side form
- Inline expansion
- Navigate away and return (less ideal)

**Acceptance**: User can add a new side without losing entree form progress.

---

## Phase 3: Data Layer

### Task 3.1: Update Dish Service

Handle `pairsWellWith` in create/update operations.

**File**: `src/services/storage.ts` (or relevant service)

**Changes**:
- Include pairsWellWith in dish save
- Include in dish fetch
- Handle sync for this field

**Acceptance**: Pairings persist and sync across household.

---

### Task 3.2: Update useDishes Hook

Expose pairings data.

**File**: `src/hooks/useDishes.ts`

**Acceptance**: Hook returns pairsWellWith with dish data.

---

## Phase 4: Suggestion Algorithm

### Task 4.1: Update Suggestion Logic

Prefer paired sides when generating suggestions.

**File**: `src/services/suggestion.ts`

**Changes**:
- When picking sides, check entree's pairsWellWith
- 80% chance to pick from pairs if available
- 20% random for variety
- Avoid duplicate sides in same meal

**Acceptance**: Suggestions prefer paired sides, still have variety.

---

### Task 4.2: Update useSuggestion Hook

Ensure suggestion hook passes entree pairings to suggestion service.

**File**: `src/hooks/useSuggestion.ts`

**Acceptance**: Weighted suggestions work end-to-end.

---

## Phase 5: Testing

### Task 5.1: Unit Tests for PairingSelector

**File**: `tests/components/meals/PairingSelector.test.tsx`

- Renders all sides as chips
- Selection toggles work
- onChange called with correct IDs
- Add New Side button works

---

### Task 5.2: Unit Tests for Suggestion Weighting

**File**: `tests/services/suggestion.test.ts`

- Prefers paired sides when available
- Falls back to random when no pairs
- Maintains variety (doesn't always pick same pair)
- Handles empty pairsWellWith

---

### Task 5.3: Integration Test

- Add entree with pairings
- Get suggestion
- Verify paired side is selected (statistically)

---

## Task Summary

| Phase | Task | Effort |
|-------|------|--------|
| 1 | Database migration | Small |
| 1 | TypeScript types | Small |
| 1 | Local DB schema | Small |
| 2 | PairingSelector component | Medium |
| 2 | DishForm integration | Medium |
| 2 | Quick-add side flow | Medium |
| 3 | Dish service update | Small |
| 3 | useDishes hook update | Small |
| 4 | Suggestion logic update | Medium |
| 4 | useSuggestion hook update | Small |
| 5 | Unit tests | Medium |

**Estimated total**: 2-3 focused sessions
