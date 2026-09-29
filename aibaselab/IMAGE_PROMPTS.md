# AI BASE LAB 이미지 제작 가이드 (23장)

모든 이미지는 `image/` 폴더에 **아래 파일명 그대로** 넣으면 적용됩니다. 지금은 같은 이름의 임시 이미지(파일명이 적힌 회색 이미지)가 들어 있습니다.

## 공통 규칙
| 항목 | 기준 |
|---|---|
| 형식 | **WebP**, 품질 80~85 (PNG로 생성했다면 [squoosh.app](https://squoosh.app)에서 변환하거나 `cwebp -q 82 in.png -o out.webp`) |
| 크기 | 표에 적힌 픽셀로 자르거나 줄이기. 비율이 가장 중요합니다(16:10 / 16:9 / 4:3) |
| 용량 | 1600px 이미지는 250KB 이하, 1200px 이미지는 150KB 이하 |
| 사진 속 글자 | 현장 사진에는 **글자·로고를 넣지 않습니다.** AI가 만든 글자는 깨지기 쉬워 신뢰도를 떨어뜨립니다 |
| 화면(GUI) 이미지 | **실제 프로그램 스크린샷이 가장 좋습니다.** AI로 만들 때는 프롬프트에 적은 짧은 영문 라벨만 쓰도록 지시합니다(Gemini Nano Banana Pro 권장) |
| 인물 | 한국인, 자연스러운 업무 중 모습, 카메라를 보지 않음 |

프롬프트 끝에 아래 **공통 스타일 문구**를 붙여 쓰면 전체 톤이 통일됩니다.
- 사진용: `photorealistic editorial photograph, shot on full-frame camera with 35mm lens, natural soft lighting, shallow depth of field, realistic textures and imperfections, muted cool color grading with subtle cyan accents, no text, no letters, no logos, no watermark`
- 화면용: `clean modern dark-theme software UI, navy background #0b1121, cyan #00e5ff and green #22c55e accents, crisp sharp legible text, flat screenshot, no device frame, no perspective`

> 이미 만든 `og-default.jpg`(링크 공유 이미지), `logo-512.png`, `apple-touch-icon.png`, `favicon`은 코드로 직접 만들어 두었으므로 따로 만들 필요가 없습니다.

---

## 1. 메인 페이지 (index.html) — 히어로 슬라이드 3장

### hero-slide-1.webp — 1600×1000 (16:10)
- 위치: 메인 첫 화면 슬라이드 1 (이기종 장비 연동 · 실시간 관제)
```
A Korean male engineer in his 40s wearing a navy work jacket stands in a modern factory control room, looking at a large wall of monitors showing abstract production line dashboards with charts and green status indicators (content softly out of focus, no readable text). Through a glass window behind him, an electronics assembly line is visible. Evening, cool blue ambient light mixed with warm screen glow. Wide composition with the person on the left third, empty space on the right.
```

### hero-slide-2.webp — 1600×1000 (16:10)
- 위치: 메인 슬라이드 2 (비전 AI 불량 검사 · 생산 카운팅)
```
Close-up of a stainless steel food packaging conveyor belt carrying rows of small sealed sauce pouches. An industrial machine vision camera with a black lens and a white LED bar light is mounted above the belt inside an open aluminum-frame inspection booth. Motion blur on the moving pouches, the camera sharp in focus. Clean hygienic factory, white and stainless tones, subtle cyan light reflection. Low angle, dynamic diagonal composition.
```

### hero-slide-3.webp — 1600×1000 (16:10)
- 위치: 메인 슬라이드 3 (AI 콘텐츠 제작 자동화)
```
A bright, modern small content production studio in Seoul. A Korean woman in her early 30s sits at a desk with two monitors, reviewing a video editing timeline with thumbnails of illustrated scenes and an audio waveform (screen content abstract, no readable text). A condenser microphone, headphones and a notebook on the desk. Large window with soft daylight, plants, minimal Scandinavian interior. Over-the-shoulder angle.
```

---

## 2. 사례 대표 이미지 4장
각 사례 페이지의 맨 위, 메인·사례 목록의 카드 썸네일, SNS 공유 이미지로 함께 쓰입니다. **가장 중요한 이미지들입니다.**

### case-autotube-hero.webp — 1600×900 (16:9)
```
Wide shot of a Korean educational content production office: three editors at separate desks with dual monitors, each screen showing a video production tool with a grid of illustrated cartoon-style scene thumbnails and audio waveforms (abstract, no readable text). Warm wood desks, acoustic foam panels on one wall, a large wall calendar. Late afternoon light, calm focused atmosphere. Eye-level, slightly wide angle.
```

### case-hardware-hero.webp — 1600×900 (16:9)
```
End-of-line audio testing station in an electronics factory producing Bluetooth speakers and soundbars. A female factory worker in a light blue uniform and cap scans a barcode on a portable Bluetooth speaker with a handheld scanner, next to a small grey acoustic test chamber with an open lid and a measurement microphone inside. A monitor on an articulating arm shows a large green "PASS" style indicator shape (no readable text). Rows of finished speakers on a conveyor in the background, bright industrial LED lighting. Chinese factory setting, realistic.
```

### case-finance-hero.webp — 1600×900 (16:9)
```
A professional trading desk at night in a Seoul high-rise office. Six monitors arranged in two rows display candlestick charts, order book ladders and line charts in dark theme (abstract, numbers not legible). A Korean man in his 30s in a casual shirt leans back with a coffee mug, calmly watching, not stressed. City lights bokeh through a floor-to-ceiling window. Deep navy and cyan color palette, cinematic lighting.
```

### case-vision-hero.webp — 1600×900 (16:9)
```
Food factory packaging line producing small sauce pouches. An enclosed machine vision inspection booth made of aluminum profile and transparent polycarbonate panels sits over the conveyor, with two industrial cameras and bright LED bar lights inside. A small air-blow reject chute on the side. A worker in white hygiene uniform, hairnet and mask checks a touchscreen monitor beside the booth (screen abstract). Clean, white, stainless steel environment, bright even lighting.
```

---

## 3. 오토튜브 사례 (autotube.html)

### autotube-script-grid.webp — 1600×900 (16:9)
- **권장: 오토튜브 Pro 실제 화면 캡처** (대본 그리드 탭, 컷 썸네일이 채워진 상태)
- AI로 만들 경우:
```
Desktop application screenshot of a video automation tool, dark navy theme. Left sidebar with menu items "Script", "Images", "Voice", "Subtitles", "Export". Main area: a data grid table with columns "Cut", "Dialogue", "Image Prompt", "Image", "Voice", "Status". 8 rows, each with a small colorful cartoon illustration thumbnail in the Image column, a small waveform icon in Voice, and green "Done" badges in Status. Top toolbar with buttons "Import Excel", "Generate Images", "Record All", "Build Project". Progress bar at bottom "32 / 68 cuts".
```

### autotube-tts-editor.webp — 1200×900 (4:3)
- **권장: 오토튜브 Pro 음성 녹음 탭 실제 캡처**
- AI로 만들 경우:
```
Desktop application screenshot, dark navy theme, audio editor panel. A list of sentences on the left, one highlighted in cyan. Center: a large cyan audio waveform with start and end trim handles and a playhead line. Buttons below: "Play", "Re-record", "Normalize", "Apply". Small labels "Peak -1.0 dB", "Silence 0.3s".
```

### autotube-studio.webp — 1200×900 (4:3)
```
A Korean male video editor in his late 20s wearing headphones around his neck, reviewing a CapCut-style video editing timeline on a large monitor (abstract timeline tracks with colorful image clips, audio and subtitle tracks, no readable text). Cozy small office, desk lamp, warm light, over-the-shoulder view.
```

---

## 4. 장비 연동 사례 (hardware-control.html)

### hardware-dashboard.webp — 1600×900 (16:9)
```
Industrial monitoring dashboard screenshot, dark navy theme, four equal panels titled "LINE 1", "LINE 2", "LINE 3", "LINE 4". Each panel shows: a large number for pass rate like "99.2%", a small tact time value "34s", a mini line chart, and a row of 7 small device status dots labeled "AP", "PSU", "BT", "PLC", "SCAN", "PRINT", "TEMP" (6 green, one amber in LINE 3). Right sidebar "Recent Results" list with serial numbers like "SP24-018231 PASS" in green and one "FAIL" in red. Top bar title "EOL Test Monitor".
```

### hardware-test-station.webp — 1200×900 (4:3)
```
Close-up of a small grey acoustic test box with the lid open, lined with pyramid foam. A black portable Bluetooth speaker is clamped in a pneumatic fixture, a measurement microphone on a small arm points at the speaker grille. Cables exit through a sealed port. Factory workbench, anti-static mat, sharp focus, industrial lighting.
```

### hardware-rack.webp — 1200×900 (4:3)
```
The lower shelf rack of a production test station: a benchtop audio analyzer, a programmable DC power supply with glowing digital display, a compact PLC module with blinking LEDs, a USB hub and neatly routed labeled cables with velcro ties. Photographed at a slight angle, shallow depth of field, realistic electronics lab look, no brand names visible.
```

---

## 5. 자동매매 사례 (finance-ai.html)

### finance-dashboard.webp — 1600×900 (16:9)
- **권장: 직접 만든 키움 모니터링 프로그램 실제 화면 캡처** (계좌번호·잔고는 모자이크)
- AI로 만들 경우:
```
Trading monitoring software screenshot, dark navy theme. Top bar with tabs "KR Market" and "US Market" and a small "USD/KRW 1,382.5" display. Left: a holdings table with columns "Symbol", "Qty", "Avg", "Price", "P/L %" showing 6 rows with green and red percentages. Center: a large candlestick chart with volume bars and two moving average lines. Right: an order book ladder with bid and ask volumes. Bottom: a strip "Strategy P/L" with three small cards and a red "KILL SWITCH" button.
```

### finance-telegram-alert.webp — 1200×900 (4:3)
```
A smartphone lying on a dark wooden desk next to a laptop, screen showing a messaging app chat with a bot. Chat bubbles in simple English: "Filled: BUY NVDA 12 @ 131.20", "Trailing stop updated", "Daily summary: 7 trades, rule violations 0". Night desk lamp lighting, realistic photo, shallow depth of field.
```

### finance-screener.webp — 1200×900 (4:3)
```
Stock screener software screenshot, dark navy theme. Title "Pre-market Screener". Filter chips at top: "Stage 2", "Volume > 2x", "MA Aligned". A table with columns "Symbol", "Market", "Stage", "Vol Ratio", "Signal" listing 10 rows with a mix of US tickers and Korean 6-digit codes, "Stage 2" in green badges, a few "Watch" in amber. Clean, sharp text.
```

---

## 6. 비전 검사 사례 (vision-inspection.html)

### vision-dashboard.webp — 1600×900 (16:9)
```
Factory production monitoring software screenshot, dark navy theme. Top-left: a live camera view of sauce pouches on a conveyor with one pouch highlighted by a red bounding box labeled "SEAL" and others with green boxes "OK". Top-right: big counters "Good 48,210", "NG 312", "Rate 99.35%". Bottom-left: a bar chart "Output per Hour". Bottom-center: a horizontal bar chart "Defect Types" with bars "Seal", "Foreign", "Date Print", "Tear". Bottom-right: a gallery grid of 6 small defect photo thumbnails. Top bar "Line 2 · Shift A".
```

### vision-camera-station.webp — 1200×900 (4:3)
```
Inside view of a machine vision inspection booth over a food packaging conveyor: an industrial camera with a C-mount lens mounted on an aluminum bracket looking down, two white LED bar lights with diffuser panels at 45 degrees, a photoelectric sensor on the side of the belt, and a small pneumatic air nozzle for rejecting products. Sauce pouches moving below. Clean stainless environment, sharp technical photography.
```

### vision-defect-samples.webp — 1200×900 (4:3)
```
Top-down product photography on a light grey inspection table: four small silver-and-red sauce pouches in a row for quality comparison — one perfect, one with a wrinkled heat seal, one with sauce trapped in the seal edge, one with a missing printed date area (blank). Small yellow sticky markers next to the defective ones (no text). Even soft lighting, macro detail, realistic QC lab photo.
```

---

## 7. 인프라 페이지 (infrastructure.html)

### infra-workstation.webp — 1200×900 (4:3)
```
A developer workstation: a tower PC with a tempered glass side panel showing a large graphics card with subtle lighting, two monitors displaying a code editor and a training loss graph (abstract, no readable text), mechanical keyboard, notebook. Tidy desk in a small office, evening, cool ambient light with warm desk lamp.
```

### infra-test-bench.webp — 1200×900 (4:3)
```
An electronics test bench in a small engineering office: a PLC training kit with toggle switches and indicator lamps, USB-to-RS232/RS485 converters, a programmable power supply, an industrial camera on a small tripod pointing at a sample part, a laptop running a terminal window, neatly arranged cables. Overhead angled view, bright neutral lighting, realistic.
```

---

## 8. 기업 소개 (about.html)

### about-ceo.webp — 1200×900 (4:3)
- **권장: 대표님 실제 사진** (작업 중인 모습, 정면 증명사진보다 자연스러운 컷)
- AI로 만들 경우(얼굴이 드러나지 않는 뒷모습·측면 컷):
```
A Korean man in his 50s, seen from behind at a slight side angle, sitting in a home-office style workspace, reviewing a desktop application on a large monitor while taking notes. Shelves with electronic test equipment and a small Bluetooth speaker prototype in the background. Warm natural light, authentic and humble atmosphere, face not visible.
```

### about-factory.webp — 1600×900 (16:9)
```
Wide view of an audio products assembly and testing line in a factory in Guangdong, China: workers in blue uniforms assembling soundbars and portable speakers along a long conveyor, a testing section at the end with small acoustic chambers, cardboard boxes of finished goods stacked on pallets. Bright factory lighting, realistic documentary photography, slightly elevated angle.
```

---

## 적용 체크리스트
- [ ] 23장 모두 같은 파일명으로 `image/` 폴더에 덮어쓰기
- [ ] 각 이미지가 비율(16:10 / 16:9 / 4:3)에 맞는지 확인 (맞지 않으면 가운데 기준으로 잘림)
- [ ] 스크린샷의 계좌번호·잔고·이메일 등 개인정보 가리기
- [ ] 이미지를 바꿔 내용이 달라졌다면 HTML의 `alt` 설명도 함께 수정
