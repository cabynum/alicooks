# Part 11: Sync Infrastructure — The Heart of Collaboration

**Date**: 2025-01-04  
**Branch**: `002-family-collaboration`  
**Phase**: Phase 3 — Data Synchronization

## The Challenge

DishCourse started as a single-user, local-only app. All your dishes and meal plans
lived in `localStorage` on your device. Simple, fast, offline-capable. But the moment
we added collaboration — sharing dishes with family members — we introduced a fundamental
architectural shift: **data now lives in two places**.

The question isn't just "how do we store data in the cloud?" It's "how do we keep two
sources of truth synchronized without sacrificing the instant-feel of local-first apps?"

## The Sync Strategy

Our approach follows a pattern called **Optimistic UI with Background Sync**:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           User Action                                │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    1. Write to Local Cache                           │
│                       (IndexedDB via Dexie)                          │
│                    ────────────────────────                          │
│                    UI updates IMMEDIATELY                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ (background)
┌─────────────────────────────────────────────────────────────────────┐
│                    2. Push to Remote                                 │
│                       (Supabase PostgreSQL)                          │
│                    ────────────────────────                          │
│                    Happens async, user doesn't wait                  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼ (on success)
┌─────────────────────────────────────────────────────────────────────┐
│                    3. Update Sync Status                             │
│                    ────────────────────────                          │
│                    "All changes synced" ✓                            │
└─────────────────────────────────────────────────────────────────────┘
```

The key insight: **the user never waits for the network**. Add a dish? It appears
instantly. The sync happens in the background, and we show a subtle indicator so
users know their data is safe.

## Dual Mode: Local vs. Synced

Not every user needs collaboration. Someone using DishCourse solo on their phone
should get the same instant experience without needing an account. This led to
a **dual-mode architecture**:

| Mode | When | Storage | Sync |
| ------- | -------------------------------- | ------------ | ----- |
| Local | Not logged in | localStorage | None |
| Synced | Logged in with household | IndexedDB | Yes |

The `useDishes` hook handles this transparently:

```typescript
export function useDishes() {
  const { user } = useAuthContext();
  const { household } = useHousehold();
  
  // Determine mode: synced if user has a household
  const isSyncedMode = user !== null && household !== null;
  
  if (isSyncedMode) {
    // Use IndexedDB + background sync to Supabase
    return useSyncedDishes(household.id, user.id);
  } else {
    // Use localStorage (original behavior)
    return useLocalDishes();
  }
}
```

This pattern means:

1. **Zero friction for new users** — Start adding dishes immediately, no signup
2. **Seamless upgrade path** — Create account later, data moves to synced mode
3. **Consistent API** — Components don't know or care which mode is active

## The Sync Service

The `SyncService` (`src/services/sync.ts`) encapsulates all synchronization logic:

```typescript
// Full sync: Pull all household data from Supabase → IndexedDB
export async function fullSync(householdId: string): Promise<SyncResult>

// Push changes: Send pending local changes → Supabase
export async function pushChanges(householdId: string): Promise<SyncResult>
```

**fullSync** runs when:

- User first logs in
- App regains network connectivity
- Pull-to-refresh (coming soon)

**pushChanges** runs when:

- User adds/edits/deletes a dish
- Periodic background sync
- App detects network restored

### Why IndexedDB?

We chose IndexedDB over localStorage for the synced mode:

| Feature | localStorage | IndexedDB |
| ----------------------- | ------------ | --------- |
| Storage limit | ~5MB | ~50MB+ |
| API | Synchronous | Async |
| Structure | Key-value only | Tables, indexes |
| Transactions | No | Yes |
| Query capability | None | Indexes, ranges |

For local-only mode, localStorage is fine — it's simpler and the data is small.
But synced mode with multiple households and potentially thousands of dishes
needs IndexedDB's capacity and query capabilities.

We use **Dexie.js** as a wrapper around IndexedDB. It provides a Promise-based
API that feels like working with a real database:

```typescript
// src/lib/db.ts
import Dexie from 'dexie';

export const db = new Dexie('dishcourse');

db.version(1).stores({
  dishes: 'id, householdId, name, type, deletedAt',
  mealPlans: 'id, householdId, startDate',
  syncMeta: 'key',
});
```

## The useSync Hook

Components need to know the sync status to show appropriate UI. The `useSync`
hook exposes this state:

```typescript
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ... sync logic
  
  return { status, lastSyncTime, error };
}
```

The status values:

| Status | Meaning | UI |
| -------- | ---------------------------------- | ----------------------- |
| synced | All changes pushed to server | ✓ "All changes synced" |
| syncing | Sync in progress | ⟳ "Syncing..." |
| offline | No network, changes queued locally | ☁ "Offline" |
| error | Sync failed, retry pending | ⚠ "Sync error" |

## The SyncStatus Component

A small but important piece of UI: the sync status indicator. It lives in the
app header, always visible but never intrusive:

```tsx
export function SyncStatus() {
  const { status, error } = useSync();
  
  const config = {
    synced: { icon: CheckCircle, text: 'All changes synced', color: 'green' },
    syncing: { icon: RefreshCw, text: 'Syncing...', color: 'amber' },
    offline: { icon: WifiOff, text: 'Offline', color: 'stone' },
    error: { icon: AlertCircle, text: 'Sync error', color: 'red' },
  };
  
  const { icon: Icon, text, color } = config[status];
  
  return (
    <button className={`text-${color}-600`} title={error || text}>
      <Icon size={16} />
    </button>
  );
}
```

Design decisions:

- **Icon-only by default** — Text appears on hover/tap (saves space on mobile)
- **Accessible** — Button element, title attribute for screen readers
- **Unobtrusive** — Small, positioned near other controls
- **Informative** — Error state shows the actual error message

## Updating the Dish Type

To support collaboration, the `Dish` interface needed three new fields:

```typescript
// src/types/dish.ts
export interface Dish {
  id: string;
  name: string;
  type: DishType;
  // ... existing fields ...
  
  // New collaboration fields
  householdId?: string;    // Which household owns this dish
  addedBy?: string;        // Who added it (user ID)
  deletedAt?: string;      // Soft delete timestamp
}
```

**householdId**: Links the dish to a household for RLS (Row-Level Security) in
Supabase. Dishes without a household ID are local-only.

**addedBy**: Attribution — shows "Added by Mom" in the UI. Helps family members
understand where dishes came from.

**deletedAt**: Soft deletion for sync. When you delete a dish, we set this
timestamp rather than actually removing the record. This lets us sync the
deletion to other devices. Old deleted records are cleaned up periodically.

## Test Updates

The sync infrastructure touched many parts of the codebase. Our test suite
(694 tests) needed updates to handle:

1. **Auth context** — `useDishes` now depends on `useAuthContext`
2. **Household context** — Need to know if user has a household
3. **Async operations** — CRUD operations are now async in synced mode

Before:

```typescript
it('adds a dish', () => {
  const { result } = renderHook(() => useDishes());
  act(() => result.current.addDish({ name: 'Tacos', type: 'entree' }));
  expect(result.current.dishes).toHaveLength(1);
});
```

After:

```typescript
it('adds a dish', async () => {
  const { result } = renderHook(() => useDishes(), { wrapper: TestProviders });
  await act(async () => {
    await result.current.addDish({ name: 'Tacos', type: 'entree' });
  });
  expect(result.current.dishes).toHaveLength(1);
});
```

The key changes:

- Wrap in `TestProviders` that include `AuthProvider` and `HouseholdProvider`
- Use `await act(async () => ...)` for async operations
- Mock `useAuth` and `useHousehold` to control the test environment

## What's Next: Real-Time Subscriptions

The sync infrastructure is in place. The next piece: **real-time updates**.
When Mom adds a dish on her phone, Dad's phone should show it within seconds —
without refreshing.

Supabase provides this through Postgres Realtime:

```typescript
// Coming next session
supabase
  .channel('household-dishes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'dishes', filter: `household_id=eq.${householdId}` },
    (payload) => {
      // Update local cache
      handleDishChange(payload);
    }
  )
  .subscribe();
```

This subscription listens for any INSERT, UPDATE, or DELETE on the dishes table
for the user's household. When a change comes in, we update the local IndexedDB
cache and React re-renders.

## Reflections

Building sync infrastructure is deceptively complex. The happy path — user online,
fast network, no conflicts — is straightforward. The edge cases are where the
work lives:

- What if the user is offline for a week?
- What if two users edit the same dish simultaneously?
- What if a sync fails partway through?
- What if the user logs out mid-sync?

Our approach: start simple, handle the common cases well, and add complexity only
when real usage reveals the need. Last-write-wins conflict resolution isn't
perfect, but it's understandable. Users can see who changed what and manually
fix rare conflicts.

The goal isn't a distributed database — it's a family meal planning app that
feels instant and keeps everyone's changes in sync. Simplicity wins.

---

*The infrastructure is laid. Next: watching dishes appear in real-time across devices.*

January 2025
