# TripTailor persistent trip backend update

Replace the matching files in `server/` with the files in this folder.

## What this adds
- Persistent Trip document with `title`, `owner`, `members`, itinerary data and trip metadata.
- One saved itinerary associated with each Trip.
- Exact saved itinerary retrieval through `GET /api/itineraries/:tripId`.
- Saved itinerary list includes trips owned by the user or shared with the user.
- Optional invitations by email for existing TripTailor accounts.
- Persistent per-trip chat stored in MongoDB.
- Members can read/send messages only for trips they belong to.
- Only the trip owner can delete a trip.

## Server change
In `server/server.js` add:

```js
import tripRoutes from './routes/tripRoutes.js';
app.use('/api/trips', tripRoutes);
```

No new npm package is required.

## Important
This version intentionally keeps the existing `tripId` string used by the current frontend so existing saved-itinerary data can be migrated more easily.

Invitations currently work with existing registered TripTailor accounts by email. Email delivery to unregistered addresses is not included in this backend update.
