# Status Collection Setup

## Overview
The blog now uses a master status collection in Firestore to manage post statuses. This makes it easy to add, modify, or remove statuses without changing code.

## Setup Instructions

### 1. Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and update with the content from `firestore.rules`:

```
match /statuses/{status} {
  allow read: if true;
  allow create, update, delete: if true;
}
```

Click "Publish" to deploy the rules.

### 2. Initialize Status Collection

Run the initialization script:

```bash
npm run init-statuses
```

This will create three default statuses:
- **Draft** - Post is being written and not published (gray #64748b)
- **Published** - Post is live and visible to public (teal #14b8a6)
- **Archived** - Post is archived and not visible (slate #94a3b8)

### 3. How It Works

**Status Collection Structure:**
```typescript
interface Status {
  id: string;              // Firestore document ID
  name: string;            // URL-friendly name (e.g., 'draft', 'published')
  displayName: string;     // Human-readable name (e.g., 'Draft', 'Published')
  description: string;     // What this status means
  color: string;          // Hex color for UI display
  order: number;          // Display order
  isActive: boolean;      // Whether status is available for use
}
```

**Post References:**
- Posts store both `status` (name) and `statusId` (reference to status collection)
- This allows filtering by status name while maintaining a relationship to the master

**UI Benefits:**
- Admin posts page shows status filters with custom colors
- Status badges use colors from the master collection
- Adding a new status automatically appears in all dropdowns
- Inactive statuses are hidden from UI but data is preserved

### 4. Adding Custom Statuses

You can add new statuses directly in Firebase Console:

1. Go to Firestore Database → statuses collection
2. Add a new document with fields:
   - `name`: 'scheduled' (URL-friendly)
   - `displayName`: 'Scheduled'
   - `description`: 'Post scheduled for future publication'
   - `color`: '#f59e0b' (orange)
   - `order`: 4
   - `isActive`: true

The new status will immediately appear in:
- Admin post creation form
- Admin post edit form
- Admin posts filter

### 5. Managing Statuses

**Deactivate a Status:**
Set `isActive: false` - hides from UI but existing posts keep the status

**Change Display Order:**
Update `order` field - affects sort order in filters and dropdowns

**Update Color:**
Change `color` hex value - all badges update automatically

**Rename Status:**
Update `displayName` - shown in UI
Keep `name` the same - used in filters and queries

## Migration Notes

Existing posts without `statusId` will continue to work using the `status` field. When edited, they will automatically get a `statusId` assigned.

To bulk update existing posts with statusId:
1. Posts with `status: 'draft'` → link to draft status
2. Posts with `status: 'published'` → link to published status
3. Posts with other values → link to appropriate status or create new one
