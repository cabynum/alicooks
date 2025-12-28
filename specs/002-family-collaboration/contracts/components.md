# Component Contracts: Family Collaboration

**Branch**: `002-family-collaboration` | **Date**: 2024-12-28

This document defines new React component interfaces and modifications to existing components
for the family collaboration feature.

## New Page Components

### AuthPage

Magic link authentication flow — sign up, sign in, or verification.

```typescript
interface AuthPageProps {
  mode?: 'signin' | 'signup' | 'verify';  // From route or state
  redirectTo?: string;                     // Where to go after auth
}

// Responsibilities:
// - Display magic link form (email input)
// - Send magic link via Supabase Auth
// - Show "check your email" state after sending
// - Handle verification callback from email link
// - Set display name on first signup
// - Redirect to intended page after success
```

**User Story Coverage**: FR-013, FR-014

---

### HouseholdPage

Manage household settings, members, and invites.

```typescript
interface HouseholdPageProps {
  householdId: string;  // From route params
}

// Responsibilities:
// - Display household name (editable by creator)
// - List current members with roles
// - Generate and display invite link/code
// - Send SMS/iMessage invites
// - Allow creator to remove members
// - Allow any member to leave
```

**User Story Coverage**: US-1, US-2, US-7

---

### JoinPage

Accept an invite and join a household.

```typescript
interface JoinPageProps {
  code: string;  // From route params (/join/:code)
}

// Responsibilities:
// - Validate invite code (check expiry, already used)
// - Show household name being joined
// - If not authenticated, redirect to AuthPage first
// - Prompt to merge local dishes (if any)
// - Add user to household
// - Navigate to HomePage after success
```

**User Story Coverage**: US-2

---

### HouseholdCreatePage

Create a new household.

```typescript
interface HouseholdCreatePageProps {
  // No props
}

// Responsibilities:
// - Collect household name
// - Create household with user as creator
// - Offer to migrate local dishes
// - Navigate to HouseholdPage to invite members
```

**User Story Coverage**: US-1

---

## New Shared Components

### Auth Components

#### MagicLinkForm

Email input form for magic link authentication.

```typescript
interface MagicLinkFormProps {
  onSuccess: () => void;
  mode: 'signin' | 'signup';
  loading?: boolean;
}

// Visual requirements:
// - Clear email input with label
// - Submit button with loading state
// - Error display for invalid email or send failure
// - "Check your email" success state
```

---

#### AuthProvider

Context provider for authentication state.

```typescript
interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

// Responsibilities:
// - Initialize Supabase auth listener
// - Fetch and cache user profile
// - Handle auth state changes
// - Provide auth methods to children
```

---

#### ProtectedRoute

Route wrapper that requires authentication.

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireHousehold?: boolean;  // Also require household membership
}

// Responsibilities:
// - Check authentication status
// - Redirect to AuthPage if not authenticated
// - Redirect to HouseholdCreatePage if requireHousehold and no household
// - Show loading state during check
```

---

### Household Components

#### HouseholdSwitcher

Dropdown/modal for switching between households (FR-021).

```typescript
interface HouseholdSwitcherProps {
  currentHouseholdId: string;
  households: Household[];
  onSwitch: (householdId: string) => void;
}

// Visual requirements:
// - Show current household name
// - Dropdown with other households
// - Clear indicator of active household (FR-023)
// - Option to create new household
// - Touch-friendly (44px targets)
```

---

#### MemberList

List of household members with roles.

```typescript
interface MemberListProps {
  members: (HouseholdMember & { profile: Profile })[];
  currentUserId: string;
  isCreator: boolean;
  onRemoveMember?: (memberId: string) => void;
}

// Visual requirements:
// - Member avatar (initials) and display name
// - Role badge for creator
// - Remove button for creator (not on self)
// - Touch-friendly rows
```

---

#### InviteModal

Modal for generating and sharing invites.

```typescript
interface InviteModalProps {
  householdId: string;
  householdName: string;
  isOpen: boolean;
  onClose: () => void;
}

// Responsibilities:
// - Generate or fetch existing invite code
// - Show invite link with copy button
// - Show invite code for manual entry
// - SMS/iMessage send form (phone/email input)
// - Share via native share sheet (Web Share API)
```

**User Story Coverage**: US-2, FR-028, FR-029, FR-030

---

#### JoinHousehold

Inline form for entering an invite code manually.

```typescript
interface JoinHouseholdProps {
  onSuccess: (household: Household) => void;
  onCancel: () => void;
}

// Responsibilities:
// - 6-character code input
// - Validate code format
// - Check code validity with server
// - Show error for invalid/expired codes
// - Join household on valid code
```

---

### Sync Components

#### SyncStatus

Indicator showing sync state.

```typescript
interface SyncStatusProps {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt?: string;
}

// Visual requirements:
// - Small icon (cloud, spinner, offline, error)
// - Tooltip/tap to show details
// - Non-intrusive placement (header or footer)
// - Color-coded: green=synced, gray=offline, red=error
```

---

#### ConflictResolver

Modal for resolving sync conflicts (rare).

```typescript
interface ConflictResolverProps {
  conflicts: SyncConflict[];
  onResolve: (resolutions: Resolution[]) => void;
}

interface SyncConflict {
  entity: 'dish' | 'mealPlan';
  localVersion: Dish | MealPlan;
  serverVersion: Dish | MealPlan;
}

type Resolution = 'keep-local' | 'keep-server' | 'merge';

// Responsibilities:
// - Show side-by-side comparison
// - Let user choose which version to keep
// - Option to merge (for dishes with different fields)
// - Clear, non-technical language
```

---

### Plan Locking Components

#### LockIndicator

Shows who is editing a meal plan (FR-025).

```typescript
interface LockIndicatorProps {
  lockedBy: Profile;
  lockedAt: string;
  onForceUnlock?: () => void;  // Only if lock is stale
}

// Visual requirements:
// - Profile avatar/name of editor
// - "Editing..." status text
// - Time since locked
// - Unlock button if stale (>5 min)
```

---

## Modified Existing Components

### HomePage (Modified)

```typescript
// New props/behavior:
// - Show household name in header (if in household)
// - Show HouseholdSwitcher if multiple households
// - Show "Set up household" prompt if none
// - Add SyncStatus indicator
// - Filter dishes by current household
```

---

### DishCard (Modified)

```typescript
interface DishCardProps {
  // ... existing props ...
  addedBy?: Profile;        // Show who added (FR-009)
  showAddedBy?: boolean;    // Default: false in lists, true in details
}

// New visual element:
// - Small "Added by [name]" text when showAddedBy=true
```

---

### DishForm (Modified)

```typescript
// No prop changes
// New behavior:
// - On save, include current user as addedBy
// - Works offline (queues for sync)
```

---

### PlanPage (Modified)

```typescript
// New behavior:
// - Check lock status before allowing edit
// - Acquire lock when entering edit mode
// - Show LockIndicator if locked by another user
// - Release lock when leaving or after inactivity
// - Add assignedBy to day assignments
```

---

### SettingsPage (Modified)

```typescript
// New sections:
// - Account (display name, sign out)
// - Household (link to HouseholdPage)
// - Sync status
// - Export now includes household data
```

---

## New Custom Hooks

### useAuth

```typescript
function useAuth(): {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};
```

---

### useHousehold

```typescript
function useHousehold(): {
  households: Household[];
  currentHousehold: Household | null;
  members: (HouseholdMember & { profile: Profile })[];
  isLoading: boolean;
  isCreator: boolean;
  switchHousehold: (householdId: string) => void;
  createHousehold: (name: string) => Promise<Household>;
  leaveHousehold: (householdId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
};
```

---

### useInvite

```typescript
function useInvite(householdId: string): {
  invite: Invite | null;
  inviteLink: string;
  isLoading: boolean;
  generateInvite: () => Promise<Invite>;
  sendSmsInvite: (phoneOrEmail: string) => Promise<void>;
  validateCode: (code: string) => Promise<{ valid: boolean; household?: Household }>;
  joinWithCode: (code: string) => Promise<Household>;
};
```

---

### useSync

```typescript
function useSync(): {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  pendingChanges: number;
  conflicts: SyncConflict[];
  syncNow: () => Promise<void>;
  resolveConflicts: (resolutions: Resolution[]) => Promise<void>;
};
```

---

### usePlanLock

```typescript
function usePlanLock(planId: string): {
  isLocked: boolean;
  lockedBy: Profile | null;
  lockedAt: Date | null;
  canEdit: boolean;
  acquireLock: () => Promise<boolean>;
  releaseLock: () => Promise<void>;
  forceUnlock: () => Promise<void>;  // Only if stale
};
```

---

## New Services

### AuthService

```typescript
interface AuthService {
  getCurrentUser(): Promise<User | null>;
  getProfile(userId: string): Promise<Profile | null>;
  signInWithMagicLink(email: string): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
```

---

### HouseholdService

```typescript
interface HouseholdService {
  getHouseholds(userId: string): Promise<Household[]>;
  getHousehold(householdId: string): Promise<Household>;
  getMembers(householdId: string): Promise<(HouseholdMember & { profile: Profile })[]>;
  createHousehold(name: string, creatorId: string): Promise<Household>;
  updateHousehold(householdId: string, updates: Partial<Household>): Promise<Household>;
  addMember(householdId: string, userId: string): Promise<HouseholdMember>;
  removeMember(memberId: string): Promise<void>;
  leaveHousehold(householdId: string, userId: string): Promise<void>;
}
```

---

### InviteService

```typescript
interface InviteService {
  generateInvite(householdId: string, createdBy: string): Promise<Invite>;
  getInvite(code: string): Promise<Invite | null>;
  validateInvite(code: string): Promise<{ valid: boolean; reason?: string; household?: Household }>;
  useInvite(code: string, userId: string): Promise<HouseholdMember>;
  sendSmsInvite(invite: Invite, phoneOrEmail: string): Promise<void>;
}
```

---

### SyncService

```typescript
interface SyncService {
  // Initial sync
  fullSync(householdId: string): Promise<void>;

  // Real-time subscriptions
  subscribeToChanges(householdId: string, callbacks: SyncCallbacks): () => void;

  // Upload local changes
  pushChanges(): Promise<void>;

  // Conflict resolution
  getConflicts(): SyncConflict[];
  resolveConflict(conflictId: string, resolution: Resolution): Promise<void>;

  // Status
  getStatus(): SyncStatus;
  getLastSyncedAt(): Date | null;
}

interface SyncCallbacks {
  onDishChange: (dish: Dish, change: 'insert' | 'update' | 'delete') => void;
  onPlanChange: (plan: MealPlan, change: 'insert' | 'update' | 'delete') => void;
  onMemberChange: (member: HouseholdMember, change: 'insert' | 'delete') => void;
}
```

---

## Route Structure (Extended)

```typescript
const routes = [
  // Existing routes
  { path: '/', component: HomePage },
  { path: '/add', component: AddDishPage },
  { path: '/edit/:dishId', component: EditDishPage },
  { path: '/suggest', component: SuggestionPage },
  { path: '/plan', component: PlanPage },
  { path: '/plan/:planId', component: PlanPage },
  { path: '/plan/:planId/:date', component: DayAssignmentPage },
  { path: '/settings', component: SettingsPage },

  // New auth routes
  { path: '/auth', component: AuthPage },
  { path: '/auth/verify', component: AuthPage },  // Magic link callback

  // New household routes
  { path: '/household', component: HouseholdPage },
  { path: '/household/create', component: HouseholdCreatePage },
  { path: '/household/:householdId', component: HouseholdPage },
  { path: '/join/:code', component: JoinPage },
];
```
