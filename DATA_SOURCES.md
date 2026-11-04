# 사용처 데이터 범위

확인일: 2026-11-04. 이 시제품은 전체 제휴처 목록이 아니라 대표 브랜드 14개만 담는다.

- [컬쳐랜드 모바일 상품권 사용 안내](https://m.cultureland.co.kr/vchr/culturevoucherUse.do): 오프라인 바코드 브랜드와 상품권 잔액 확인, MMS/바코드 제시 순서.
- [컬쳐랜드 바로사용 목록](https://m.cultureland.co.kr/shp/shpMain.do): 온라인 제휴사와 제휴사 선택 경로.
- [컬쳐랜드 사용처 안내](https://www.cultureland.co.kr/voucher/voucheruse.do): 일부 매장 제외 가능성과 매장별 확인 필요.
- [컬쳐랜드상품권 도움말](https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=1&class2=1): 오프라인 전용 상품권의 알라딘 중고매장 범위 등 상품권 종류별 차이.
- [컬쳐캐쉬 이용 도움말](https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=2&class2=7): 앱 바코드 결제 경로.

표시된 "사용처"는 브랜드 단위의 공식 안내를 뜻한다. 특정 지점, 상품, 상품권 종류, 현재 서비스 상태의 결제 성공을 보장하지 않는다. 질문 입력은 로컬 키워드 매칭이며 AI 모델이나 실시간 제휴처 API를 호출하지 않는다. 미등록 브랜드를 사용 불가로 표시하지 않는다.

현재 화면은 메이커톤 시연 조건에 따라 표시된 브랜드와 지점의 사용 가능 정보가 확인된 것으로 안내한다. 이는 시연 가정이며, 실제 지점별 결제 가능 여부를 검증한 근거는 아니다.

오프라인 사용 안내의 `바코드 바로 열기`는 홈의 바코드 결제와 같은 컬쳐캐쉬 앱 바코드 경로(`/tgl/barcodeBrandList.do`)로 이동한다. 비로그인 상태에서는 로그인 화면으로 이동한다. 문자로 받은 컬쳐랜드상품권 MMS 바코드와는 별개의 결제 수단이다.

## 영등포역 주변 매장과 지도

`nearby-data.js`에는 2026-11-04 공개 자료에서 이름과 주소를 확인한 매장 7곳을 담았다. 편의점 3곳은 지방행정 인허가 자료를 재게시한 [GS25 영등포본점](https://place.clariosync.com/p/1062085/gs25-%EC%98%81%EB%93%B1%ED%8F%AC%EB%B3%B8%EC%A0%90), [CU 영등포마사회점](https://place.clariosync.com/p/1062403/cu-%EC%98%81%EB%93%B1%ED%8F%AC%EB%A7%88%EC%82%AC%ED%9A%8C%EC%A0%90), [이마트24 영등포메인점](https://place.clariosync.com/p/1017691/%EC%9D%B4%EB%A7%88%ED%8A%B824-%EC%98%81%EB%93%B1%ED%8F%AC%EB%A9%94%EC%9D%B8%EC%A0%90)을 참고했다. 타임스퀘어 4곳은 [아트박스 공식 매장 목록](https://company.artbox.kr/OfflineStore.asp), [교보문고 매장 안내](https://store.kyobobook.co.kr/store-info/036), [CGV 극장 안내](https://cgv.co.kr/cnm/bzplcCgv/0059001), [서울관광재단 핫트랙스 안내](https://korean.visitseoul.net/shopping/%ED%95%AB%ED%8A%B8%EB%9E%99%EC%8A%A4-%ED%83%80%EC%9E%84%EC%8A%A4%ED%80%98%EC%96%B4%EC%A0%90/KOP012709)를 참고했다.

영등포역 기준점은 [공개 역 좌표](https://www.findlatlng.org/place/yeongdeungpo-metro), 매장 핀은 [GS25 좌표](https://creatrip.com/en/spot/9843), [CU 입점 건물 좌표](https://tmh.purpleo.kr/article/17883), [이마트24 좌표](https://sem.purpleo.co.kr/view/4779), 아트박스 공식 목록의 타임스퀘어 건물 좌표를 사용한다. 거리는 이 좌표 사이의 직선거리이며 10m 단위로 반올림했다. 도보 거리나 매장 출입구 위치를 뜻하지 않는다. 지도는 Leaflet과 OpenStreetMap 타일을 사용하므로 온라인 연결이 필요하다.

내 주변 매장 목록은 실제 사용자 위치를 읽지 않고 영등포역에 있다고 가정한다. 이 목록은 지역 전체 매장을 망라하지 않으며 실시간 영업 상태, 지점별 컬쳐랜드 결제 가능 여부를 확인하지 않는다.

## 지도 길안내

`walking-routes.js`의 4개 도보 경로는 2026-11-04 [Valhalla 공개 경로 서버](https://valhalla1.openstreetmap.de/)의 OpenStreetMap 보행 경로를 사용해 수집했다. 출발점은 OpenStreetMap의 [영등포역 3번 출구](https://www.openstreetmap.org/node/8211568112) 또는 [5번 출구](https://www.openstreetmap.org/node/3404991290)다. 7개 매장은 편의점 3개와 타임스퀘어 공통 경로로 연결된다. 갱신은 `node scripts/fetch-walking-routes.mjs`로 수행한다.

경로 끝점은 매장 또는 타임스퀘어 건물 좌표에 매칭된 보행로다. 타임스퀘어 내부 층별 경로는 포함하지 않는다. 지도 길안내는 영등포역 출구에서 선택한 매장까지의 경로를 표시한다. 위치 권한을 허용하면 실제 사용자 위치를 파란 마커로 표시하고, 사용자가 표시된 경로 근처에 있을 때 남은 구간과 안내 단계를 갱신한다. 위치를 확인할 수 없으면 영등포역 기준 위치를 별도로 표시한다. 현재 위치에서 새 경로를 계산하지는 않는다.
