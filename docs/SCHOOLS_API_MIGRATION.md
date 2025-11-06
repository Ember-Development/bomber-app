# Schools Data Migration to API

## Overview

Successfully migrated schools data from bundled static JSON files to a centralized API endpoint. This eliminates the need for app releases when updating school information.

## What Changed

### Before ❌

- Schools data was bundled in both mobile and web apps
- Had to maintain two identical `schools.json` files
- Any school update required:
  - Editing both files
  - Building new mobile app
  - Submitting to App Store/Play Store for review
  - Waiting days/weeks for users to update

### After ✅

- Single source of truth in API (`apps/api/data/schools.json`)
- Both mobile and web apps fetch from API
- Updates are instant (just edit the server file)
- Apps cache data for 24 hours for performance
- Fallback to bundled data if API is unavailable

## Architecture

### API Layer

**File:** `apps/api/data/schools.json`

- Single source of truth for all school data
- Edit this file to update schools

**Endpoint:** `GET /api/schools`

- Returns array of school divisions with conferences and schools
- Uses in-memory caching for performance
- Auto-refreshes when file is modified

### Mobile App

**API Client:** `apps/mobile/api/schools/schools.ts`

- Fetches schools from API endpoint

**Hook:** `apps/mobile/hooks/schools/useSchools.ts`

- Uses React Query for data management
- Caches for 24 hours
- Returns flattened schools for easy searching

**Component:** `apps/mobile/components/ui/atoms/SchoolInput.tsx`

- Updated to use `useSchools()` hook
- Fallback to bundled data if API fails
- No visual changes to users

### Web App

**API Client:** `apps/web/src/api/schools.ts`

- Fetches schools from API endpoint

**Hook:** `apps/web/src/hooks/useSchools.ts`

- Custom hook using localStorage caching
- Caches for 24 hours
- Returns flattened schools for easy searching

**Component:** `apps/web/src/components/ui/schoolInput.tsx`

- Updated to use `useSchools()` hook
- Fallback to bundled data if API fails
- No visual changes to users

## How to Update Schools

### Option 1: Direct File Edit (Recommended for small changes)

1. SSH into your API server
2. Edit `/path/to/apps/api/data/schools.json`
3. Save the file
4. Changes are live immediately
5. Users will see updates within 24 hours (or when their cache expires)

### Option 2: Deploy Updated File

1. Edit `apps/api/data/schools.json` locally
2. Commit and push to your repository
3. Deploy the API service
4. Changes are live after deployment

### Force Immediate Update (Optional)

If you need users to see changes immediately:

- Add a version check endpoint
- Or reduce cache duration (current: 24 hours)

## Cache Behavior

### Mobile (React Query)

- **Cache Duration:** 24 hours
- **Storage:** In-memory + AsyncStorage (React Query persistence)
- **Invalidation:** Automatic after 24 hours or app restart

### Web (localStorage)

- **Cache Duration:** 24 hours
- **Storage:** Browser localStorage
- **Invalidation:** Automatic after 24 hours
- **Manual Clear:** User can clear browser data

## Fallback Strategy

Both apps maintain the bundled `schools.json` as a fallback:

- If API is unreachable
- If API returns empty data
- If fetch fails for any reason

This ensures the app always works, even offline.

## Testing Checklist

- [x] API endpoint created and registered
- [x] Schools data copied to API
- [x] Mobile hook created with React Query
- [x] Mobile component updated
- [x] Web hook created with localStorage
- [x] Web component updated
- [x] Linter errors resolved
- [ ] Test API endpoint: `GET http://your-api.com/api/schools`
- [ ] Test mobile app school selection
- [ ] Test web app school selection
- [ ] Test offline behavior (should use fallback)
- [ ] Test cache expiration (wait 24 hours or clear cache)

## Future Enhancements

### Admin UI (Optional)

Create an admin panel to:

- Add/edit/delete schools via UI
- Upload schools CSV
- Preview changes before publishing

### Database Migration (Optional)

Move from JSON file to database:

- Better performance for large datasets
- Advanced search/filtering
- Real-time updates
- Audit trail of changes

## Rollback Plan

If issues occur, revert by:

1. Remove `useSchools()` hook usage in components
2. Restore original imports of bundled JSON
3. Deploy fixed version

Or simply:

- Keep the changes (they have fallback built-in)
- Fix the API issue separately

## Files Modified

### New Files

- `apps/api/data/schools.json` (copied from mobile)
- `apps/api/routes/schoolRoutes.ts`
- `apps/mobile/api/schools/schools.ts`
- `apps/mobile/hooks/schools/useSchools.ts`
- `apps/web/src/api/schools.ts`
- `apps/web/src/hooks/useSchools.ts`

### Modified Files

- `apps/api/api.ts` (added schools route)
- `apps/mobile/components/ui/atoms/SchoolInput.tsx` (uses hook)
- `apps/web/src/components/ui/schoolInput.tsx` (uses hook)

### Unchanged (Still needed as fallback)

- `apps/mobile/assets/data/schools.json`
- `apps/web/src/assets/data/schools.json`

## Notes

- **No database changes required** - uses file-based approach
- **No schema migrations** - safe for production
- **Zero downtime** - fallback ensures app always works
- **Backward compatible** - older app versions will continue using bundled data

## Support

For issues or questions:

1. Check API logs: `apps/api` server logs
2. Check browser console (web app)
3. Check React Native debugger (mobile app)
4. Verify API endpoint is accessible
5. Check cache expiration settings
