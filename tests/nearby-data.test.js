import test from "node:test";
import assert from "node:assert/strict";
import { demoLocation, distanceMeters, findNearbyStores } from "../nearby-data.js";

test("sorts sourced Yeongdeungpo stores by straight-line distance", () => {
  const found = findNearbyStores([{ id: "cgv" }, { id: "gs25" }, { id: "cu" }]);
  assert.deepEqual(found.map((store) => store.merchantId), ["gs25", "cu", "cgv"]);
  assert.ok(found.every((store) => store.address.startsWith("서울 영등포구") && store.sourceUrl.startsWith("https://")));
  assert.deepEqual(findNearbyStores([{ id: "megabox" }]), []);
  assert.equal(distanceMeters(demoLocation, demoLocation), 0);
});
