/* AI BASE LAB — 공통 스크립트 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     [설정] 문의 폼 전송 주소
     Google Apps Script 웹앱 배포 후 받은 URL을 아래에 붙여넣으세요.
     예: 'https://script.google.com/macros/s/AKfycb.../exec'
     비워두면 '받는 주소·작성 내용 복사' 안내가 표시됩니다.
     ------------------------------------------------------------ */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxX0sveKMe_j1_JfIm-OKC2BrUBWDXgcQGqjNq5gyF6CCE6UdeYZIkdxeNZWN2yjGu9/exec';
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

    var LABELS = { company: '회사명', name: '성함', position: '직함', email: '이메일', phone: '연락처', category: '문의 분야', message: '문의 내용', page: '접수 페이지' };
    function buildMailText(data) {
      var out = [];
      Object.keys(LABELS).forEach(function (k) { var v = data.get(k); if (v) out.push(k === 'message' ? '\n[' + LABELS[k] + ']\n' + v : LABELS[k] + ': ' + v); });
      return out.join('\n');
    }
    function copyText(t, done) {
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (err) {} document.body.removeChild(ta); done();
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
    }
    function showCopyPanel(text) {
      var old = form.querySelector('.copy-panel'); if (old) old.remove();
      var subject = '[홈페이지 문의] ' + (form.querySelector('[name="company"]').value || '');
      var p = document.createElement('div'); p.className = 'copy-panel'; p.setAttribute('role', 'status');
      p.innerHTML = '<p class="copy-title">아래 두 가지를 복사해 사용하시는 메일(Gmail, 네이버 등)로 보내 주세요.</p>' +
        '<div class="copy-btns"><button type="button" class="btn btn-outline btn-sm" data-copy="mail">① 받는 주소 복사<span>' + CONTACT_EMAIL + '</span></button>' +
        '<button type="button" class="btn btn-primary btn-sm" data-copy="body">② 작성 내용 복사</button></div>' +
        '<p class="copy-sub">메일 프로그램이 설치되어 있다면 <a href="#" data-copy="app">메일 앱으로 바로 열기</a></p>';
      btn.insertAdjacentElement('afterend', p);
      p.addEventListener('click', function (ev) {
        var t = ev.target.closest('[data-copy]'); if (!t) return; ev.preventDefault();
        var k = t.getAttribute('data-copy');
        if (k === 'app') { location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text); return; }
        copyText(k === 'mail' ? CONTACT_EMAIL : '제목: ' + subject + '\n\n' + text, function () {
          t.classList.add('copied'); setStatus(k === 'mail' ? '받는 주소를 복사했습니다.' : '작성 내용을 복사했습니다. 메일 본문에 붙여넣어 주세요.', true);
        });
      });
      p.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // TEMPLATE_CHECK: 안내 문구만 있고 내용을 하나도 적지 않은 경우
      var msg = form.querySelector('[name="message"]');
      if (msg && msg.defaultValue && msg.value.replace(/\s/g, '') === msg.defaultValue.replace(/\s/g, '')) {
        msg.setCustomValidity('문의 내용을 한 가지 이상 적어 주세요.');
      } else if (msg) { msg.setCustomValidity(''); }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector('[name="website"]').value) return; // 스팸 봇
      var data = new FormData(form);
      data.append('page', location.href);

      if (!FORM_ENDPOINT) {
        showCopyPanel(buildMailText(data));
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
            if (msg) msg.setCustomValidity('');
            setStatus('문의가 접수되었습니다. 대표 엔지니어가 검토 후 회신드리겠습니다.', true);
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

  /* M_CTA: 모바일 하단 고정 문의 버튼 (문의 폼이 보이면 숨김) */
  (function () {
    var onIndex = !!document.getElementById('contact');
    var a = document.createElement('a');
    a.className = 'm-cta'; a.href = onIndex ? '#contact' : '/#contact'; a.textContent = '도입 문의하기 →';
    document.body.appendChild(a); document.body.classList.add('has-m-cta');
    var targets = [document.getElementById('contact'), document.querySelector('.site-footer')].filter(Boolean);
    if ('IntersectionObserver' in window && targets.length) {
      var seen = new Set();
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
        a.classList.toggle('hide', seen.size > 0);
      }, { threshold: 0.05 });
      targets.forEach(function (t) { io.observe(t); });
    }
  })();

  /* 기술 칩 더보기 (모바일) */
  document.querySelectorAll('.m-fold').forEach(function (ul) {
    if (ul.children.length <= 10) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'fold-btn'; b.textContent = '기술 ' + (ul.children.length - 10) + '개 더보기';
    b.addEventListener('click', function () { ul.classList.add('open'); b.remove(); });
    ul.insertAdjacentElement('afterend', b);
  });

  /* 버튼의 data-type 으로 문의 분야 자동 선택 */
  document.querySelectorAll('a[data-type]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.querySelector('#contact-form [name="category"]'); if (!sel) return;
      var key = a.getAttribute('data-type');
      Array.prototype.forEach.call(sel.options, function (o) { if (o.getAttribute('data-key') === key) sel.value = o.value; });
    });
  });
})();
