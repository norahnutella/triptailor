import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = [
  'server.js', 'config/db.js', 'middleware/authMiddleware.js',
  'models/User.js', 'models/Trip.js', 'models/Itinerary.js',
  'controllers/authController.js', 'controllers/itineraryController.js',
  'routes/authRoutes.js', 'routes/itineraryRoutes.js'
];
for (const file of files) {
  const source = await readFile(new URL(`./${file}`, import.meta.url), 'utf8');
  assert.ok(source.length > 20, `${file} is unexpectedly empty`);
}
console.log(`TripTailor backend smoke test passed: ${files.length} files checked.`);
