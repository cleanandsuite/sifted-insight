# Sift User Authentication Implementation

## Overview
This document outlines the Supabase Auth implementation for Sift news aggregator.

## Files Created/Modified

### Database Schema
- **`supabase/migrations/20240204_auth_schema.sql`** - SQL migration for:
  - `user_preferences` table (user personalization)
  - `article_interactions` table (track saved/read/liked/shared)
  - RLS policies for security
  - Helper functions for common operations

### Type Definitions
- **`src/lib/database.types.ts`** - Updated with:
  - `UserPreferences` type
  - `ArticleInteraction` type
  - `InteractionType` union
  - `UserProfile` interface

### Auth Hooks
- **`src/hooks/useAuth.tsx`** - Main authentication hook providing:
  - User/session state
  - signUp, signIn, signOut methods
  - Google OAuth support
  - Preferences management

- **`src/hooks/useSavedArticles.ts`** - Saved articles management:
  - fetchSavedArticles()
  - toggleSaved()
  - isArticleSaved()

- **`src/hooks/useReadingHistory.ts`** - Reading history management:
  - fetchReadingHistory()
  - markAsRead()
  - clearHistory()

### UI Components
- **`src/components/AuthModal.tsx`** - Sign in/up modal with:
  - Email/password form with validation
  - Google OAuth button
  - Password visibility toggle
  - Success/error messages

- **`src/pages/ProfilePage.tsx`** - User profile with:
  - Saved articles tab
  - Reading history tab
  - Preferences settings

- **`src/pages/SavedArticlesPage.tsx`** - Dedicated saved articles page

- **`src/components/Header.tsx`** - Updated with:
  - User avatar dropdown
  - Sign in button
  - Saved articles link

- **`src/components/ArticleCard.tsx`** - Updated with:
  - Save/bookmark button
  - ArticleCardProps interface

### App Configuration
- **`src/App.tsx`** - Updated with:
  - AuthProvider wrapper
  - `/profile` route
  - `/saved` route
  - `/auth/callback` route

## Setup Instructions

### 1. Run Database Migration
Execute the SQL in `supabase/migrations/20240204_auth_schema.sql` in your Supabase SQL Editor.

### 2. Configure Environment Variables
Add to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 3. Enable OAuth Providers
In Supabase Dashboard:
- Authentication → Providers → Email (enabled by default)
- Authentication → Providers → Google (enable and configure)

### 4. Configure Email Templates
In Supabase Dashboard:
- Authentication → URL Configuration → Site URL: `http://localhost:5173`
- Authentication → Email Templates → Customize confirmation emails

## Usage Examples

### Using useAuth hook
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  if (user) {
    return <button onClick={signOut}>Sign Out</button>;
  }
  return <button onClick={() => signIn(email, password)}>Sign In</button>;
}
```

### Using useSavedArticles hook
```tsx
import { useSavedArticles } from '@/hooks/useSavedArticles';

function SavedArticles() {
  const { articles, toggleSaved, isArticleSaved } = useSavedArticles();
  
  return articles.map(article => (
    <ArticleCard 
      article={article}
      isSaved={isArticleSaved(article.id)}
      onToggleSave={() => toggleSaved(article.id)}
    />
  ));
}
```

### Protected Route
```tsx
import { useAuth } from '@/hooks/useAuth';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <AuthModal open={true} />;
  return children;
}
```

## Database Functions Available

| Function | Description |
|----------|-------------|
| `get_saved_articles(user_uuid)` | Returns all saved articles for a user |
| `get_reading_history(user_uuid, limit)` | Returns reading history with optional limit |
| `toggle_article_saved(user_uuid, article_uuid)` | Toggles saved status, returns boolean |
| `mark_article_read(user_uuid, article_uuid)` | Marks article as read |

## Security
- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- No public read access to user preferences
