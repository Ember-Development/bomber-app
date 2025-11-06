# API Integration Summary - bomber-web

## Overview

Integrated TanStack React Query to fetch real data from the API for all Home page components.

## Changes Made

### 1. Package Dependencies

- Added `@bomber-app/database` workspace dependency to `package.json`

### 2. API Client Setup

**File**: `src/api/api.ts`

- Updated axios client configuration with proper base URL from environment variable

### 3. API Service Files Created

#### `src/api/article.ts`

- `fetchArticles()` - Fetches all articles from `/api/articles`
- Returns array of articles with: `id`, `title`, `body`, `link`, `imageUrl`, `createdAt`, `updatedAt`

#### `src/api/event.ts`

- `fetchEvents()` - Fetches all events from `/api/events`
- `getUpcomingEvent()` - Filters for the most upcoming GLOBAL event that's in the future
- Returns event with: `id`, `eventType`, `start`, `end`, `title`, `body`, `location`, etc.

#### `src/api/sponsor.ts`

- `fetchSponsors()` - Fetches all sponsors from `/api/sponsors`
- Returns array of sponsors with: `id`, `title`, `url`, `logoUrl`, `createdAt`, `updatedAt`

#### `src/api/media.ts`

- `fetchMedia()` - Fetches all media/videos from `/api/medias`
- Returns array of media with: `id`, `title`, `videoUrl`, `category`, `createdAt`, `updatedAt`

### 4. Component Updates

#### `src/components/home/NewsRail.tsx`

- Uses `useQuery` hook to fetch articles
- Displays loading state while fetching
- Shows empty state if no articles
- Maps through real article data with images and links

#### `src/components/home/UpcomingEvent.tsx`

- Uses `useQuery` hook to fetch upcoming event
- Implements real countdown timer with `useCountdown` hook that updates every second
- Filters for the most upcoming GLOBAL event
- Always renders the component with fallback "No Upcoming Events" message if no events found
- Displays real event title or fallback message
- Badge changes to "Stay Tuned" when no events available

#### `src/components/home/SponsorsStrip.tsx`

- Uses `useQuery` hook to fetch sponsors
- Returns `null` if no sponsors (doesn't render)
- Duplicates sponsors array for seamless infinite scroll
- Uses sponsor logo URLs

#### `src/components/home/MediaRail.tsx`

- Uses `useQuery` hook to fetch media/videos
- Returns `null` if no media (doesn't render)
- Maps through real media data with titles
- Play buttons link to actual video URLs

### 5. ChampionshipHistory Component

- Remains unchanged - this component is meant to route to other pages as specified

## Environment Variables Required

Make sure to set `VITE_API_URL` in your `.env` file:

```
VITE_API_URL=http://localhost:3000
```

## Testing

To test the integration:

1. Ensure your API server is running
2. Have some test data in the database (articles, events, sponsors, media)
3. The components will automatically show loading states while fetching
4. If no data is available, components either show empty states or don't render

## Next Steps

1. Add error handling UI for failed API requests
2. Add retry logic for failed requests
3. Consider adding pagination for articles/media if the dataset grows large
4. Add timestamp formatting for dates
5. Add image fallbacks if imageUrl is null
6. Consider adding skeleton loaders instead of plain loading text
