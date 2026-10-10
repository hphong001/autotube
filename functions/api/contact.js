/**
 * AI BASE LAB 문의 폼 중계 (Cloudflare Pages Function)
 * 주소: https://aibaselab.com/api/contact
 *
 * 하는 일
 *  1) 홈페이지 문의 폼 내용을 받는다
 *  2) Cloudflare가 알려주는 접속 정보(국가·도시·통신사 등)를 덧붙인다
 *  3) 기존 Google Apps Script 웹앱으로 그대로 전달하고, 응답을 돌려준다
 *
 * 설치: 저장소 루트의 functions/api/contact.js 로 올리면 다음 배포부터 자동 적용 (대시보드 설정 불필요)
 * Apps Script 주소가 바뀌면 아래 GAS_URL만 고치면 된다.
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbx-YlmB2TN3TGKz4VQdpxRJP87FBS_RZ5MsQjzgmlmrdM5LI_tlmDKIBZ3hAm2FBXhu/exec';

// 서버가 채우는 항목 (폼에서 보낸 값은 무시하고 덮어씀)
const SERVER_KEYS = ['ip', 'ip_country', 'ip_region', 'ip_city', 'ip_asn', 'ip_org', 'ip_tz', 'ua', 'accept_lang'];

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request }) {
  let body;
  try {
    body = new URLSearchParams(await request.text());
  } catch (e) {
    return json({ result: 'error', message: 'bad request' }, 400);
  }

  const cf = request.cf || {};
  const h = request.headers;
  const info = {
    ip: h.get('CF-Connecting-IP'),
    ip_country: cf.country,
    ip_region: cf.region,
    ip_city: cf.city,
    ip_asn: cf.asn ? 'AS' + cf.asn : '',
    ip_org: cf.asOrganization,
    ip_tz: cf.timezone,
    ua: h.get('User-Agent'),
    accept_lang: h.get('Accept-Language'),
  };
  SERVER_KEYS.forEach((k) => {
    body.delete(k);
    if (info[k]) body.set(k, String(info[k]).slice(0, 300));
  });

  try {
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      redirect: 'follow',
    });
    const text = await r.text();
    try {
      return json(JSON.parse(text));
    } catch (e) {
      return json({ result: 'error', message: 'relay response' }, 502);
    }
  } catch (e) {
    return json({ result: 'error', message: 'relay' }, 502);
  }
}

// POST 외의 요청은 거절
export function onRequest() {
  return json({ result: 'error', message: 'method not allowed' }, 405);
}
