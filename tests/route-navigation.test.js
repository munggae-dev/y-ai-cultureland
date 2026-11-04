import test from "node:test";
import assert from "node:assert/strict";
import { nearbyStores } from "../nearby-data.js";
import {
  maneuverIndexAtPoint, matchRoutePosition, metersBetween,
  remainingRouteMeters, routeForStore,
} from "../route-navigation.js";

test("every nearby store has a usable walking route", () => {
  for (const store of nearbyStores) {
    const route = routeForStore(store);
    assert.ok(route, store.name);
    assert.ok(route.points.length > 2, store.name);
    assert.ok(route.maneuvers.length > 1, store.name);
    assert.ok(metersBetween(route.points[0], route.exit) < 35, store.name);
    assert.ok(metersBetween(route.points.at(-1), store) < 100, store.name);
    assert.ok(remainingRouteMeters(route.points, 0) > 0, store.name);
  }
});

test("route progress follows the nearest segment and reaches the final instruction", () => {
  const route = routeForStore(nearbyStores.find((store) => store.merchantId === "cu"));
  const midpoint = [
    (route.points[0][0] + route.points[1][0]) / 2,
    (route.points[0][1] + route.points[1][1]) / 2,
  ];
  const match = matchRoutePosition(route.points, midpoint);
  assert.equal(match.index, 0);
  assert.ok(Math.abs(match.fraction - 0.5) < 0.01);
  assert.ok(match.meters < 0.2);
  assert.ok(match.progressMeters > 0);
  assert.equal(remainingRouteMeters(route.points, route.points.length - 1), 0);
  assert.equal(maneuverIndexAtPoint(route.maneuvers, route.points.length - 1), route.maneuvers.length - 1);
});
