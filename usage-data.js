export const sources = {
  offline: "https://m.cultureland.co.kr/vchr/culturevoucherUse.do",
  online: "https://m.cultureland.co.kr/shp/shpMain.do",
  cashBarcode: "https://m.cultureland.co.kr/tgl/barcodeBrandList.do",
  exceptions: "https://www.cultureland.co.kr/voucher/voucheruse.do",
};

export const categories = ["전체", "편의점", "영화", "도서", "문구", "쇼핑", "콘텐츠"];

export const merchants = [
  { id: "cu", name: "CU", aliases: ["씨유"], category: "편의점", channels: ["오프라인"] },
  { id: "gs25", name: "GS25", aliases: ["지에스25"], category: "편의점", channels: ["오프라인"] },
  { id: "seven", name: "세븐일레븐", aliases: ["7-eleven", "7일레븐"], category: "편의점", channels: ["오프라인"] },
  { id: "emart24", name: "이마트24", aliases: ["emart24"], category: "편의점", channels: ["오프라인"] },
  { id: "cgv", name: "CGV", aliases: ["씨지브이"], category: "영화", channels: ["오프라인", "온라인"] },
  { id: "lottecinema", name: "롯데시네마", aliases: [], category: "영화", channels: ["오프라인", "온라인"] },
  { id: "megabox", name: "메가박스", aliases: [], category: "영화", channels: ["오프라인", "온라인"] },
  { id: "kyobo", name: "교보문고", aliases: ["교보"], category: "도서", channels: ["오프라인", "온라인"] },
  { id: "aladin", name: "알라딘", aliases: ["알라딘 중고매장"], category: "도서", channels: ["오프라인", "온라인"] },
  { id: "artbox", name: "아트박스", aliases: [], category: "문구", channels: ["오프라인"] },
  { id: "hottracks", name: "핫트랙스", aliases: ["핫트렉스"], category: "문구", channels: ["오프라인"] },
  { id: "yes24", name: "yes24", aliases: ["예스24"], category: "도서", channels: ["온라인"] },
  { id: "ridi", name: "리디북스", aliases: ["리디", "ridi"], category: "콘텐츠", channels: ["온라인"] },
  { id: "bunjang", name: "번개장터", aliases: ["번장"], category: "쇼핑", channels: ["온라인"] },
];

export function normalize(value) {
  return value.toLocaleLowerCase("ko-KR").replace(/[^\p{L}\p{N}]/gu, "");
}

export function searchMerchants(name, category = "전체") {
  const query = normalize(name.trim());
  return merchants.filter((merchant) => {
    if (category !== "전체" && merchant.category !== category) return false;
    if (!query) return true;
    return [merchant.name, ...merchant.aliases].some((alias) => normalize(alias).includes(query));
  });
}

export function understandQuestion(question) {
  const query = normalize(question);
  const named = merchants.filter((merchant) =>
    [merchant.name, ...merchant.aliases].some((alias) =>
      normalize(alias) === "cu" ? /(^|[^a-z0-9])cu($|[^a-z0-9])/i.test(question) : query.includes(normalize(alias))
    )
  );
  const categoryWords = {
    편의점: ["편의점"], 영화: ["영화관", "극장", "영화"], 도서: ["서점", "도서", "책"],
    문구: ["문구점", "문구"], 쇼핑: ["쇼핑"], 콘텐츠: ["웹툰", "콘텐츠"],
  };
  const category = Object.entries(categoryWords).find(([, words]) =>
    words.some((word) => query.includes(normalize(word)))
  )?.[0] ?? null;
  const itemSpecific = ["담배", "주류", "술", "택배", "교통카드", "로또", "특정매장", "지점", "다른상품권"].some((word) => query.includes(normalize(word)));
  const asksAboutCash = query.includes("컬쳐캐쉬") || query.includes("앱바코드");
  return { merchants: named, category, itemSpecific, asksAboutCash };
}
