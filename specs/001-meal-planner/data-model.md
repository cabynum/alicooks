# Data Model: Meal Planner

**Branch**: `001-meal-planner` | **Date**: 2024-12-15

This document defines the data entities, their relationships, and storage format.

## Entities

### Dish

An individual food item in the user's personal collection. Dishes combine to form meals.

```typescript
interface Dish {
  id: string;          // UUID, generated on creation
  name: string;        // Required, user-provided (e.g., "Grilled Chicken")
  type: DishType;      // Category of dish
  createdAt: string;   // ISO 8601 timestamp
  updatedAt: string;   // ISO 8601 timestamp
}

type DishType = 'entree' | 'side' | 'other';
```

**Validation Rules**:

- `name` is required, must be 1-100 characters
- `name` should be trimmed of leading/trailing whitespace
- `type` defaults to `'entree'` if not specified
- `id` is auto-generated, never user-provided

**Display Rules**:

- Long names (>30 chars) truncate with ellipsis in lists
- Full name shown on detail/edit views

---

### MealPlan

A collection of day assignments for meal planning. Each day's assigned dishes form a complete meal.

```typescript
interface MealPlan {
  id: string;              // UUID, generated on creation
  name: string;            // Optional, user-provided (e.g., "This Week")
  startDate: string;       // ISO 8601 date (YYYY-MM-DD)
  days: DayAssignment[];   // Array of day assignments, length = number of days
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

**Validation Rules**:

- `name` is optional, defaults to "Meal Plan" if empty
- `startDate` must be a valid date
- `days` array length determines the plan duration (1+ days)
- Plans can overlap in dates (no uniqueness constraint)

---

### DayAssignment

Links a specific day in a plan to dishes that form that day's meal.

```typescript
interface DayAssignment {
  date: string;        // ISO 8601 date (YYYY-MM-DD)
  dishIds: string[];   // Array of Dish IDs assigned to this day
}
```

**Validation Rules**:

- `date` must be a valid date within the plan's range
- `dishIds` can be empty (unplanned day)
- `dishIds` can contain duplicates (same dish twice in a day)
- If a dish is deleted, its ID is removed from all assignments

---

## Storage Schema

All data is stored in localStorage as JSON under these keys:

```typescript
// localStorage keys
const STORAGE_KEYS = {
  dishes: 'dishcourse_dishes',       // Dish[]
  plans: 'dishcourse_plans',         // MealPlan[]
  version: 'dishcourse_version',     // number (for migrations)
} as const;

// Current schema version
const SCHEMA_VERSION = 1;
```

**Example stored data**:

```json
{
  "dishcourse_dishes": [
    {
      "id": "a1b2c3d4",
      "name": "Grilled Chicken",
      "type": "entree",
      "createdAt": "2024-12-15T10:30:00Z",
      "updatedAt": "2024-12-15T10:30:00Z"
    },
    {
      "id": "e5f6g7h8",
      "name": "Roasted Vegetables",
      "type": "side",
      "createdAt": "2024-12-15T10:31:00Z",
      "updatedAt": "2024-12-15T10:31:00Z"
    }
  ],
  "dishcourse_plans": [
    {
      "id": "p1q2r3s4",
      "name": "This Week",
      "startDate": "2024-12-16",
      "days": [
        { "date": "2024-12-16", "dishIds": ["a1b2c3d4", "e5f6g7h8"] },
        { "date": "2024-12-17", "dishIds": [] }
      ],
      "createdAt": "2024-12-15T11:00:00Z",
      "updatedAt": "2024-12-15T11:00:00Z"
    }
  ],
  "dishcourse_version": 1
}
```

---

## Entity Relationships

```text
┌─────────────┐
│    Dish     │
├─────────────┤
│ id (PK)     │◄─────────────────┐
│ name        │                  │
│ type        │                  │ references
│ createdAt   │                  │
│ updatedAt   │                  │
└─────────────┘                  │
                                 │
┌─────────────┐    contains     ┌┴────────────┐
│  MealPlan   │────────────────►│DayAssignment│
├─────────────┤                 ├─────────────┤
│ id (PK)     │                 │ date        │
│ name        │                 │ dishIds[]   │──┘
│ startDate   │                 └─────────────┘
│ days[]      │
│ createdAt   │
│ updatedAt   │
└─────────────┘
```

**Relationship Notes**:

- Dishes exist independently of plans
- A dish can be used in zero, one, or many plans
- A dish can appear multiple times within the same plan (different days or same day)
- Deleting a dish removes its references from all plans (cascading cleanup)
- Deleting a plan does not affect dishes

---

## Export Format

For data portability (Constitution principle IV), the export format is:

```json
{
  "exportedAt": "2024-12-15T12:00:00Z",
  "version": 1,
  "dishes": [...],
  "plans": [...]
}
```

This is a single JSON file that can be downloaded and re-imported.

---

## State Transitions

### Dish Lifecycle

```text
[Created] ──► [Active] ──► [Deleted]
                 │
                 ▼
            [Edited]
                 │
                 ▼
            [Active]
```

### MealPlan Lifecycle

```text
[Created] ──► [Active/Editable] ──► [Deleted]
                    │
                    ▼
              [Days Modified]
                    │
                    ▼
              [Active/Editable]
```

No "completed" state for plans — past dates are simply in the past, plans remain editable.
