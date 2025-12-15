# Component Contracts: Meal Planner

**Branch**: `001-meal-planner` | **Date**: 2024-12-15

This document defines the React component interfaces and their responsibilities.

## Page Components

These are top-level components that represent screens in the app.

### HomePage

The main landing page showing dish collection and quick actions.

```typescript
interface HomePageProps {
  // No props - uses hooks for data
}

// Responsibilities:
// - Display list of dishes (or empty state)
// - Provide "Add Dish" action
// - Provide "Suggest Meal" action
// - Provide "Plan Menu" action
// - Navigate to other pages
```

**User Story Coverage**: P2 (View My Dishes)

---

### AddDishPage

Form for adding a new dish to the collection.

```typescript
interface AddDishPageProps {
  // No props - uses hooks for data
}

// Responsibilities:
// - Render dish form (name, type)
// - Validate input (name required)
// - Save dish to storage
// - Navigate back on success
// - Show friendly error on validation failure
```

**User Story Coverage**: P1 (Add a Dish)

---

### EditDishPage

Form for editing an existing dish.

```typescript
interface EditDishPageProps {
  dishId: string;  // From route params
}

// Responsibilities:
// - Load existing dish data
// - Render dish form with current values
// - Validate input
// - Update dish in storage
// - Provide delete action
// - Navigate back on success
```

**User Story Coverage**: FR-003 (Edit or delete dishes)

---

### SuggestionPage

Display a suggested meal combination (entree + sides).

```typescript
interface SuggestionPageProps {
  // No props - uses hooks for data
}

// Responsibilities:
// - Generate random dish combination to form a meal
// - Display entree + side(s)
// - Provide "Try Another" action
// - Handle edge case: not enough dishes
// - Provide "Add to Plan" action (future)
```

**User Story Coverage**: P3 (Get Meal Suggestions)

---

### PlanPage

Create and view a meal plan.

```typescript
interface PlanPageProps {
  planId?: string;  // From route params (undefined for new plan)
}

// Responsibilities:
// - Create new plan or load existing
// - Display day slots
// - Allow day count selection
// - Navigate to day assignment
// - Persist plan changes
```

**User Story Coverage**: P4 (Plan a Menu)

---

### DayAssignmentPage

Assign dishes to a specific day in a plan.

```typescript
interface DayAssignmentPageProps {
  planId: string;   // From route params
  date: string;     // From route params (YYYY-MM-DD)
}

// Responsibilities:
// - Show current assignments for day
// - List available dishes to choose from
// - Allow adding/removing dishes
// - Provide suggestion option
// - Save changes to plan
```

**User Story Coverage**: P4 (Plan a Menu)

---

## Shared Components

Reusable components used across pages.

### DishCard

Displays a single dish in a list or grid.

```typescript
interface DishCardProps {
  dish: Dish;
  onClick?: () => void;
  showType?: boolean;      // Show type badge (default: true)
  selected?: boolean;      // Highlight as selected
  compact?: boolean;       // Smaller version for lists
}

// Visual requirements:
// - Touch target minimum 44px height
// - Truncate long names with ellipsis
// - Type indicated by color/icon badge
// - Clear tap feedback
```

---

### DishForm

Form fields for creating/editing a dish.

```typescript
interface DishFormProps {
  initialValues?: Partial<Dish>;
  onSubmit: (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitLabel?: string;    // Default: "Save"
}

// Fields:
// - name: text input (required)
// - type: segmented control or select (entree/side/other)

// Validation:
// - Name cannot be empty
// - Show inline error message
```

---

### DishTypeSelector

Segmented control or pill selector for dish type.

```typescript
interface DishTypeSelectorProps {
  value: DishType;
  onChange: (type: DishType) => void;
  disabled?: boolean;
}

// Visual requirements:
// - Three options: Entree, Side Dish, Other
// - Clear selected state
// - Touch-friendly (44px targets)
```

---

### EmptyState

Friendly message when no content exists.

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage examples:
// - No dishes yet: "Add your first dish to get started"
// - No plans yet: "Create a meal plan for the week"
```

---

### DaySlot

Single day in a meal plan view.

```typescript
interface DaySlotProps {
  date: string;            // YYYY-MM-DD
  dishes: Dish[];          // Assigned dishes for this day's meal
  onClick: () => void;
  isToday?: boolean;       // Highlight current day
}

// Visual requirements:
// - Show day name (Mon, Tue, etc.)
// - Show date
// - Show assigned dish names or empty state
// - Clear tap target
```

---

### SuggestionCard

Displays a suggested meal combination.

```typescript
interface SuggestionCardProps {
  entree: Dish;
  sides: Dish[];
  onAccept?: () => void;
  onReject?: () => void;   // "Try Another"
}

// Visual requirements:
// - Prominent entree display
// - Side dishes listed below
// - Clear action buttons
// - Delightful presentation (this is the "magic" moment)
```

---

## UI Primitives

Low-level components from design system.

### Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}
```

---

### Input

```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
}
```

---

### Card

```typescript
interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}
```

---

## Service Interfaces

Non-visual modules that handle data and logic.

### StorageService

```typescript
interface StorageService {
  // Dishes
  getDishes(): Dish[];
  getDish(id: string): Dish | undefined;
  saveDish(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Dish;
  updateDish(id: string, updates: Partial<Dish>): Dish;
  deleteDish(id: string): void;

  // Plans
  getPlans(): MealPlan[];
  getPlan(id: string): MealPlan | undefined;
  savePlan(plan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>): MealPlan;
  updatePlan(id: string, updates: Partial<MealPlan>): MealPlan;
  deletePlan(id: string): void;

  // Export
  exportData(): string;  // JSON string
  importData(json: string): void;
}
```

---

### SuggestionService

```typescript
interface SuggestionService {
  // Generate a random meal combination from available dishes
  suggest(dishes: Dish[]): MealSuggestion | null;

  // Generate multiple suggestions (for variety)
  suggestMany(dishes: Dish[], count: number): MealSuggestion[];
}

interface MealSuggestion {
  entree: Dish;
  sides: Dish[];
}
```

---

## Custom Hooks

React hooks that connect components to services.

### useDishes

```typescript
function useDishes(): {
  dishes: Dish[];
  isLoading: boolean;
  addDish: (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => Dish;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  getDishesByType: (type: DishType) => Dish[];
}
```

### usePlans

```typescript
function usePlans(): {
  plans: MealPlan[];
  isLoading: boolean;
  createPlan: (days: number, startDate?: Date) => MealPlan;
  updatePlan: (id: string, updates: Partial<MealPlan>) => void;
  deletePlan: (id: string) => void;
  assignDishToDay: (planId: string, date: string, dishId: string) => void;
  removeDishFromDay: (planId: string, date: string, dishId: string) => void;
}
```

### useSuggestion

```typescript
function useSuggestion(): {
  suggestion: MealSuggestion | null;
  generate: () => void;
  isAvailable: boolean;  // false if not enough dishes
  message: string;       // "Add more dishes for better suggestions"
}
```

### useExport

```typescript
function useExport(): {
  exportToFile: () => void;      // Triggers download
  importFromFile: (file: File) => Promise<void>;
}
```

---

## Route Structure

```typescript
const routes = [
  { path: '/', component: HomePage },
  { path: '/add', component: AddDishPage },
  { path: '/edit/:dishId', component: EditDishPage },
  { path: '/suggest', component: SuggestionPage },
  { path: '/plan', component: PlanPage },           // New plan
  { path: '/plan/:planId', component: PlanPage },   // View/edit plan
  { path: '/plan/:planId/:date', component: DayAssignmentPage },
];
```
