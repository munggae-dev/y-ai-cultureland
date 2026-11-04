import { categories, merchants, searchMerchants, sources, understandQuestion } from "./usage-data.js";
import { demoLocation, findNearbyStores } from "./nearby-data.js";
import { hideRouteGuide, showRouteGuide } from "./route-guide.js";

const slides = [
  { src: "/assets/banner-bank.png", alt: "내 보험료 줄이는 방법 찾기" },
  { src: "/assets/banner-coupon.png", alt: "3,000원 쿠폰 이벤트" },
  { src: "/assets/banner-welcome.png", alt: "웰컴 컬쳐랜드 이벤트" },
  { src: "/assets/banner-soop.png", alt: "SOOP 월즈 이벤트" },
  { src: "/assets/banner-new.png", alt: "컬쳐랜드 신규 이벤트" },
];

const track = document.querySelector("#hero-track");
const count = document.querySelector("#hero-count");
const windowElement = document.querySelector("#hero-window");
const slideWidth = 452;
let current = 0;

for (const slide of [slides.at(-1), ...slides, slides[0]]) {
  const item = document.createElement("div");
  item.className = "hero-slide";
  const image = document.createElement("img");
  image.src = slide.src;
  image.alt = slide.alt;
  item.append(image);
  track.append(item);
}

function renderSlide() {
  track.style.transform = `translate3d(${60 - (current + 1) * slideWidth}px, 0, 0)`;
  count.textContent = `${current + 1} / ${slides.length}`;
}

function moveSlide(direction) {
  current = (current + direction + slides.length) % slides.length;
  renderSlide();
}

let touchStart = null;
windowElement.addEventListener("touchstart", (event) => {
  touchStart = event.changedTouches[0]?.clientX ?? null;
}, { passive: true });
windowElement.addEventListener("touchend", (event) => {
  if (touchStart === null) return;
  const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
  if (Math.abs(distance) > 40) moveSlide(distance < 0 ? 1 : -1);
  touchStart = null;
}, { passive: true });
renderSlide();

const menu = document.querySelector("#menu-panel");
const menuToggle = document.querySelector("#menu-toggle");

function setMenuOpen(open) {
  menu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "전체 메뉴 닫기" : "전체 메뉴 열기");
}

menuToggle.addEventListener("click", () => setMenuOpen(menu.hidden));
document.querySelector("#menu-close").addEventListener("click", () => setMenuOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) setMenuOpen(false);
});
document.querySelector("#toast-close").addEventListener("click", () => {
  document.querySelector("#promo-toast").hidden = true;
});

const homeView = document.querySelector("#home-view");
const useView = document.querySelector("#use-view");
const nearbyView = document.querySelector("#nearby-view");
const routeView = document.querySelector("#route-view");
const homeNav = document.querySelector("#home-nav");
const useNav = document.querySelector("#use-nav");

function renderView() {
  const formerArStoreId = /^#ar\/([a-z0-9]+)$/.exec(location.hash)?.[1];
  if (formerArStoreId) {
    location.replace(`#route/${formerArStoreId}`);
    return;
  }
  const showingUse = location.hash === "#use";
  const showingNearby = /^#nearby(?:\/[a-z0-9]+)?$/.test(location.hash);
  const routeStoreId = /^#route\/([a-z0-9]+)$/.exec(location.hash)?.[1];
  const routeStore = routeStoreId ? findNearbyStores(merchants).find((store) => store.merchantId === routeStoreId) : null;
  const showingRoute = Boolean(routeStore);
  const showingUsage = showingUse || showingNearby || showingRoute;
  const dialog = document.querySelector("#merchant-dialog");
  if (dialog.open) dialog.close();
  homeView.hidden = showingUsage;
  useView.hidden = !showingUse;
  nearbyView.hidden = !showingNearby;
  routeView.hidden = !showingRoute;
  document.body.classList.toggle("use-mode", showingUsage);
  homeNav.classList.toggle("active", !showingUsage);
  useNav.classList.toggle("active", showingUsage);
  if (showingUsage) {
    homeNav.removeAttribute("aria-current");
    useNav.setAttribute("aria-current", "page");
  } else {
    useNav.removeAttribute("aria-current");
    homeNav.setAttribute("aria-current", "page");
  }
  setMenuOpen(false);
  window.scrollTo(0, 0);
  if (showingNearby) renderNearbyPage();
  if (showingRoute) showRouteGuide(routeStore);
  else hideRouteGuide();
}

window.addEventListener("hashchange", renderView);

const categoryChips = document.querySelector("#category-chips");
const searchInput = document.querySelector("#merchant-input");
const searchFeedback = document.querySelector("#search-feedback");
const onlineMerchants = document.querySelector("#online-merchants");
const offlineMerchants = document.querySelector("#offline-merchants");
const merchantDialog = document.querySelector("#merchant-dialog");
const usageDetail = document.querySelector("#usage-detail");
const nearbyMapElement = document.querySelector("#nearby-map");
const nearbyRecenter = document.querySelector("#nearby-recenter");
const mapFallback = document.querySelector("#map-fallback");
const mapCaption = document.querySelector("#map-caption");
const nearbyList = document.querySelector("#nearby-list");
const nearbyResultsTitle = document.querySelector("#nearby-results-title");
const nearbyCount = document.querySelector("#nearby-count");
const nearbyShowAll = document.querySelector("#nearby-show-all");
const onlineOrder = ["yes24", "ridi", "kyobo", "aladin", "bunjang", "cgv", "lottecinema", "megabox"];
const iconMarks = { cu: "CU", gs25: "GS", seven: "7", emart24: "24", cgv: "CGV", lottecinema: "롯데", megabox: "M", kyobo: "교보", aladin: "알라딘", artbox: "A", hottracks: "H", yes24: "24", ridi: "R", bunjang: "번개" };
let activeCategory = "전체";
let activeContext = {};
let nearbyMap = null;
let storeMarkers = null;

nearbyRecenter.addEventListener("click", () => {
  nearbyMap?.flyTo([demoLocation.lat, demoLocation.lng], 15);
});

function makeElement(tag, className, label) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (label) element.textContent = label;
  return element;
}

function makeMerchantIcon(merchant) {
  const icon = makeElement("span", `merchant-icon tone-${merchant.category}`, iconMarks[merchant.id] ?? merchant.name.slice(0, 2));
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function objectName(name) {
  const code = name.codePointAt(name.length - 1);
  const hasFinalConsonant = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return `${name}${hasFinalConsonant ? "을" : "를"}`;
}

function renderDetail(merchant, channel, context = {}) {
  usageDetail.replaceChildren();
  const selectedStore = channel === "오프라인" ? context.store : null;
  const identity = makeElement("div", "detail-identity");
  const identityCopy = makeElement("div", "detail-identity-copy");
  identityCopy.append(makeElement("small", "", `${merchant.category} · ${channel}`), makeElement("h3", "", merchant.name));
  identity.append(makeMerchantIcon(merchant), identityCopy);
  usageDetail.append(identity);

  if (selectedStore) {
    const storeInfo = makeElement("div", "detail-store");
    storeInfo.append(makeElement("strong", "", selectedStore.name));
    storeInfo.append(makeElement("small", "", `${selectedStore.address} · 직선 약 ${selectedStore.distanceMeters}m`));
    usageDetail.append(storeInfo);
  }

  if (merchant.channels.length > 1) {
    const channelGroup = makeElement("div", "channel-tabs");
    channelGroup.setAttribute("role", "group");
    channelGroup.setAttribute("aria-label", "사용 방식 선택");
    for (const option of merchant.channels) {
      const button = makeElement("button", option === channel ? "active" : "", option);
      button.type = "button";
      button.setAttribute("aria-pressed", String(option === channel));
      button.addEventListener("click", () => renderDetail(merchant, option, context));
      channelGroup.append(button);
    }
    usageDetail.append(channelGroup);
  }

  const cashQuestion = context.asksAboutCash && channel === "오프라인";
  const placeName = selectedStore?.name ?? merchant.name;
  usageDetail.append(makeElement("p", "detail-status", cashQuestion
    ? `${placeName}에서 컬쳐캐쉬 앱 바코드로 결제할 수 있어요.`
    : channel === "오프라인"
    ? `${placeName}에서 컬쳐랜드상품권을 사용할 수 있어요.`
    : `${merchant.name}에서 컬쳐캐쉬로 결제할 수 있어요.`));
  if (merchant.id === "aladin" && channel === "오프라인") {
    usageDetail.append(makeElement("p", "detail-note", "오프라인 사용처는 알라딘 중고매장입니다."));
  }

  usageDetail.append(makeElement("h4", "detail-subtitle", "이렇게 사용해요"));
  const steps = cashQuestion
    ? ["컬쳐랜드 앱에 로그인해요.", "홈 화면에서 바코드결제를 열어요.", `오프라인 제휴처에서 ${objectName(merchant.name)} 선택해요.`, "표시된 바코드를 매장 직원에게 보여줘요.", "직원이 바코드를 스캔하면 컬쳐캐쉬로 결제돼요."]
    : channel === "오프라인"
    ? ["상품권의 결제 잔액을 확인해요.", "매장에서 컬쳐랜드상품권 MMS 또는 바코드를 열어요.", "결제할 때 직원에게 바코드를 보여줘요.", "직원이 바코드를 스캔하면 결제가 완료돼요."]
    : ["컬쳐랜드상품권을 컬쳐캐쉬로 충전해요.", "홈 화면에서 바로사용을 열어요.", `${objectName(merchant.name)} 선택하고 컬쳐캐쉬 사용하기를 눌러요.`, "제휴사에서 상품을 고른 뒤 결제수단으로 컬쳐랜드 컬쳐캐쉬를 선택해요.", "컬쳐랜드 계정에 로그인하고 컬쳐캐쉬로 결제를 마쳐요."];
  const stepList = makeElement("ol", "usage-steps");
  for (const step of steps) stepList.append(makeElement("li", "", step));
  usageDetail.append(stepList);

  if (selectedStore) {
    const routeLink = makeElement("a", "detail-route-link");
    routeLink.href = `#route/${selectedStore.merchantId}`;
    routeLink.append(makeElement("strong", "", "길 안내 지도 보기"), makeElement("span", "", "›"));
    usageDetail.append(routeLink);
  }

  if (channel === "오프라인" && location.hash === "#use") {
    const nearbyLink = makeElement("a", "detail-nearby-link");
    nearbyLink.href = `#nearby/${merchant.id}`;
    const nearbyCopy = makeElement("span", "");
    nearbyCopy.append(makeElement("strong", "", "내 주변 매장 보기"));
    nearbyCopy.append(makeElement("small", "", `${merchant.name} 매장 위치와 거리를 확인해요`));
    nearbyLink.append(nearbyCopy, makeElement("span", "detail-nearby-arrow", "›"));
    usageDetail.append(nearbyLink);
  }

  if (channel === "오프라인") {
    const barcodeLink = makeElement("a", "barcode-open");
    barcodeLink.href = sources.cashBarcode;
    barcodeLink.setAttribute("aria-label", "컬쳐캐쉬 바코드 바로 열기");
    const barcodeIcon = makeElement("span", "barcode-open-icon");
    barcodeIcon.setAttribute("aria-hidden", "true");
    barcodeIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M18 5v14M21 5v14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    const barcodeCopy = makeElement("span", "barcode-open-copy");
    barcodeCopy.append(makeElement("strong", "", "바코드 바로 열기"));
    barcodeCopy.append(makeElement("small", "", "컬쳐캐쉬 앱 바코드 결제"));
    barcodeLink.append(barcodeIcon, barcodeCopy, makeElement("span", "barcode-open-arrow", "›"));
    usageDetail.append(barcodeLink);
  }
}

function openDetail(merchant, channel, context = {}) {
  renderDetail(merchant, channel, context);
  merchantDialog.showModal();
  document.body.classList.add("dialog-open");
}

document.querySelector("#detail-close").addEventListener("click", () => merchantDialog.close());
merchantDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
merchantDialog.addEventListener("click", (event) => {
  if (event.target === merchantDialog) merchantDialog.close();
});

function renderMerchantList(found, channel, container) {
  container.replaceChildren();
  if (!found.length) {
    container.append(makeElement("p", "merchant-empty", "일치하는 사용처가 없어요."));
    return;
  }
  for (const merchant of found) {
    const button = makeElement("button", channel === "온라인" ? "online-tile" : "offline-row");
    button.type = "button";
    if (channel === "온라인") {
      button.append(makeMerchantIcon(merchant), makeElement("span", "", merchant.name));
    } else {
      const copy = makeElement("span", "offline-row-copy");
      copy.append(makeElement("strong", "", merchant.name), makeElement("small", "", merchant.category));
      button.append(makeMerchantIcon(merchant), copy, makeElement("span", "offline-row-arrow", "›"));
    }
    button.addEventListener("click", () => openDetail(merchant, channel, activeContext));
    container.append(button);
  }
}

function renderNearbyList(stores) {
  nearbyList.replaceChildren();
  if (!stores.length) {
    nearbyList.append(makeElement("p", "merchant-empty", "표시할 매장이 없어요. 전체 매장을 살펴보세요."));
    return;
  }
  for (const store of stores) {
    const merchant = merchants.find((item) => item.id === store.merchantId);
    const button = makeElement("button", "offline-row nearby-row");
    button.type = "button";
    const copy = makeElement("span", "offline-row-copy");
    copy.append(makeElement("strong", "", store.name), makeElement("small", "", store.address));
    button.append(makeMerchantIcon(merchant), copy, makeElement("span", "nearby-distance", `약 ${store.distanceMeters}m`));
    button.addEventListener("click", () => openDetail(merchant, "오프라인", { store }));
    nearbyList.append(button);
  }
}

function renderNearbyMap(stores) {
  mapCaption.textContent = stores.length ? "파란 점은 내 위치, 빨간 핀은 매장이에요. 핀을 눌러 안내를 보세요." : "표시할 매장이 없어요.";
  if (!window.L) {
    nearbyMapElement.hidden = true;
    nearbyRecenter.hidden = true;
    mapFallback.hidden = false;
    return;
  }
  nearbyMapElement.hidden = false;
  nearbyRecenter.hidden = false;
  mapFallback.hidden = true;
  if (!nearbyMap) {
    nearbyMap = window.L.map(nearbyMapElement, { scrollWheelZoom: false }).setView([demoLocation.lat, demoLocation.lng], 15);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(nearbyMap);
    window.L.circleMarker([demoLocation.lat, demoLocation.lng], {
      radius: 8, color: "#fff", weight: 3, fillColor: "#3578db", fillOpacity: 1,
    }).addTo(nearbyMap).bindTooltip("내 위치");
    storeMarkers = window.L.layerGroup().addTo(nearbyMap);
  }
  storeMarkers.clearLayers();
  const locations = new Map();
  for (const store of stores) {
    const key = `${store.lat},${store.lng}`;
    if (!locations.has(key)) locations.set(key, []);
    locations.get(key).push(store);
  }
  for (const group of locations.values()) {
    const first = group[0];
    const marker = window.L.marker([first.lat, first.lng], {
      icon: window.L.divIcon({
        className: "store-map-marker",
        html: `<span>${group.length}</span>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      }),
      title: group.length === 1 ? first.name : `${first.area} 매장 ${group.length}곳`,
    }).addTo(storeMarkers);
    if (group.length === 1) {
      marker.on("click", () => openDetail(merchants.find((item) => item.id === first.merchantId), "오프라인", { store: first }));
    } else {
      const popup = makeElement("div", "map-store-popup");
      popup.append(makeElement("strong", "", `${first.area} 매장 ${group.length}곳`));
      for (const store of group) {
        const button = makeElement("button", "", store.name);
        button.type = "button";
        button.addEventListener("click", () => openDetail(merchants.find((item) => item.id === store.merchantId), "오프라인", { store }));
        popup.append(button);
      }
      marker.bindPopup(popup);
    }
  }
  requestAnimationFrame(() => {
    nearbyMap.invalidateSize();
    const bounds = window.L.latLngBounds([[demoLocation.lat, demoLocation.lng], ...stores.map((store) => [store.lat, store.lng])]);
    nearbyMap.fitBounds(bounds, { padding: [25, 25], maxZoom: 16 });
  });
}

function renderNearbyPage() {
  const merchantId = location.hash.split("/")[1];
  const selected = merchants.find((merchant) => merchant.id === merchantId && merchant.channels.includes("오프라인"));
  const offline = selected ? [selected] : merchants.filter((merchant) => merchant.channels.includes("오프라인"));
  const stores = findNearbyStores(offline);
  nearbyResultsTitle.textContent = selected ? `${selected.name} 매장` : "주변 매장";
  nearbyCount.textContent = `${stores.length}곳`;
  nearbyShowAll.hidden = !selected;
  renderNearbyList(stores);
  renderNearbyMap(stores);
}

function updateListings() {
  const query = searchInput.value.trim();
  const context = query ? understandQuestion(query) : {};
  const direct = query ? searchMerchants(query) : merchants;
  let found = direct.length ? direct : context.merchants?.length ? context.merchants
    : context.category ? searchMerchants("", context.category) : [];
  if (activeCategory !== "전체") found = found.filter((merchant) => merchant.category === activeCategory);
  activeContext = context;
  const online = found.filter((merchant) => merchant.channels.includes("온라인"))
    .sort((a, b) => onlineOrder.indexOf(a.id) - onlineOrder.indexOf(b.id));
  const offline = found.filter((merchant) => merchant.channels.includes("오프라인"));
  renderMerchantList(online, "온라인", onlineMerchants);
  renderMerchantList(offline, "오프라인", offlineMerchants);
  document.querySelector("#online-count").textContent = `${online.length}곳`;
  document.querySelector("#offline-count").textContent = `${offline.length}곳`;
  searchFeedback.hidden = !query || found.length > 0;
  if (query && !found.length) {
    searchFeedback.textContent = "검색 결과가 없어요. 다른 이름이나 카테고리로 검색해 보세요.";
  }
  return { found, context };
}

for (const category of categories) {
  const chip = makeElement("button", "category-chip", category);
  chip.type = "button";
  chip.setAttribute("aria-pressed", String(category === "전체"));
  chip.addEventListener("click", () => {
    activeCategory = category;
    searchInput.value = "";
    for (const button of categoryChips.children) {
      const selected = button === chip;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    updateListings();
  });
  if (category === "전체") chip.classList.add("active");
  categoryChips.append(chip);
}

searchInput.addEventListener("input", updateListings);
document.querySelector("#merchant-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const { found, context } = updateListings();
  if (found.length === 1) {
    const merchant = found[0];
    const query = searchInput.value;
    const preferred = query.includes("온라인") && merchant.channels.includes("온라인") ? "온라인"
      : query.includes("오프라인") && merchant.channels.includes("오프라인") ? "오프라인"
      : merchant.channels[0];
    openDetail(merchant, preferred, context);
  }
});
updateListings();
renderView();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
