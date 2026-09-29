/* AI BASE LAB — 공통 스크립트 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     [설정] 문의 폼 전송 주소
     Google Apps Script 웹앱 배포 후 받은 URL을 아래에 붙여넣으세요.
     예: 'https://script.google.com/macros/s/AKfycb.../exec'
     비워두면 메일 앱(mailto)으로 대신 연결됩니다.
     ------------------------------------------------------------ */
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'contact@aibaselab.com';

  var body = document.body;

  /* 1. 헤더 그림자 */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. 모바일 메뉴 */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');
  function closeMenu() {
    body.classList.remove('nav-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', '메뉴 열기'); }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = !body.classList.contains('nav-open');
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* 3. 메인 히어로 슬라이더 */
  var visual = document.querySelector('.hero-visual');
  if (visual) {
    var slides = visual.querySelectorAll('img');
    var dotsWrap = visual.querySelector('.hero-dots');
    var caption = visual.querySelector('.hero-caption');
    var idx = 0, timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(n) {
      slides[idx].classList.remove('active');
      if (dotsWrap) dotsWrap.children[idx].removeAttribute('aria-current');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      if (dotsWrap) dotsWrap.children[idx].setAttribute('aria-current', 'true');
      if (caption) caption.textContent = slides[idx].getAttribute('data-caption') || '';
    }
    function start() { if (!reduce && slides.length > 1) { stop(); timer = setInterval(function () { show(idx + 1); }, 5000); } }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    if (dotsWrap) {
      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', (i + 1) + '번 이미지 보기');
        if (i === 0) b.setAttribute('aria-current', 'true');
        b.addEventListener('click', function () { show(i); start(); });
        dotsWrap.appendChild(b);
      });
    }
    if (caption) caption.textContent = slides[0].getAttribute('data-caption') || '';
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  }

  /* 4. 문의 폼 */
  var form = document.getElementById('contact-form');
  if (form) {
    // 사례 페이지에서 ?type=xxx 로 들어오면 문의 분야 자동 선택
    var params = new URLSearchParams(location.search);
    var type = params.get('type');
    var sel = form.querySelector('[name="category"]');
    if (type && sel) {
      Array.prototype.forEach.call(sel.options, function (o) { if (o.getAttribute('data-key') === type) sel.value = o.value; });
    }
    var tsField = form.querySelector('[name="_ts"]');
    if (tsField) tsField.value = String(Date.now());

    var status = form.querySelector('.form-status');
    var btn = form.querySelector('.submit-btn');
    function setStatus(msg, ok) { status.textContent = msg; status.className = 'form-status ' + (ok ? 'ok' : 'err'); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector('[name="website"]').value) return; // 스팸 봇
      var data = new FormData(form);
      data.append('page', location.href);

      if (!FORM_ENDPOINT) {
        var lines = [];
        data.forEach(function (v, k) { if (k.charAt(0) !== '_' && k !== 'website' && k !== 'consent') lines.push(k + ': ' + v); });
        location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('[홈페이지 문의] ' + (data.get('company') || '')) + '&body=' + encodeURIComponent(lines.join('\n'));
        return;
      }

      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = '전송 중...';
      setStatus('', true);
      fetch(FORM_ENDPOINT, { method: 'POST', body: new URLSearchParams(data) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.result === 'success') {
            form.reset();
            setStatus('문의가 접수되었습니다. 영업일 기준 1일 이내에 회신드리겠습니다.', true);
            if (typeof gtag === 'function') gtag('event', 'generate_lead', { form: 'contact' });
          } else {
            throw new Error((res && res.message) || 'error');
          }
        })
        .catch(function () {
          setStatus('전송에 실패했습니다. ' + CONTACT_EMAIL + ' 로 직접 메일을 보내주세요.', false);
        })
        .finally(function () { btn.disabled = false; btn.textContent = old; if (tsField) tsField.value = String(Date.now()); });
    });
  }
})();
