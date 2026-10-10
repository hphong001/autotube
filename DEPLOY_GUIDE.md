# AI BASE LAB 사이트 개편 — 배포 안내 (2026-10-10)

## 1. 올리기 전에
기존 저장소 전체를 백업해 두세요.

## 2. 먼저 삭제할 파일 (중요)
폴더 구조로 바뀌면서 아래 파일은 같은 이름의 폴더(`about/index.html` 등)로 대체됩니다.
옛 파일이 남아 있으면 주소가 충돌하므로 **반드시 삭제**하세요.

- `about.html`
- `cases.html`
- `technology.html`
- `hardware-control.html`
- `vision-inspection.html`
- `finance-ai.html`
- `autotube-case.html`
- `privacy.html`
- `en/about.html`
- `en/cases.html`
- `en/privacy-policy.html`
- `cn/privacy-policy.html`

`cn/about/index.html`, `cn/cases/index.html`, `cn/index.html`, `en/index.html`, `index.html`, `404.html`은 덮어쓰기됩니다.

## 3. 압축 파일 내용 업로드
압축을 풀고 폴더 구조 그대로 저장소 루트에 올리세요. 이 안내 파일(`배포안내.md`)은 올리지 않아도 됩니다.

| 경로 | 내용 |
|---|---|
| `index.html`, `en/`, `cn/` | 언어별 메인·사례·소개·개인정보처리방침 (새로 작성) |
| `about/` `cases/` `technology/` `hardware-control/` `vision-inspection/` `finance-ai/` `autotube-case/` `privacy/` | 한국어 하위 페이지 (폴더 구조, 링크·머리말 정리) |
| `css/style.css` | 새 섹션 스타일 + 모바일 개선 (PC 기존 화면은 유지) |
| `image/hero-slide-2.webp` | 7MB → 약 80KB로 축소 |
| `_redirects` | 예전 `.html` 주소 → 새 폴더 주소 301 이동 추가 |
| `sitemap.xml` | 새 주소(끝에 `/`)와 언어 연결 정보 |
| `gas/Code.gs` | 중국어 문의 시 중국어 자동 회신 추가 |

손대지 않은 파일: `js/main.js`, `autotube/` 폴더, `stock.html`, `thankyou.html`, 루트의 그림 파일 등.

## 4. Apps Script 다시 배포 (중국어 자동 회신)
지금은 중국어 문의자에게 **한국어** 접수 메일이 갑니다.
1. script.google.com 에서 기존 프로젝트를 열고 `gas/Code.gs` 내용으로 교체
2. 배포 → 배포 관리 → 기존 배포 편집(연필) → 버전: **새 버전** → 배포
   (이렇게 하면 웹앱 주소가 바뀌지 않아 `js/main.js` 수정이 필요 없습니다)

## 5. 배포 후 확인
- https://aibaselab.com/about 접속 시 `/about/` 로 이동하는지
- https://aibaselab.com/about.html 접속 시 `/about/` 로 이동하는지
- 세 언어 메인에서 문의 폼 테스트 1건씩
- Google Search Console → Sitemaps 에서 `sitemap.xml` 다시 제출
- (권장) 네이버 서치어드바이저에 사이트 등록 + sitemap 제출
