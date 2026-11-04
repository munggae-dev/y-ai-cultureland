// 공개 매장·주소 자료를 2026-11-04 확인했다. 좌표는 매장 또는 건물 위치이며 출입구 위치와 다를 수 있다.
export const demoLocation = { name: "영등포역", lat: 37.51556, lng: 126.90778 };

export const nearbyStores = [
  {
    merchantId: "gs25", name: "GS25 영등포본점", address: "서울 영등포구 경인로 849", area: "영등포역 인근",
    lat: 37.5168, lng: 126.906998,
    sourceUrl: "https://place.clariosync.com/p/1062085/gs25-%EC%98%81%EB%93%B1%ED%8F%AC%EB%B3%B8%EC%A0%90",
  },
  {
    merchantId: "cu", name: "CU 영등포마사회점", address: "서울 영등포구 영중로8길 14, 101호", area: "영등포역 인근",
    lat: 37.51816829, lng: 126.90702029,
    sourceUrl: "https://place.clariosync.com/p/1062403/cu-%EC%98%81%EB%93%B1%ED%8F%AC%EB%A7%88%EC%82%AC%ED%9A%8C%EC%A0%90",
  },
  {
    merchantId: "emart24", name: "이마트24 영등포메인점", address: "서울 영등포구 영등포로46길 3-1, 1층", area: "영등포역 인근",
    lat: 37.518898, lng: 126.907959,
    sourceUrl: "https://place.clariosync.com/p/1017691/%EC%9D%B4%EB%A7%88%ED%8A%B824-%EC%98%81%EB%93%B1%ED%8F%AC%EB%A9%94%EC%9D%B8%EC%A0%90",
  },
  {
    merchantId: "artbox", name: "아트박스 영등포타임스퀘어점", address: "서울 영등포구 영중로 15, 타임스퀘어 B2F", area: "타임스퀘어",
    lat: 37.5172058, lng: 126.903714,
    sourceUrl: "https://company.artbox.kr/OfflineStore.asp",
  },
  {
    merchantId: "kyobo", name: "교보문고 영등포점", address: "서울 영등포구 영중로 15, 타임스퀘어 2층", area: "타임스퀘어",
    lat: 37.5172058, lng: 126.903714,
    sourceUrl: "https://store.kyobobook.co.kr/store-info/036",
  },
  {
    merchantId: "cgv", name: "CGV 영등포타임스퀘어", address: "서울 영등포구 영중로 15, 타임스퀘어 4~8층", area: "타임스퀘어",
    lat: 37.5172058, lng: 126.903714,
    sourceUrl: "https://cgv.co.kr/cnm/bzplcCgv/0059001",
  },
  {
    merchantId: "hottracks", name: "핫트랙스 영등포점", address: "서울 영등포구 영중로 15, 타임스퀘어 2층", area: "타임스퀘어",
    lat: 37.5172058, lng: 126.903714,
    sourceUrl: "https://korean.visitseoul.net/shopping/%ED%95%AB%ED%8A%B8%EB%9E%99%EC%8A%A4-%ED%83%80%EC%9E%84%EC%8A%A4%ED%80%98%EC%96%B4%EC%A0%90/KOP012709",
  },
];

export function distanceMeters(from, to) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const latitude1 = toRadians(from.lat);
  const latitude2 = toRadians(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(dLng / 2) ** 2;
  return Math.round((6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) / 10) * 10;
}

export function findNearbyStores(availableMerchants) {
  const availableIds = new Set(availableMerchants.map((merchant) => merchant.id));
  return nearbyStores
    .filter((store) => availableIds.has(store.merchantId))
    .map((store) => ({ ...store, distanceMeters: distanceMeters(demoLocation, store) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
