

# Source Management Page Implementation Plan

This plan adds a source management page at `/admin/sources` with full CRUD operations for news sources.

---

## Overview

Create a dedicated admin page for managing news sources with:
- Table listing all sources with key information
- Add new source form
- Edit existing sources
- Toggle source active status
- Delete sources with confirmation
- Manual scrape trigger per source

---

## Implementation Details

### 1. Database Permissions Update

Before the frontend can perform CRUD operations on sources, RLS policies need to be added to allow admin users to manage sources.

**New RLS Policies:**
- `Admins can insert sources` - INSERT policy for admin role
- `Admins can update sources` - UPDATE policy for admin role  
- `Admins can delete sources` - DELETE policy for admin role

### 2. Create Source Management Hook

Create `src/hooks/useSources.ts`:
- Fetch all sources using react-query
- Mutation for creating sources
- Mutation for updating sources
- Mutation for deleting sources
- Mutation for toggling active status

### 3. Create Source Management Page

Create `src/pages/admin/Sources.tsx`:
- Reuse dashboard header pattern with navigation
- Sources data table with columns: Name, RSS URL, Priority, Status, Last Scrape, Actions
- "Add Source" button opening a dialog form
- Edit action opening prefilled form
- Delete action with confirmation dialog
- Toggle active/inactive switch per row
- Scrape single source button

### 4. UI Components Breakdown

**Page Layout:**
```text
+----------------------------------------------------------+
|  SIFT Admin        [Dashboard] [Sources] [View Site] [Out] |
+----------------------------------------------------------+
|                                                          |
|  SOURCES              [+ Add Source]                     |
|                                                          |
|  +--------------------------------------------------+   |
|  | Name          | RSS URL   | Priority | Active |Act| |
|  +--------------------------------------------------+   |
|  | TechCrunch    | https://..| High     | [x]    |...| |
|  | The Verge     | https://..| High     | [x]    |...| |
|  | Wired         | https://..| High     | [ ]    |...| |
|  +--------------------------------------------------+   |
|                                                          |
+----------------------------------------------------------+
```

**Add/Edit Source Dialog:**
- Name (required)
- RSS URL (required, validated)
- Website URL (optional)
- Description (optional)
- Priority dropdown (low/medium/high/critical)
- Scrape Interval (minutes)
- Is Active toggle

### 5. Navigation Updates

Add admin sidebar/tabs navigation to Dashboard:
- Dashboard (analytics overview)
- Sources (this page)
- Future: Articles, Products, Earnings

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/admin/Sources.tsx` | Source management page |
| `src/hooks/useSources.ts` | Sources data hook with CRUD mutations |
| `src/components/admin/SourceDialog.tsx` | Add/Edit source dialog component |
| `src/components/admin/AdminNav.tsx` | Shared admin navigation component |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add route for `/admin/sources` |
| `src/pages/admin/Dashboard.tsx` | Add navigation links to sources page |

---

## Database Migration

Add RLS policies to allow admin CRUD on sources table:

```sql
-- Allow admins to insert sources
CREATE POLICY "Admins can insert sources"
ON sources FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to update sources
CREATE POLICY "Admins can update sources"
ON sources FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete sources
CREATE POLICY "Admins can delete sources"
ON sources FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

---

## Technical Implementation

### Sources Hook Structure

```typescript
export const useSources = () => {
  // Fetch all sources
  const query = useQuery({...});
  
  // Create source mutation
  const createMutation = useMutation({...});
  
  // Update source mutation  
  const updateMutation = useMutation({...});
  
  // Delete source mutation
  const deleteMutation = useMutation({...});
  
  // Toggle active mutation
  const toggleActiveMutation = useMutation({...});
  
  return { sources, isLoading, create, update, delete, toggleActive };
};
```

### Source Dialog Form Fields

| Field | Type | Validation |
|-------|------|------------|
| name | text | required, min 2 chars |
| rss_url | url | required, valid URL |
| website_url | url | optional, valid URL |
| description | textarea | optional, max 500 chars |
| priority | select | enum: low, medium, high, critical |
| scrape_interval_minutes | number | min 5, max 1440 |
| is_active | switch | boolean |

### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Name | text | Sortable, links to website |
| RSS URL | link | Truncated, copyable |
| Priority | badge | Color-coded |
| Status | switch | Toggle inline |
| Last Scrape | date | Relative time |
| Actions | menu | Edit, Delete, Scrape |

---

## Testing Notes

To test the scrape control and source management:

1. Enable auto-confirm for email signups temporarily (via configure-auth tool)
2. Create a test admin user
3. Grant admin role by inserting into `user_roles` table
4. Sign in and navigate to `/admin/dashboard`
5. Test category selection and scrape button
6. Navigate to `/admin/sources` to manage sources

