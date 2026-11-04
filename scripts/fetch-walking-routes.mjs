// Refresh the station-exit walking routes used by the map guide.
// Run only when route data needs updating: node scripts/fetch-walking-routes.mjs
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { nearbyStores } from "../nearby-data.js";

const exits = {
  east: { name: "영등포역 5번 출구", lat: 37.5164959, lng: 126.9072927, osmNode: 3404991290 },
  west: { name: "영등포역 3번 출구", lat: 37.5161226, lng: 126.9068740, osmNode: 8211568112 },
};
const targets = {
  gs25: { store: "gs25", exit: "west" },
  cu: { store: "cu", exit: "east" },
  emart24: { store: "emart24", exit: "east" },
  timesSquare: { store: "artbox", exit: "west" },
};

function decodeShape(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    const values = [];
    for (let coordinate = 0; coordinate < 2; coordinate += 1) {
      let shift = 0;
      let result = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      values.push(result & 1 ? ~(result >> 1) : result >> 1);
    }
    lat += values[0];
    lng += values[1];
    points.push([lat / 1e6, lng / 1e6]);
  }
  return points;
}

const routes = {};
for (const [key, target] of Object.entries(targets)) {
  const exit = exits[target.exit];
  const store = nearbyStores.find((item) => item.merchantId === target.store);
  const request = {
    locations: [{ lat: exit.lat, lon: exit.lng }, { lat: store.lat, lon: store.lng }],
    costing: "pedestrian",
  };
  const url = new URL("https://valhalla1.openstreetmap.de/route");
  url.searchParams.set("json", JSON.stringify(request));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Route ${key}: HTTP ${response.status}`);
  const data = await response.json();
  if (data.trip?.status !== 0) throw new Error(`Route ${key}: ${data.trip?.status_message ?? "not found"}`);
  const leg = data.trip.legs[0];
  routes[key] = {
    exit,
    destination: [store.lat, store.lng],
    lengthMeters: Math.round(leg.summary.length * 1000),
    points: decodeShape(leg.shape),
    maneuvers: leg.maneuvers.map(({ type, street_names: streets, begin_shape_index: begin, end_shape_index: end }) => ({
      type, street: streets?.[0] ?? "", begin, end,
    })),
  };
  console.log(`${key}: ${routes[key].lengthMeters}m, ${routes[key].points.length} points`);
}

const output = resolve(import.meta.dirname, "../walking-routes.js");
await writeFile(output, `// Valhalla pedestrian routes from OpenStreetMap, refreshed 2026-11-04.\n// Routes start at mapped Yeongdeungpo Station exits; see DATA_SOURCES.md.\nexport const walkingRoutes = ${JSON.stringify(routes, null, 2)};\n`);
console.log(`Wrote ${output}`);
