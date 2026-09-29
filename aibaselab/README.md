# AI BASE LAB 홈페이지 — 1차 완성본

## 파일 구조
| 파일 | 내용 |
|---|---|
| `index.html` | 메인 (히어로, 핵심 기술, 사례 4건, 진행 방식, 문의 폼) |
| `technology.html` | 메뉴 ‘핵심 기술’ — 4개 기술 상세 (`#automation` `#monitoring` `#finance` `#vision`) |
| `cases.html` | 메뉴 ‘솔루션 사례’ — 사례 목록 |
| `autotube.html` | 사례 1: 유튜브 영상 제작 자동화 (오토튜브) |
| `hardware-control.html` | 사례 2: 음향기기 생산라인 이기종 장비 연동 검사 |
| `finance-ai.html` | 사례 3: 키움증권 국내·미국 자동매매 |
| `vision-inspection.html` | 사례 4: 식품 공장 비전 AI 불량 검사·생산 카운팅 (기존 interactive-ai.html 대체) |
| `infrastructure.html` | 메뉴 ‘인프라 현황’ |
| `about.html` | 메뉴 ‘기업 소개’ |
| `privacy.html` | 개인정보처리방침 (문의 폼 동의 항목과 연결) |
| `404.html` | 없는 주소로 들어왔을 때 표시 (GitHub Pages가 자동 사용) |
| `css/style.css`, `js/main.js` | 모든 페이지 공통 스타일·스크립트 |
| `sitemap.xml`, `robots.txt` | 검색엔진용 |
| `gas/` | 문의 폼 메일 전송용 Google Apps Script + 설정 방법 |
| `IMAGE_PROMPTS.md` | 이미지 23장 파일명·크기·생성 프롬프트 |

헤더와 푸터는 모든 페이지에 똑같이 들어 있습니다. 메뉴나 푸터를 고칠 때는 **모든 HTML 파일에서 같은 부분을 함께 수정**해야 합니다(에디터의 ‘모든 파일에서 바꾸기’ 기능 권장).

## 직접 채워야 할 곳 (`[입력필요]`로 검색)
- 모든 페이지 푸터: 대표자명, 사업자등록번호, 통신판매업 신고번호, 주소
- `about.html`: 대표자명(인사말 서명, 회사 정보 표), **연혁 연도**(추정값이니 반드시 확인)
- `privacy.html`: 개인정보 보호책임자 성명

## 배포 후 할 일
1. **문의 폼 연결**: `gas/README_문의폼_설정.md` 순서대로 진행 → `js/main.js`의 `FORM_ENDPOINT`에 URL 입력
2. **Google Search Console** 등록 → 모든 HTML의 `google-site-verification` 줄 주석 해제 후 코드 입력 → `sitemap.xml` 제출
3. **네이버 서치어드바이저** 등록 → `naver-site-verification` 코드 입력 → 사이트맵 제출 (한국 검색 유입에 중요)
4. **GA4**(선택): 측정 ID 발급 후 각 HTML의 GA4 주석을 해제하고 `G-XXXXXXXXXX`를 교체
5. 사이트 주소가 `https://aibaselab.com/`이 아니라면 모든 HTML의 canonical·og:url, `sitemap.xml`, `robots.txt` 주소를 바꿔야 합니다

## SEO 적용 내용
- 페이지별 고유 title·description, canonical, Open Graph·트위터 카드
- 구조화 데이터(JSON-LD): Organization, WebSite, BreadcrumbList, Article, FAQPage, ItemList, SoftwareApplication
- 모든 이동은 `<a href>` 링크로 처리(검색엔진이 따라갈 수 있음), 페이지마다 h1 1개
- 이미지 alt 설명, width/height 지정(레이아웃 흔들림 방지), 첫 화면 외 이미지는 지연 로딩
- 폰트는 필요한 글자만 내려받는 Pretendard 서브셋, 아이콘은 인라인 SVG(아이콘 폰트 제거)
- 모바일은 280px 폭까지 가로 넘침 없음을 확인했습니다
