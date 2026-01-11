# Tasks: Family Collaboration

**Branch**: `002-family-collaboration` | **Created**: 2024-12-28  
**Source**: [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/components.md](./contracts/components.md)

This document breaks the implementation into small, testable tasks organized by phase.

---

## Phase 0: Backend Setup

Foundation infrastructure for Supabase integration.

### 0.1 Create Supabase Project

- [ ] Create new Supabase project (or use existing if available)
- [ ] Note down project URL and anon key
- [ ] Configure site URL and redirect URLs for auth
- [ ] Enable magic link authentication

**Verify**: Can access Supabase dashboard and see project credentials

---

### 0.2 Install Supabase Client

- [ ] Install `@supabase/supabase-js` package
- [ ] Create `src/lib/supabase.ts` with client initialization
- [ ] Add environment variables for Supabase URL and anon key
- [ ] Create `.env.example` with placeholder values
- [ ] Update `.gitignore` to exclude `.env.local`

**Verify**: Supabase client can be imported and initialized without errors

---

### 0.3 Create Database Schema

- [ ] Create `supabase/migrations/001_initial_schema.sql`
- [ ] Define `profiles` table with trigger for auto-creation
- [ ] Define `households` table
- [ ] Define `household_members` table with role enum
- [ ] Define `invites` table
- [ ] Define `dishes` table (extended version)
- [ ] Define `meal_plans` table (extended version)
- [ ] Run migration against Supabase

**Verify**: All tables visible in Supabase Table Editor

---

### 0.4 Configure Row-Level Security

- [ ] Enable RLS on all tables
- [ ] Add policies for `profiles` (read own, read household members)
- [ ] Add policies for `households` (read/create/update by members)
- [ ] Add policies for `household_members` (read by members, delete by creator)
- [ ] Add policies for `invites` (read/create by members)
- [ ] Add policies for `dishes` (full CRUD for household members)
- [ ] Add policies for `meal_plans` (CRUD with lock awareness)
- [ ] Test policies with Supabase SQL editor

**Verify**: RLS policies prevent unauthorized access in SQL editor tests

---

### 0.5 Setup Local Cache (IndexedDB)

- [ ] Install `dexie` package
- [ ] Create `src/lib/db.ts` with Dexie schema
- [ ] Define tables: dishes, mealPlans, profiles, households, members, syncMeta
- [ ] Add sync status fields to cached entities
- [ ] Write unit tests for cache operations

**Verify**: Can store and retrieve data from IndexedDB in browser

---

## Phase 1: Authentication

Magic link authentication flow.

### 1.1 Create AuthService

- [ ] Create `src/services/auth.ts`
- [ ] Implement `signInWithMagicLink(email)` — sends magic link
- [ ] Implement `signOut()` — clears session
- [ ] Implement `getCurrentUser()` — gets current session
- [ ] Implement `getProfile(userId)` — fetches profile from DB
- [ ] Implement `updateProfile(userId, updates)` — updates display name
- [ ] Implement `onAuthStateChange(callback)` — listens for auth changes
- [ ] Write unit tests with mocked Supabase client

**Verify**: All auth service tests pass

---

### 1.2 Create useAuth Hook

- [ ] Create `src/hooks/useAuth.ts`
- [ ] Manage user and profile state
- [ ] Initialize auth listener on mount
- [ ] Expose signIn, signOut, updateProfile methods
- [ ] Handle loading states
- [ ] Write hook tests

**Verify**: Hook provides auth state and methods

---

### 1.3 Create AuthProvider Component

- [ ] Create `src/components/auth/AuthProvider.tsx`
- [ ] Create AuthContext with user, profile, methods
- [ ] Wrap app in AuthProvider
- [ ] Handle initial loading state
- [ ] Write component tests

**Verify**: Auth context available throughout app

---

### 1.4 Build MagicLinkForm Component

- [ ] Create `src/components/auth/MagicLinkForm.tsx`
- [ ] Email input with validation
- [ ] Submit button with loading state
- [ ] Success state: "Check your email"
- [ ] Error display for failures
- [ ] Write component tests

**Verify**: Form sends magic link and shows success/error states

---

### 1.5 Build AuthPage

- [ ] Create `src/pages/AuthPage.tsx`
- [ ] Handle `signin` and `signup` modes
- [ ] Display name input for signup
- [ ] Handle verification callback from magic link
- [ ] Redirect to intended page after auth
- [ ] Write page tests

**Verify**: Full auth flow works end-to-end

---

### 1.6 Create ProtectedRoute Component

- [ ] Create `src/components/auth/ProtectedRoute.tsx`
- [ ] Check auth status
- [ ] Redirect to AuthPage if not authenticated
- [ ] Optional: check for household membership
- [ ] Show loading state during check
- [ ] Write component tests

**Verify**: Protected routes redirect unauthenticated users

---

### 1.7 Add Auth Routes

- [ ] Add `/auth` route
- [ ] Add `/auth/verify` route for magic link callback
- [ ] Configure Supabase redirect URL
- [ ] Test full magic link flow in browser

**Verify**: Can sign in via magic link and access protected routes

---

## Phase 2: Households

Household creation, invites, and joining.

### 2.1 Create HouseholdService

- [ ] Create `src/services/households.ts`
- [ ] Implement `getHouseholds(userId)` — fetch user's households
- [ ] Implement `getHousehold(householdId)` — fetch single household
- [ ] Implement `getMembers(householdId)` — fetch members with profiles
- [ ] Implement `createHousehold(name, creatorId)` — create and add creator as member
- [ ] Implement `addMember(householdId, userId)` — add new member
- [ ] Implement `removeMember(memberId)` — remove member (creator only)
- [ ] Implement `leaveHousehold(householdId, userId)` — leave voluntarily
- [ ] Write unit tests

**Verify**: All household service tests pass

---

### 2.2 Create InviteService

- [ ] Create `src/services/invites.ts`
- [ ] Implement `generateInvite(householdId, createdBy)` — create invite with code
- [ ] Implement `getInvite(code)` — fetch invite by code
- [ ] Implement `validateInvite(code)` — check expiry and usage
- [ ] Implement `useInvite(code, userId)` — mark used and add member
- [ ] Implement code generation (6 alphanumeric chars)
- [ ] Write unit tests

**Verify**: Can generate, validate, and use invite codes

---

### 2.3 Create useHousehold Hook

- [ ] Create `src/hooks/useHousehold.ts`
- [ ] Manage households and currentHousehold state
- [ ] Persist current household selection
- [ ] Implement switchHousehold, createHousehold, leaveHousehold
- [ ] Track isCreator for current household
- [ ] Write hook tests

**Verify**: Hook manages household state correctly

---

### 2.4 Create useInvite Hook

- [ ] Create `src/hooks/useInvite.ts`
- [ ] Manage invite state for a household
- [ ] Generate invite link from code
- [ ] Implement validateCode and joinWithCode
- [ ] Write hook tests

**Verify**: Hook provides invite functionality

---

### 2.5 Build HouseholdCreatePage

- [ ] Create `src/pages/HouseholdCreatePage.tsx`
- [ ] Household name input
- [ ] Create button
- [ ] Option to migrate local dishes
- [ ] Navigate to HouseholdPage after creation
- [ ] Write page tests

**Verify**: Can create a household with name

---

### 2.6 Build MemberList Component

- [ ] Create `src/components/households/MemberList.tsx`
- [ ] Display member avatar (initials) and name
- [ ] Show role badge for creator
- [ ] Remove button for creator (not on self)
- [ ] Confirmation before remove
- [ ] Write component tests

**Verify**: Member list displays correctly with actions

---

### 2.7 Build InviteModal Component

- [ ] Create `src/components/households/InviteModal.tsx`
- [ ] Display invite link with copy button
- [ ] Display invite code
- [ ] Copy to clipboard functionality
- [ ] Web Share API integration (where supported)
- [ ] Write component tests

**Verify**: Can copy invite link and share

---

### 2.8 Build HouseholdPage

- [ ] Create `src/pages/HouseholdPage.tsx`
- [ ] Display household name
- [ ] Render MemberList
- [ ] "Invite" button opens InviteModal
- [ ] "Leave" button with confirmation
- [ ] Write page tests

**Verify**: Full household management UI works

---

### 2.9 Build JoinPage

- [ ] Create `src/pages/JoinPage.tsx`
- [ ] Extract code from URL params
- [ ] Validate code on load
- [ ] Show household name and confirm join
- [ ] Handle invalid/expired codes
- [ ] Redirect to auth if not logged in
- [ ] Add user to household on confirm
- [ ] Write page tests

**Verify**: Can join household via invite link

---

### 2.10 Build JoinHousehold Component

- [ ] Create `src/components/households/JoinHousehold.tsx`
- [ ] 6-character code input
- [ ] Validate and join on submit
- [ ] Error display for invalid codes
- [ ] Write component tests

**Verify**: Can join via manual code entry

---

### 2.11 Build HouseholdSwitcher Component

- [ ] Create `src/components/households/HouseholdSwitcher.tsx`
- [ ] Show current household name
- [ ] Dropdown with other households
- [ ] "Create new" option
- [ ] Touch-friendly design
- [ ] Write component tests

**Verify**: Can switch between multiple households

---

### 2.12 Add Household Routes

- [ ] Add `/household` route
- [ ] Add `/household/create` route
- [ ] Add `/household/:householdId` route
- [ ] Add `/join/:code` route
- [ ] Update navigation to include household access

**Verify**: All household routes work correctly

---

## Phase 3: Data Sync

Synchronization between local cache and server.

### 3.1 Create SyncService

- [ ] Create `src/services/sync.ts`
- [ ] Implement `fullSync(householdId)` — download all household data
- [ ] Implement `pushChanges()` — upload pending local changes
- [ ] Implement change tracking with timestamps
- [ ] Handle offline detection
- [ ] Write unit tests

**Verify**: Can sync data between local cache and server

---

### 3.2 Implement Real-time Subscriptions

- [ ] Subscribe to dishes table changes
- [ ] Subscribe to meal_plans table changes
- [ ] Subscribe to household_members changes
- [ ] Update local cache on remote changes
- [ ] Handle subscription errors and reconnection

**Verify**: Remote changes appear locally within seconds

---

### 3.3 Implement Offline Queue

- [ ] Queue writes when offline
- [ ] Persist queue in IndexedDB
- [ ] Process queue when online
- [ ] Handle queue processing errors
- [ ] Write unit tests

**Verify**: Offline changes sync when connection restored

---

### 3.4 Create useSync Hook

- [ ] Create `src/hooks/useSync.ts`
- [ ] Track sync status (synced, syncing, offline, error)
- [ ] Track last synced timestamp
- [ ] Track pending changes count
- [ ] Expose syncNow method
- [ ] Write hook tests

**Verify**: Hook provides accurate sync status

---

### 3.5 Build SyncStatus Component

- [ ] Create `src/components/ui/SyncStatus.tsx`
- [ ] Icon for each status (cloud, spinner, offline, error)
- [ ] Tooltip with details
- [ ] Color coding
- [ ] Write component tests

**Verify**: Sync status displays correctly in all states

---

### 3.6 Update StorageService for Sync

- [ ] Modify `src/services/storage.ts`
- [ ] Read from local cache first
- [ ] Write to local cache with pending status
- [ ] Trigger sync on writes
- [ ] Handle household context
- [ ] Maintain backward compatibility for local-only mode

**Verify**: Storage operations work in both local and synced modes

---

### 3.7 Update useDishes Hook for Sync

- [ ] Filter dishes by current household
- [ ] Include addedBy in new dishes
- [ ] Trigger sync on mutations
- [ ] Handle sync status

**Verify**: Dishes sync across household members

---

### 3.8 Update usePlans Hook for Sync

- [ ] Filter plans by current household
- [ ] Include createdBy and assignedBy
- [ ] Trigger sync on mutations
- [ ] Handle sync status

**Verify**: Plans sync across household members

---

### 3.9 Implement Conflict Detection

- [ ] Detect concurrent edits on sync
- [ ] Mark items with conflict status
- [ ] Store both versions for resolution
- [ ] Write unit tests

**Verify**: Conflicts are detected and stored

---

### 3.10 Build ConflictResolver Component

- [ ] Create `src/components/sync/ConflictResolver.tsx`
- [ ] Show side-by-side comparison
- [ ] "Keep mine" / "Keep theirs" / "Merge" options
- [ ] Clear, non-technical language
- [ ] Write component tests

**Verify**: User can resolve conflicts

---

## Phase 4: Collaborative Planning

Meal plan locking and attribution.

### 4.1 Implement Plan Locking Service

- [ ] Add lock methods to `src/services/storage.ts` or new file
- [ ] Implement `acquireLock(planId, userId)` — set lockedBy/lockedAt
- [ ] Implement `releaseLock(planId)` — clear lock
- [ ] Implement `checkLock(planId)` — check lock status with auto-release
- [ ] Auto-release after 5 minutes
- [ ] Write unit tests

**Verify**: Lock acquisition and release work correctly

---

### 4.2 Create usePlanLock Hook

- [ ] Create `src/hooks/usePlanLock.ts`
- [ ] Track lock status for a plan
- [ ] Expose acquireLock, releaseLock, forceUnlock
- [ ] Handle stale lock detection
- [ ] Write hook tests

**Verify**: Hook provides lock management

---

### 4.3 Build LockIndicator Component

- [ ] Create `src/components/meals/LockIndicator.tsx`
- [ ] Show who is editing
- [ ] Show time since locked
- [ ] Unlock button if stale
- [ ] Write component tests

**Verify**: Lock indicator displays correctly

---

### 4.4 Update PlanPage for Locking

- [ ] Check lock status on load
- [ ] Acquire lock when entering edit mode
- [ ] Show LockIndicator if locked by another
- [ ] Disable edit actions when locked
- [ ] Release lock on leave/inactivity
- [ ] Write page tests

**Verify**: Cannot edit locked plans, lock acquired on edit

---

### 4.5 Add Attribution to Assignments

- [ ] Update DayAssignment to include assignedBy
- [ ] Record current user when assigning dishes
- [ ] Display who assigned in DaySlot (optional)
- [ ] Write tests

**Verify**: Assignments show who made them

---

## Phase 5: Attribution & Management

See who added what, leave/manage household.

### 5.1 Update DishCard for Attribution

- [x] Add addedBy display option (`addedByName`, `addedAt` props)
- [x] Show "Added by [name] [time]" when enabled
- [x] Smart time formatting (today/yesterday/X days ago/date)
- [x] Write component tests (7 new tests)

**Verify**: Dish attribution visible where appropriate ✅

---

### 5.2 Update Dish Detail View

- [x] Show who added the dish (resolves user ID to display name)
- [x] Show when it was added (formatted date)
- [x] Allow editing by any household member (already worked)
- [x] Write component tests (4 new tests)

**Verify**: Dish detail shows full attribution ✅

---

### 5.3 Implement Leave Household

- [x] Add leave flow in HouseholdPage (already existed)
- [x] Confirm before leaving (confirmation dialog)
- [x] Handle last member case → See 5.5 (preserve policy)
- [x] Clear local cache for that household (`clearHouseholdData()`)
- [x] Redirect to household selection
- [x] Write tests (5 new tests for clearHouseholdData)

**Verify**: Can leave household, data cleaned up ✅

---

### 5.4 Implement Remove Member

- [x] Add remove flow for creator (MemberList component)
- [x] Confirm before removing (confirmation dialog)
- [x] Cannot remove self (enforced in UI)
- [x] Member loses access immediately
- [x] Write component tests (14 new tests)

**Verify**: Creator can remove members ✅

---

### 5.5 Handle Orphaned Households

- [x] Decide policy: delete or preserve? → **PRESERVE**
- [x] ~~Implement cleanup if deleting~~ (N/A - using preserve)
- [x] Preserved by design: creators cannot leave, so households always have at least one member

**Policy Decision**: Households cannot become orphaned because:

1. Creators cannot leave their own household
2. Only the creator can remove other members
3. The household always has at least the creator as a member

If future features (account deletion, ownership transfer) change this, revisit the policy.

**Verify**: Edge case handled gracefully ✅

---

## Phase 6: SMS Invites (Optional Enhancement)

Send invites via text message. Requires Twilio setup.

### 6.1 Setup Twilio

- [ ] Create Twilio account
- [ ] Get account SID and auth token
- [ ] Get or buy phone number for SMS
- [ ] Store credentials securely

**Verify**: Twilio credentials ready

---

### 6.2 Create Supabase Edge Function for SMS

- [ ] Create `supabase/functions/send-invite-sms/index.ts`
- [ ] Accept phone/email and invite code
- [ ] Send SMS via Twilio API
- [ ] Handle iMessage-compatible emails
- [ ] Return success/error

**Verify**: Edge function sends SMS successfully

---

### 6.3 Integrate SMS in InviteModal

- [ ] Add phone/email input field
- [ ] Send button
- [ ] Call edge function
- [ ] Show success/error feedback
- [ ] Write component tests

**Verify**: Can send invite via SMS from UI

---

## Phase 7: Polish & Migration

Final refinements and migration path.

### 7.1 Local Dish Migration

- [ ] Detect existing local dishes on household join/create
- [ ] Prompt user to migrate
- [ ] Upload local dishes with user as addedBy
- [ ] Clear local dishes after successful migration
- [ ] Handle migration errors gracefully

**Verify**: Existing users don't lose their dishes

---

### 7.2 Update Export/Import

- [ ] Extend export format with household context
- [ ] Include member info in export
- [ ] Handle import into household (merge)
- [ ] Update useExport hook

**Verify**: Export includes full household data

---

### 7.3 Update Settings Page

- [ ] Add Account section (display name, sign out)
- [ ] Add Household section (link to HouseholdPage)
- [ ] Add Sync section (status, last synced)
- [ ] Update export to use new format

**Verify**: Settings page has all new sections

---

### 7.4 Add Household to HomePage

- [ ] Show household name in header
- [ ] Show HouseholdSwitcher if multiple
- [ ] Show setup prompt if no household
- [ ] Add SyncStatus indicator

**Verify**: Homepage reflects household context

---

### 7.5 Offline Mode Polish

- [ ] Clear "offline" indicator
- [ ] Graceful degradation messaging
- [ ] Test all flows offline
- [ ] Ensure data doesn't corrupt

**Verify**: App works well offline

---

### 7.6 Loading States

- [ ] Add loading skeletons for household data
- [ ] Add loading states for sync operations
- [ ] Smooth transitions between states

**Verify**: No jarring loading experiences

---

### 7.7 Error Handling

- [ ] User-friendly errors for auth failures
- [ ] User-friendly errors for sync failures
- [ ] User-friendly errors for invite failures
- [ ] Recovery options where possible

**Verify**: Errors are helpful, not technical

---

### 7.8 Accessibility Review

- [ ] Verify heading hierarchy in new pages
- [ ] Add ARIA labels to new components
- [ ] Test keyboard navigation
- [ ] Test with screen reader

**Verify**: New features meet WCAG AA

---

### 7.9 Mobile Testing

- [ ] Test auth flow on mobile
- [ ] Test household creation on mobile
- [ ] Test invite flow on mobile
- [ ] Test sync indicator on mobile
- [ ] Verify 44px touch targets

**Verify**: All new features work on mobile

---

### 7.10 End-to-End Testing

- [ ] Test: Create household → Invite → Join → Add dishes → See sync
- [ ] Test: Simultaneous editing (lock behavior)
- [ ] Test: Offline → Online sync
- [ ] Test: Leave household → Rejoin

**Verify**: Full collaboration flow works end-to-end

---

## Summary

| Phase | Tasks | Focus | Status |
| ------- | ------ | ---------------------------------------- | -------- |
| 0 | 5 | Backend setup (Supabase, schema, cache) | Pending |
| 1 | 7 | Authentication (magic links, profiles) | Pending |
| 2 | 12 | Households (create, invite, join) | Pending |
| 3 | 10 | Data sync (offline, real-time) | Pending |
| 4 | 5 | Collaborative planning (locks) | Pending |
| 5 | 5 | Attribution and management | Pending |
| 6 | 3 | SMS invites (optional) | Pending |
| 7 | 10 | Polish and migration | Pending |
| **Total** | **57** | | |

**Recommended approach**: Complete phases sequentially. Phase 6 (SMS) can be deferred
to a later release if needed. Each phase delivers testable, working functionality
before moving to the next.

**Estimated effort**: 4-6 weeks for a single developer, working incrementally.
