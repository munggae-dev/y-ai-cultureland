import { demoLocation } from "./nearby-data.js";
import {
  maneuverIndexAtPoint, maneuverText, matchRoutePosition,
  remainingRouteMeters, routeForStore,
} from "./route-navigation.js";

const view = document.querySelector("#route-view");
const mapElement = document.querySelector("#route-map");
const mapUnavailable = document.querySelector("#route-map-unavailable");
const recenterButton = document.querySelector("#route-recenter");
const fitButton = document.querySelector("#route-fit");
const nextButton = document.querySelector("#route-next-step");
const status = document.querySelector("#route-location-status");

let store;
let route;
let stepIndex = 0;
let matchedPosition = null;
let currentPosition = null;
let watchId = null;
let routeMap = null;
let routeLayers = null;
let remainingLine = null;
let positionMarker = null;
let accuracyCircle = null;

function setStatus(message = "") {
  status.textContent = message;
  status.hidden = !message;
}

function renderStep() {
  if (!route) return;
  const maneuver = route.maneuvers[stepIndex];
  const remaining = matchedPosition
    ? Math.max(0, Math.round(remainingRouteMeters(route.points, 0) - matchedPosition.progressMeters))
    : remainingRouteMeters(route.points, maneuver.begin);
  document.querySelector("#route-step-count").textContent = `${stepIndex + 1} / ${route.maneuvers.length}`;
  document.querySelector("#route-instruction").textContent = maneuverText(maneuver, route.exit.name, store.name);
  document.querySelector("#route-distance").textContent = `남은 거리 약 ${remaining}m`;
  nextButton.hidden = !!matchedPosition;
  nextButton.disabled = stepIndex >= route.maneuvers.length - 1;
  nextButton.textContent = nextButton.disabled ? "도착" : "다음 안내";
}

function fitRoute() {
  if (!routeMap || !route) return;
  routeMap.fitBounds(route.points, { padding: [35, 35], maxZoom: 17 });
}

function renderRouteMap() {
  if (!window.L) {
    mapElement.hidden = true;
    mapUnavailable.hidden = false;
    recenterButton.hidden = true;
    fitButton.hidden = true;
    return;
  }
  mapElement.hidden = false;
  mapUnavailable.hidden = true;
  recenterButton.hidden = false;
  fitButton.hidden = false;
  if (!routeMap) {
    routeMap = window.L.map(mapElement, { scrollWheelZoom: false });
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(routeMap);
  }
  routeLayers?.remove();
  routeLayers = window.L.layerGroup().addTo(routeMap);
  window.L.polyline(route.points, { color: "#a9b7c9", weight: 7, opacity: 0.8 }).addTo(routeLayers);
  remainingLine = window.L.polyline(route.points, { color: "#2b71d5", weight: 7, opacity: 0.95 }).addTo(routeLayers);
  window.L.circleMarker(route.points[0], {
    radius: 6, color: "#fff", weight: 2, fillColor: "#3978d8", fillOpacity: 1,
  }).addTo(routeLayers).bindTooltip(route.exit.name);
  window.L.marker(route.points.at(-1), { title: store.name }).addTo(routeLayers).bindTooltip(store.name);
  positionMarker = window.L.circleMarker([demoLocation.lat, demoLocation.lng], {
    radius: 10, color: "#fff", weight: 3, fillColor: "#7e8da3", fillOpacity: 1,
  }).addTo(routeLayers).bindTooltip("기준 위치");
  accuracyCircle = window.L.circle([demoLocation.lat, demoLocation.lng], {
    radius: 0, color: "#2777df", weight: 1, fillOpacity: 0.08, opacity: 0.3,
  }).addTo(routeLayers);
  recenterButton.textContent = "기준 위치";
  requestAnimationFrame(() => {
    if (view.hidden) return;
    routeMap.invalidateSize();
    const bounds = window.L.latLngBounds([...route.points, [demoLocation.lat, demoLocation.lng]]);
    routeMap.fitBounds(bounds, { padding: [35, 35], maxZoom: 17 });
  });
}

function onLocation(position) {
  if (!route || view.hidden) return;
  const candidate = { lat: position.coords.latitude, lng: position.coords.longitude };
  if (!Number.isFinite(candidate.lat) || !Number.isFinite(candidate.lng)) return;
  currentPosition = candidate;
  positionMarker?.setLatLng([candidate.lat, candidate.lng]).setStyle({ fillColor: "#2777df" });
  positionMarker?.setTooltipContent("내 위치");
  accuracyCircle?.setLatLng([candidate.lat, candidate.lng]).setRadius(position.coords.accuracy || 0);
  recenterButton.textContent = "내 위치";

  const match = matchRoutePosition(route.points, candidate);
  if (position.coords.accuracy > 70) {
    matchedPosition = null;
    remainingLine?.setLatLngs(route.points);
    setStatus("위치 정확도가 낮아 경로 진행 상황을 확인할 수 없어요.");
  } else if (match.meters > 35) {
    matchedPosition = null;
    remainingLine?.setLatLngs(route.points);
    setStatus("현재 위치가 표시된 경로에서 떨어져 있어요.");
  } else {
    matchedPosition = match;
    stepIndex = maneuverIndexAtPoint(route.maneuvers, match.index + (match.fraction > 0.85 ? 1 : 0));
    remainingLine?.setLatLngs([match.point, ...route.points.slice(match.index + 1)]);
    setStatus();
  }
  renderStep();
}

function onLocationError() {
  if (!route || view.hidden) return;
  setStatus(currentPosition
    ? "현재 위치가 갱신되지 않고 있어요."
    : "현재 위치를 확인할 수 없어 영등포역 기준 위치를 표시해요.");
}

recenterButton.addEventListener("click", () => {
  const position = currentPosition ?? demoLocation;
  routeMap?.flyTo([position.lat, position.lng], 17);
});
fitButton.addEventListener("click", fitRoute);
nextButton.addEventListener("click", () => {
  if (!route || matchedPosition || stepIndex >= route.maneuvers.length - 1) return;
  stepIndex += 1;
  renderStep();
});

export function showRouteGuide(selectedStore) {
  const selectedRoute = routeForStore(selectedStore);
  if (!selectedRoute) return false;
  hideRouteGuide();
  store = selectedStore;
  route = selectedRoute;
  stepIndex = 0;
  document.querySelector("#route-store-name").textContent = store.name;
  document.querySelector("#route-exit").textContent = `${route.exit.name} 출발`;
  document.querySelector("#route-target").textContent = store.area === "타임스퀘어"
    ? `${store.name} · 건물 내부는 ${store.address.split(", ").at(-1)}로 이동`
    : store.address;
  document.querySelector("#route-back").href = `#nearby/${store.merchantId}`;
  setStatus("현재 위치를 확인하는 중이에요.");
  renderRouteMap();
  renderStep();
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(onLocation, onLocationError, {
      enableHighAccuracy: true, maximumAge: 3000, timeout: 12000,
    });
  } else {
    onLocationError();
  }
  return true;
}

export function hideRouteGuide() {
  if (watchId !== null) navigator.geolocation?.clearWatch(watchId);
  watchId = null;
  currentPosition = null;
  matchedPosition = null;
  route = null;
  store = null;
}
