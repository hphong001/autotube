# AI BASE LAB 사이트 개편 — 배포 안내 (2026-10-10, 2차)

순서대로 진행하세요. 1번(Apps Script)을 먼저 하면 중간에 문의가 와도 끊기지 않습니다.

## 1. Apps Script 교체 → 새 버전 배포 (먼저)
`DO_NOT_UPLOAD_apps_script/Code.gs` 는 **깃허브에 올리지 않습니다.**
1. script.google.com 에서 기존 프로젝트를 열고 `Code.gs` 전체를 이 파일 내용으로 교체 → 저장
2. 배포 → 배포 관리 → 기존 배포 편집(연필) → 버전: **새 버전** → 배포
   (웹앱 주소가 그대로 유지되어야 합니다. "새 배포"를 만들면 주소가 바뀌니 주의)

바뀐 점: 중국어 문의 자동 회신, 문의 메일 하단 "접속 정보" 섹션과 빨간 ⚠ 주의 문구, 시트에 접속 정보 열 추가

## 2. 옛 파일 삭제 (지난번 압축을 이미 배포했다면 건너뜀)
아래 파일은 같은 이름의 폴더로 대체되었으니 **삭제**하세요.
`about.html` `cases.html` `technology.html` `hardware-control.html` `vision-inspection.html`
`finance-ai.html` `autotube-case.html` `privacy.html`
`en/about.html` `en/cases.html` `en/privacy-policy.html` `cn/privacy-policy.html`

권장: 저장소의 `gas/` 폴더도 삭제 (공개 주소로 열려 있고 사이트에 필요 없음)

## 3. 압축 파일 업로드
`DEPLOY_GUIDE.md` 와 `DO_NOT_UPLOAD_apps_script/` 를 **제외한** 나머지를 폴더 구조 그대로 저장소 루트에 올립니다.

새로 추가된 것
- `functions/api/contact.js` — Cloudflare가 자동 인식하는 문의 중계 파일. **반드시 저장소 루트의 `functions/api/` 안**에 있어야 합니다.
  ```
  (저장소 루트)
  ├─ index.html
  ├─ functions/
  │   └─ api/
  │       └─ contact.js
  ```
- `js/main.js` — 문의를 `/api/contact` 로 보냄. 중계가 안 되면 자동으로 Apps Script에 직접 보냄(문의 누락 방지)

## 4. 배포 후 확인
1. Cloudflare 대시보드 → Workers & Pages → 이 사이트 → 최근 배포 → **Functions** 탭에 `/api/contact` 가 보이는지
2. 브라우저에서 https://aibaselab.com/api/contact 를 열면 `method not allowed` 문구가 보이면 정상
3. 세 언어 메인에서 문의 폼 테스트 1건씩 → 받은 메일 하단에 "접속 정보"가 나오는지
4. 상단 메뉴 "홈", 메인 이미지 전체 표시, 선택 목록 색상 확인
5. Google Search Console → Sitemaps 에서 `sitemap.xml` 다시 제출
