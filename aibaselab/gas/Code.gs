/**
 * AI BASE LAB 홈페이지 문의 폼 수신기 (Google Apps Script)
 * - 문의 내용을 구글 시트에 한 줄씩 기록
 * - contact@aibaselab.com 으로 즉시 알림 메일 발송 (회신 주소 = 문의자 이메일)
 * - 문의자에게 접수 확인 자동 회신 (선택)
 * - 스팸 방지: 숨김 필드(허니팟), 최소 작성 시간, 같은 이메일 반복 전송 제한
 *
 * 설치 방법은 같은 폴더의 README_문의폼_설정.md 를 참고하세요.
 */

const CONFIG = {
  NOTIFY_TO: 'contact@aibaselab.com',   // 알림 받을 주소
  FROM_ALIAS: '',                        // Gmail '다른 주소에서 메일 보내기'에 contact@aibaselab.com 을 등록했다면 여기에 입력
  SENDER_NAME: 'AI BASE LAB',
  SHEET_NAME: '문의내역',
  SEND_AUTO_REPLY: true,                 // 문의자에게 접수 확인 메일 보내기
  MIN_FILL_MS: 3000,                     // 페이지 열고 3초 안에 제출하면 봇으로 간주
  MAX_PER_EMAIL_PER_HOUR: 3,
};

const FIELDS = [
  ['company', '회사명'], ['name', '담당자명'], ['email', '이메일'], ['phone', '연락처'],
  ['category', '문의 분야'], ['message', '문의 내용'], ['page', '접수 페이지'],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    // 1) 스팸 차단 (봇에게는 성공처럼 응답)
    if (p.website) return json_({ result: 'success' });
    const ts = Number(p._ts || 0);
    if (ts && Date.now() - ts < CONFIG.MIN_FILL_MS) return json_({ result: 'success' });

    // 2) 입력값 검증
    const d = {};
    FIELDS.forEach(([k]) => { d[k] = String(p[k] || '').trim().slice(0, k === 'message' ? 5000 : 300); });
    for (const k of ['company', 'name', 'email', 'category', 'message']) {
      if (!d[k]) return json_({ result: 'error', message: '필수 항목 누락: ' + k });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json_({ result: 'error', message: '이메일 형식 오류' });
    if (p.consent !== '동의') return json_({ result: 'error', message: '개인정보 수집 동의 필요' });

    // 3) 같은 이메일 반복 전송 제한
    const cache = CacheService.getScriptCache();
    const key = 'rl_' + d.email.toLowerCase();
    const count = Number(cache.get(key) || 0);
    if (count >= CONFIG.MAX_PER_EMAIL_PER_HOUR) return json_({ result: 'error', message: '잠시 후 다시 시도해 주세요' });
    cache.put(key, String(count + 1), 3600);

    // 4) 시트 기록
    const received = new Date();
    sheet_().appendRow([received].concat(FIELDS.map(([k]) => safeCell_(d[k]))).concat(['신규']));

    // 5) 알림 메일
    const when = Utilities.formatDate(received, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    const rows = FIELDS.map(([k, label]) =>
      `<tr><th style="text-align:left;padding:8px 12px;background:#f1f5f9;width:110px;vertical-align:top">${label}</th>` +
      `<td style="padding:8px 12px;white-space:pre-wrap">${esc_(d[k]) || '-'}</td></tr>`).join('');
    send_(CONFIG.NOTIFY_TO,
      `[홈페이지 문의] ${d.company} / ${d.category}`,
      `<div style="font-family:sans-serif;font-size:14px;color:#1e293b">
         <p><b>새 프로젝트 문의가 접수되었습니다.</b> (${when})</p>
         <table style="border-collapse:collapse;border:1px solid #e2e8f0;min-width:420px">${rows}</table>
         <p style="color:#64748b">이 메일에 바로 ‘답장’하면 문의자(${esc_(d.email)})에게 회신됩니다.</p>
       </div>`,
      d.email);

    // 6) 문의자 자동 회신
    if (CONFIG.SEND_AUTO_REPLY) {
      send_(d.email,
        '[AI BASE LAB] 프로젝트 문의가 접수되었습니다',
        `<div style="font-family:sans-serif;font-size:14px;color:#1e293b;line-height:1.7">
           <p>${esc_(d.name)}님, 안녕하세요. AI BASE LAB입니다.</p>
           <p>보내주신 문의가 정상적으로 접수되었습니다.<br>
           대표 엔지니어가 내용을 검토한 뒤 <b>영업일 기준 1일 이내</b>에 회신드리겠습니다.</p>
           <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px 16px;margin:16px 0">
             <b>문의 분야:</b> ${esc_(d.category)}<br><b>접수 일시:</b> ${when}
           </div>
           <p>추가 자료(장비 목록, 사진, 기존 문서 등)가 있으시면 이 메일에 회신으로 보내주셔도 됩니다.</p>
           <p>감사합니다.<br>AI BASE LAB 드림<br><a href="https://aibaselab.com">aibaselab.com</a></p>
         </div>`,
        CONFIG.NOTIFY_TO);
    }
    return json_({ result: 'success' });
  } catch (err) {
    console.error(err);
    return json_({ result: 'error', message: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function doGet() {
  return ContentService.createTextOutput('AI BASE LAB contact endpoint is running.');
}

/** 설치 직후 한 번 실행: 권한 승인 + 시트/메일 동작 확인용 */
function testSubmit() {
  const r = doPost({ parameter: {
    company: '테스트 회사', name: '홍길동', email: CONFIG.NOTIFY_TO, phone: '010-0000-0000',
    category: '기타 맞춤 개발', message: '설치 테스트입니다.', page: 'test', consent: '동의', _ts: '0',
  }});
  console.log(r.getContent());
}

function send_(to, subject, html, replyTo) {
  const opt = { htmlBody: html, name: CONFIG.SENDER_NAME, replyTo: replyTo };
  if (CONFIG.FROM_ALIAS) opt.from = CONFIG.FROM_ALIAS;
  GmailApp.sendEmail(to, subject, html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), opt);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME);
    sh.appendRow(['접수일시'].concat(FIELDS.map(f => f[1])).concat(['처리상태']));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, FIELDS.length + 2).setFontWeight('bold').setBackground('#0b1121').setFontColor('#ffffff');
  }
  return sh;
}

function safeCell_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; } // 수식 삽입 방지
function esc_(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
