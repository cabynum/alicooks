# Feature Specification: Family Collaboration

**Feature Branch**: `002-family-collaboration`  
**Created**: 2024-12-27  
**Status**: Draft  
**Input**: User description: "Family collaboration feature allowing multiple household members to share and manage dishes and meal plans together"

## Overview

DishCourse currently works as a single-user app. This feature enables multiple family/household members to collaborate on a shared dish collection and meal plans, eliminating the "what's for dinner?" text message chains.

**Aliya's Vision**: Make DishCourse a family app, not just a personal tool. Multiple family members should be able to view and add to the shared dish collection, see and edit meal plans together, and coordinate on what's for dinner without texting back and forth.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Household (Priority: P1)

A user who wants to start sharing with their family creates a new household. They become the first member and receive a way to invite others.

**Why this priority**: This is the foundational step — without a household, no collaboration can happen. Everything else depends on this.

**Independent Test**: Can be fully tested by creating a household and verifying the user is recognized as a member. Delivers immediate value by establishing the sharing context.

**Acceptance Scenarios**:

1. **Given** a user with an existing dish collection, **When** they create a new household, **Then** they become a member of that household and their existing dishes become part of the shared collection.
2. **Given** a user who creates a household, **When** the household is created, **Then** they can invite family members via shareable link, text message (SMS), or invite code.
3. **Given** a user without internet connection, **When** they try to create a household, **Then** they see a friendly message explaining that household creation requires internet.

---

### User Story 2 - Join an Existing Household (Priority: P1)

A family member receives an invitation (via link, text message/iMessage, or code) and joins the household. After joining, they can immediately see all shared dishes and meal plans.

**Why this priority**: This completes the collaboration loop — without joining, there's no multi-user experience. Equally critical as creating a household.

**Independent Test**: Can be fully tested by using an invite code/link and verifying access to shared dishes. Delivers value by connecting family members.

**Acceptance Scenarios**:

1. **Given** a valid household invite, **When** a new user accepts the invite, **Then** they become a member of the household and see all shared dishes.
2. **Given** a valid household invite, **When** a user who already has personal dishes joins, **Then** their existing dishes are merged into the shared collection.
3. **Given** an expired or invalid invite, **When** a user tries to join, **Then** they see a friendly error message explaining the invite is no longer valid.
4. **Given** a user already in one household, **When** they try to join another, **Then** they become a member of both households and can switch between them.
5. **Given** a household member wants to invite someone, **When** they enter a phone number or iMessage email address (e.g., iCloud), **Then** the system sends an invite as a message to their Messages app.
6. **Given** a user receives an invite via text message (SMS/iMessage), **When** they tap the link, **Then** they are taken directly to join the household.

---

### User Story 3 - View Shared Dishes (Priority: P1)

Any household member can browse the complete shared dish collection. Dishes added by any member appear for everyone.

**Why this priority**: This is the core value proposition — a shared dish library means less "what do we have?" conversations.

**Independent Test**: Can be fully tested by having two members add dishes and verifying both see all dishes. Delivers the primary collaboration value.

**Acceptance Scenarios**:

1. **Given** a household with multiple members, **When** any member views the dish list, **Then** they see all dishes added by all members.
2. **Given** a household member adds a new dish, **When** another member views the dish list, **Then** the new dish appears in their view.
3. **Given** a member is offline, **When** they view dishes, **Then** they see the last-synced version of the shared collection.

---

### User Story 4 - Add Dishes to Shared Collection (Priority: P2)

Any household member can add new dishes to the shared collection. The dish appears for all members.

**Why this priority**: Builds on viewing (P1) by enabling contribution. Important but viewing shared content comes first.

**Independent Test**: Can be fully tested by adding a dish as one member and verifying visibility to others.

**Acceptance Scenarios**:

1. **Given** a household member on the Add Dish screen, **When** they save a new dish, **Then** it is added to the shared collection and visible to all members.
2. **Given** a member adds a dish while offline, **When** they regain internet connection, **Then** the dish syncs to the shared collection.
3. **Given** two members add dishes at the same time, **When** both sync, **Then** both dishes appear in the collection without conflict.

---

### User Story 5 - Collaborate on Meal Plans (Priority: P2)

Household members can view and modify the shared meal plan. Changes by any member are reflected for everyone.

**Why this priority**: Extends collaboration from dishes to planning. High value for the "what's for dinner tonight?" use case.

**Independent Test**: Can be fully tested by having one member assign a meal and another verify the assignment appears.

**Acceptance Scenarios**:

1. **Given** a shared meal plan, **When** one member assigns a dish to Monday, **Then** all members see that assignment.
2. **Given** one member is viewing the plan, **When** another member makes a change, **Then** the first member's view updates to reflect the change.
3. **Given** one member is editing a meal plan, **When** another member tries to edit the same plan, **Then** they see that the plan is being edited by someone else and must wait until it's released.

---

### User Story 6 - See Who Added What (Priority: P3)

Users can see which household member added each dish or made changes to the plan. This creates accountability and context.

**Why this priority**: Nice-to-have attribution. Core functionality works without it, but it adds context for families.

**Independent Test**: Can be fully tested by adding a dish and verifying the contributor is displayed.

**Acceptance Scenarios**:

1. **Given** a dish in the shared collection, **When** a member views dish details, **Then** they can see who added the dish.
2. **Given** a meal plan assignment, **When** a member views it, **Then** they can see who made the assignment.

---

### User Story 7 - Leave or Manage Household (Priority: P3)

Users can leave a household they no longer want to be part of. Household creators can remove members.

**Why this priority**: Important for lifecycle management but not needed for initial collaboration.

**Independent Test**: Can be fully tested by leaving a household and verifying loss of access to shared content.

**Acceptance Scenarios**:

1. **Given** a household member, **When** they choose to leave the household, **Then** they lose access to shared dishes and plans.
2. **Given** a user leaves a household, **When** they had contributed dishes, **Then** those dishes remain in the shared collection (they don't take them).
3. **Given** the household creator, **When** they remove a member, **Then** that member loses access to shared content.

---

### Edge Cases

- What happens when the last member leaves a household? (The household and its data are deleted, or preserved for potential re-join?)
- How does the system handle a household with no internet access for extended periods? (Local changes queue for sync)
- What if a member's device is lost? (They can sign in on a new device and regain access)
- What happens to locally-stored dishes when joining a household? (Merged into shared collection)

## Requirements *(mandatory)*

### Functional Requirements

#### Household Management

- **FR-001**: System MUST allow users to create a new household
- **FR-002**: System MUST generate a shareable invite link when a household is created
- **FR-003**: System MUST allow users to join a household using a valid invite link or code
- **FR-028**: System MUST allow household members to send message invites to a phone number or iMessage-compatible email address
- **FR-029**: System MUST send the invite as an SMS/iMessage containing the invite link
- **FR-030**: System MUST support iMessage email addresses (e.g., iCloud addresses) as valid recipients for message invites
- **FR-031**: System MUST allow manual entry of an invite code for users who receive it verbally or via other channels
- **FR-004**: System MUST allow users to leave a household voluntarily
- **FR-005**: System MUST allow household creators to remove other members
- **FR-006**: System MUST prevent access to shared content after a member leaves or is removed

#### Data Sharing

- **FR-007**: System MUST sync dishes across all household members
- **FR-008**: System MUST sync meal plans across all household members
- **FR-009**: System MUST track which member added each dish
- **FR-010**: System MUST merge a joining member's existing local dishes into the shared collection
- **FR-011**: System MUST support offline viewing of last-synced shared content
- **FR-012**: System MUST queue changes made offline and sync when connection is restored

#### Identity & Access

- **FR-013**: System MUST identify users to enable personal attribution and household membership
- **FR-014**: System MUST authenticate users via magic links (passwordless email-based authentication)
- **FR-015**: System MUST allow users to set a display name visible to other household members
- **FR-016**: System MUST protect household data so only members can access it

#### Multi-Household Support

- **FR-020**: System MUST allow users to belong to multiple households simultaneously
- **FR-021**: System MUST provide a household switcher to navigate between households
- **FR-022**: System MUST keep each household's dishes and plans separate
- **FR-023**: System MUST clearly indicate which household is currently active

#### Conflict Prevention

- **FR-024**: System MUST lock meal plans while a user is actively editing
- **FR-025**: System MUST show other users that a plan is locked and who is editing it
- **FR-026**: System MUST auto-release locks after a period of inactivity (e.g., 5 minutes)
- **FR-027**: System MUST allow the editing user to explicitly release the lock when done

#### Data Ownership (Constitution Principle IV)

- **FR-017**: System MUST allow any household member to export the complete shared data
- **FR-018**: Exported data MUST include all dishes and meal plans in human-readable format
- **FR-019**: System MUST NOT lock users into a proprietary data format

### Key Entities

- **Household**: A group of users who share dishes and meal plans. Has a unique identifier, name, creation date, and list of members.
- **Member**: A user belonging to a household. Has a display name, join date, and role (creator or member).
- **Invite**: A mechanism to join a household. Has a code/link, expiration, and usage status.
- **Dish** (extended): Existing Dish entity gains an `addedBy` field referencing the member who created it.
- **MealPlan** (extended): Existing MealPlan entity gains an `assignedBy` field for each assignment.

## Assumptions

These are reasonable defaults chosen to keep the spec focused:

- **Multiple households supported**: Users can belong to multiple households simultaneously (e.g., immediate family + extended family). A household switcher UI is required.
- **Dishes don't leave**: When a user leaves a household, dishes they added remain with the household.
- **Invite expiration**: Invites expire after 7 days for security.
- **Sync frequency**: Changes sync within 30 seconds when online (not real-time WebSocket, but frequent polling or event-driven).
- **Conflict prevention via locking**: When a user is editing a meal plan, others see it as "locked" and must wait. Locks auto-release after inactivity.
- **Magic link authentication**: Users authenticate via passwordless email links — low friction, no passwords to remember.
- **No permissions hierarchy**: All household members have equal access (no admin-only features beyond removal).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a household and invite a family member in under 2 minutes
- **SC-002**: Dishes added by one member appear for other members within 30 seconds
- **SC-003**: 95% of users successfully join a household on their first attempt using an invite link/code
- **SC-004**: Users can view shared content while offline (last-synced data available)
- **SC-005**: Data export includes all shared dishes and plans, maintaining data ownership principle
- **SC-006**: Users report reduced "what's for dinner" coordination messages with family (qualitative)

## Design Decisions

The following questions were resolved during specification:

### Decision 1: Multiple Households ✅

**Question**: Can a user belong to multiple households simultaneously?

**Answer**: **B — Multiple households allowed**

Users can belong to multiple households (e.g., immediate family + extended family). This requires a household switcher UI and per-household data separation.

---

### Decision 2: Conflict Resolution ✅

**Question**: How should the system handle simultaneous edits to the same data?

**Answer**: **C — Prevent conflicts (lock while editing)**

When a user is editing a meal plan, the system locks it so others see it's in use and must wait. Locks auto-release after a period of inactivity to prevent indefinite blocking.

---

### Decision 3: Authentication Approach ✅

**Question**: What authentication method fits DishCourse's user-first philosophy?

**Answer**: **A — Magic links (email-based, no password)**

Users authenticate via passwordless email links. Low friction, no passwords to remember, aligns with the constitution's emphasis on simplicity.
