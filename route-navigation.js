import { walkingRoutes } from "./walking-routes.js";

const radians = (degrees) => degrees * Math.PI / 180;

export function routeForStore(store) {
  return walkingRoutes[store.area === "타임스퀘어" ? "timesSquare" : store.merchantId] ?? null;
}

export function metersBetween(a, b) {
  const lat1 = radians(Array.isArray(a) ? a[0] : a.lat);
  const lon1 = radians(Array.isArray(a) ? a[1] : a.lng);
  const lat2 = radians(Array.isArray(b) ? b[0] : b.lat);
  const lon2 = radians(Array.isArray(b) ? b[1] : b.lng);
  const value = Math.sin((lat2 - lat1) / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

// Project a GPS position onto the closest pedestrian route segment.
export function matchRoutePosition(points, position) {
  const latitude = Array.isArray(position) ? position[0] : position.lat;
  const longitude = Array.isArray(position) ? position[1] : position.lng;
  const longitudeScale = 111320 * Math.cos(radians(latitude));
  let best = { index: 0, fraction: 0, point: points[0], meters: Infinity, progressMeters: 0 };
  let completedMeters = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const dx = (end[1] - start[1]) * longitudeScale;
    const dy = (end[0] - start[0]) * 111320;
    const lengthSquared = dx * dx + dy * dy;
    const fraction = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
      ((longitude - start[1]) * longitudeScale * dx + (latitude - start[0]) * 111320 * dy) / lengthSquared
    ));
    const point = [start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction];
    const meters = metersBetween(point, position);
    const segmentMeters = metersBetween(start, end);
    if (meters < best.meters) {
      best = { index, fraction, point, meters, progressMeters: completedMeters + segmentMeters * fraction };
    }
    completedMeters += segmentMeters;
  }
  return best;
}

export function remainingRouteMeters(points, index) {
  let meters = 0;
  for (let i = index; i < points.length - 1; i += 1) {
    meters += metersBetween(points[i], points[i + 1]);
  }
  return Math.round(meters);
}

export function maneuverIndexAtPoint(maneuvers, pointIndex) {
  const index = maneuvers.findIndex((item) => item.end > pointIndex);
  return index === -1 ? maneuvers.length - 1 : index;
}

export function maneuverText(maneuver, exitName, destinationName) {
  const road = maneuver.street ? ` ${maneuver.street} 방향으로` : "";
  if ([1, 2, 3].includes(maneuver.type)) return `${exitName}에서 출발해요.`;
  if ([4, 5].includes(maneuver.type)) return `${destinationName}에 도착했어요.`;
  if (maneuver.type === 10) return `오른쪽으로 돌아${road} 이동해요.`;
  if (maneuver.type === 15) return `왼쪽으로 돌아${road} 이동해요.`;
  if (maneuver.type === 9) return `오른쪽 길을 따라${road} 이동해요.`;
  if (maneuver.type === 16) return `왼쪽 길을 따라${road} 이동해요.`;
  if (maneuver.type === 39) return "엘리베이터를 이용해요.";
  return `${maneuver.street || "보행로"}를 따라 이동해요.`;
}
