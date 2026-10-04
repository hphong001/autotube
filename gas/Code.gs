/**
 * AI BASE LAB 홈페이지 문의 폼 수신기 (Google Apps Script)
 * - 문의 내용을 구글 시트에 한 줄씩 기록
 * - contact@aibaselab.com 으로 즉시 알림 메일 발송 (회신 주소 = 문의자 이메일)
 * - 문의자에게 접수 확인 자동 회신 (선택)
 * - 스팸 방지: 숨김 필드(허니팟), 최소 작성 시간, 같은 이메일 반복 전송 제한
 *
 * 설치: script.google.com 새 프로젝트에 이 코드를 붙여넣고 → testSubmit 실행(권한 승인) → 웹 앱으로 배포
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
  ['company', '회사명'], ['name', '성함'], ['position', '직함'], ['email', '이메일'], ['phone', '연락처'],
  ['category', '문의 분야'], ['message', '문의 내용'], ['page', '접수 페이지'],
];
// 영어 페이지용 추가 항목 (시트에서는 '처리상태' 뒤 열에 기록 → 기존 시트 열 순서 유지)
const EXTRA = [['country', '국가'], ['lang', '언어']];

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
    FIELDS.concat(EXTRA).forEach(([k]) => { d[k] = String(p[k] || '').trim().slice(0, k === 'message' ? 5000 : 300); });
    const en = d.lang === 'en';
    for (const k of ['company', 'name', 'email', 'category', 'message']) {
      if (!d[k]) return json_({ result: 'error', message: '필수 항목 누락: ' + k });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json_({ result: 'error', message: '이메일 형식 오류' });
    if (p.consent !== '동의' && p.consent !== 'agree') return json_({ result: 'error', message: '개인정보 수집 동의 필요' });

    // 3) 같은 이메일 반복 전송 제한
    const cache = CacheService.getScriptCache();
    const key = 'rl_' + d.email.toLowerCase();
    const count = Number(cache.get(key) || 0);
    if (count >= CONFIG.MAX_PER_EMAIL_PER_HOUR) return json_({ result: 'error', message: '잠시 후 다시 시도해 주세요' });
    cache.put(key, String(count + 1), 3600);

    // 4) 시트 기록
    const received = new Date();
    sheet_().appendRow([received].concat(FIELDS.map(([k]) => safeCell_(d[k]))).concat(['신규']).concat(EXTRA.map(([k]) => safeCell_(d[k]))));

    // 5) 알림 메일
    const when = Utilities.formatDate(received, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    const show = FIELDS.slice(0, 6).concat(d.country ? [['country', '국가']] : []).concat(FIELDS.slice(6));
    const rows = show.map(([k, label]) =>
      `<tr><th style="text-align:left;padding:8px 12px;background:#f1f5f9;width:110px;vertical-align:top">${label}</th>` +
      `<td style="padding:8px 12px;line-height:1.7">${multiline_(d[k]) || '-'}</td></tr>`).join('');
    send_(CONFIG.NOTIFY_TO,
      `${en ? '[EN 문의]' : '[홈페이지 문의]'} ${d.company}${d.country ? ' (' + d.country + ')' : ''} / ${d.category}`,
      `<div style="font-family:sans-serif;font-size:14px;color:#1e293b">
         <p><b>새 프로젝트 문의가 접수되었습니다.</b> (${when})</p>
         <table style="border-collapse:collapse;border:1px solid #e2e8f0;min-width:420px">${rows}</table>
         <p style="color:#64748b">이 메일에 바로 ‘답장’하면 문의자(${esc_(d.email)})에게 회신됩니다.</p>
       </div>`,
      d.email);

    // 6) 문의자 자동 회신
    if (CONFIG.SEND_AUTO_REPLY && en) {
      send_(d.email,
        '[AI BASE LAB] We have received your inquiry',
        `<div style="font-family:sans-serif;font-size:14px;color:#1e293b;line-height:1.7">
           <p>Dear ${esc_(d.name)},</p>
           <p>Thank you for contacting AI BASE LAB. We have received your inquiry.<br>
           Our lead engineer will review it personally and reply to you by email.</p>
           <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px 16px;margin:16px 0">
             <b>Inquiry type:</b> ${esc_(d.category)}<br><b>Received:</b> ${when} (KST)
           </div>
           <p>If you have any materials (product information, equipment list, photos or documents), feel free to reply to this email with them.</p>
           <p>Best regards,<br>AI BASE LAB<br><a href="https://aibaselab.com/en/">aibaselab.com/en</a></p>
         </div>`,
        CONFIG.NOTIFY_TO);
    } else if (CONFIG.SEND_AUTO_REPLY) {
      send_(d.email,
        '[AI BASE LAB] 프로젝트 문의가 접수되었습니다',
        `<div style="font-family:sans-serif;font-size:14px;color:#1e293b;line-height:1.7">
           <p>${esc_(d.name)}님, 안녕하세요. AI BASE LAB입니다.</p>
           <p>보내주신 문의가 정상적으로 접수되었습니다.<br>
           대표 엔지니어가 내용을 직접 검토한 뒤 회신드리겠습니다.</p>
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

/** 영어 문의 테스트 (영어 자동 회신 확인용) */
function testSubmitEn() {
  const r = doPost({ parameter: {
    company: 'Test Corp', name: 'John Smith', email: CONFIG.NOTIFY_TO, country: 'Germany',
    category: 'Korea Partner — support for our Korean customers', message: '■ Your product or system : test\n\n■ What you need : on-site support',
    page: 'test', consent: 'agree', lang: 'en', _ts: '0',
  }});
  console.log(r.getContent());
}

function send_(to, subject, html, replyTo) {
  const opt = { htmlBody: html, name: CONFIG.SENDER_NAME, replyTo: replyTo };
  if (CONFIG.FROM_ALIAS) opt.from = CONFIG.FROM_ALIAS;
  const text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(tr|p|div)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  GmailApp.sendEmail(to, subject, text, opt);
}

function sheet_() {
  // 시트에서 '확장 프로그램 > Apps Script'로 만든 경우 그 시트를, 아니면 '문의내역' 시트를 새로 만들어 사용
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    const props = PropertiesService.getScriptProperties();
    const id = props.getProperty('SHEET_ID');
    if (id) ss = SpreadsheetApp.openById(id);
    else { ss = SpreadsheetApp.create('AI BASE LAB 문의내역'); props.setProperty('SHEET_ID', ss.getId()); }
  }
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME);
    sh.appendRow(['접수일시'].concat(FIELDS.map(f => f[1])).concat(['처리상태']));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, FIELDS.length + 2).setFontWeight('bold').setBackground('#0b1121').setFontColor('#ffffff');
  }
  // 추가 항목(국가·언어) 머리글이 없으면 '처리상태' 뒤에 추가
  const c = FIELDS.length + 3;
  if (!sh.getRange(1, c).getValue()) {
    sh.getRange(1, c, 1, EXTRA.length).setValues([EXTRA.map(f => f[1])]).setFontWeight('bold').setBackground('#0b1121').setFontColor('#ffffff');
  }
  return sh;
}

function safeCell_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; } // 수식 삽입 방지
/** 메일용: 줄바꿈을 <br>로 바꾸고, 빈 줄은 하나로 줄이고, ■ 항목 제목은 굵게 표시 */
function multiline_(s) {
  return String(s || '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    .split('\n').map(line => {
      const e = esc_(line);
      const m = e.match(/^(■[^:]*:)(.*)$/);
      return m ? `<b>${m[1]}</b>${m[2]}` : e;
    }).join('<br>');
}
function esc_(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
