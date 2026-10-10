/* AI BASE LAB — 공통 스크립트 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     [설정] 문의 폼 전송 주소
     Google Apps Script 웹앱 배포 후 받은 URL을 아래에 붙여넣으세요.
     ------------------------------------------------------------ */
  // 1차: Cloudflare Pages Function(/api/contact) → 접속 국가·네트워크 정보를 붙여 Apps Script로 전달
  // 2차: Function이 없거나 실패하면 Apps Script로 직접 전송
  var FORM_ENDPOINT = '/api/contact';
  var GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx-YlmB2TN3TGKz4VQdpxRJP87FBS_RZ5MsQjzgmlmrdM5LI_tlmDKIBZ3hAm2FBXhu/exec';
  var CONTACT_EMAIL = 'contact@aibaselab.com';

  var body = document.body;
  
  // 현재 문서의 언어를 감지하여 3가지(KO, EN, CN)로 완벽히 분기
  var lang = (document.documentElement.lang || '').toLowerCase();
  var isEN = lang.indexOf('en') === 0;
  var isCN = lang.indexOf('zh') === 0;

  // 언어별 알림 및 버튼 텍스트 설정 (도입 문의하기 -> 문의하기 변경 완료)
  var T;
  if (isEN) {
    T = {
      open: 'Open menu', close: 'Close menu', slide: 'Show image ', empty: 'Please fill in at least one item.', need: 'Please select at least one option.',
      sending: 'Sending...', ok: 'Thank you. Your inquiry has been received. Our lead engineer will review it and reply by email.',
      fail: 'Sending failed. Please email us directly at ', cta: 'Contact us →', ctaHref: '/en/#contact', more: ' more'
    };
  } else if (isCN) {
    T = {
      open: '打开菜单', close: '关闭菜单', slide: '号图片', empty: '请至少填写一项内容。', need: '请至少选择一个选项。',
      sending: '发送中...', ok: '您的咨询已收到，首席工程师评估后将通过邮件或微信回复您。',
      fail: '发送失败。请直接发送邮件至 ', cta: '联系我们 →', ctaHref: '/cn/#contact', more: '项更多'
    };
  } else {
    T = {
      open: '메뉴 열기', close: '메뉴 닫기', slide: '번 이미지 보기', empty: '문의 내용을 한 가지 이상 적어 주세요.', need: '문의 분야를 한 가지 이상 선택해 주세요.',
      sending: '전송 중...', ok: '문의가 접수되었습니다. 대표 엔지니어가 검토 후 회신드리겠습니다.',
      fail: '전송에 실패했습니다. ', cta: '문의하기 →', ctaHref: '/#contact', more: '개 더보기'
    };
  }

  /* 0. 로고 아랫줄(AUTOMATION ENGINEERING)을 로고 글자 폭에 맞춤 */
  function fitLogos() {
    document.querySelectorAll('.logo').forEach(function (l) {
      var w = l.querySelector('.logo-word'), s = l.querySelector('.logo-sub'); if (!w || !s) return;
      s.style.letterSpacing = '0px'; s.style.marginRight = '0px';
      var n = s.textContent.length, diff = w.getBoundingClientRect().width - s.getBoundingClientRect().width;
      if (n > 1 && diff > 0) { var ls = diff / (n - 1); s.style.letterSpacing = ls + 'px'; s.style.marginRight = (-ls) + 'px'; }
    });
  }
  fitLogos();
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(fitLogos);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitLogos);
  }
  setTimeout(fitLogos, 300); setTimeout(fitLogos, 1200);
  window.addEventListener('resize', fitLogos);
  window.addEventListener('load', fitLogos);

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
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', T.open); }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = !body.classList.contains('nav-open');
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? T.close : T.open);
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* 3. 메인 히어로 슬라이더 */
  var visual = document.querySelector('.hero-visual');
  if (visual) {
    var slides = visual.querySelectorAll('.slide');
    if (!slides.length) slides = visual.querySelectorAll('img');
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
        b.setAttribute('aria-label', isEN ? T.slide + (i + 1) : (i + 1) + T.slide);
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
    var params = new URLSearchParams(location.search);
    var type = params.get('type');
    if (type) preselect(type);
    var needs = form.querySelectorAll('input[name="need"]');
    function checkNeeds() {
      if (!needs.length) return;
      var any = Array.prototype.some.call(needs, function (c) { return c.checked; });
      needs[0].setCustomValidity(any ? '' : T.need);
    }
    Array.prototype.forEach.call(needs, function (c) { c.addEventListener('change', checkNeeds); });
    var tsField = form.querySelector('[name="_ts"]');
    if (tsField) tsField.value = String(Date.now());

    var status = form.querySelector('.form-status');
    var btn = form.querySelector('.submit-btn');
    function setStatus(msg, ok) { status.textContent = msg; status.className = 'form-status ' + (ok ? 'ok' : 'err'); }

    var LABELS = { company: '회사명', name: '성함', position: '직함', email: '이메일', phone: '연락처', country: '국가', city: '지역', website_url: '홈페이지', category: '문의 분야', message: '의뢰 내용', page: '접수 페이지' };
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
      var msg = form.querySelector('[name="message"]');
      if (msg && msg.defaultValue && msg.value.replace(/\s/g, '') === msg.defaultValue.replace(/\s/g, '')) {
        msg.setCustomValidity(T.empty);
      } else if (msg) { msg.setCustomValidity(''); }
      checkNeeds();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector('[name="website"]').value) return; 
      var data = new FormData(form);
      var wu = (data.get('website_url') || '').trim();
      if (wu && !/^[a-z][a-z0-9+.-]*:\/\//i.test(wu)) wu = 'https://' + wu.replace(/^\/+/, '');
      if (data.has('website_url')) data.set('website_url', wu);
      data.append('page', location.href);
      try { data.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (err) {}
      data.append('browser_lang', (navigator.languages && navigator.languages.join(', ')) || navigator.language || '');
      var csel = form.querySelector('select[name="country"]');
      if (csel && csel.selectedIndex > 0) data.append('country_code', csel.options[csel.selectedIndex].getAttribute('data-code') || '');
      if (needs.length) {
        data.delete('need');
        data.set('category', Array.prototype.filter.call(needs, function (c) { return c.checked; }).map(function (c) { return c.value; }).join(', '));
      }
      var qs = form.querySelectorAll('[data-q]');
      if (qs.length) {
        var lines = [];
        Array.prototype.forEach.call(qs, function (el) {
          var v = (el.value || '').trim(); data.delete(el.name); if (!v) return;
          var label = el.getAttribute('data-q');
          lines.push(el.hasAttribute('data-long') ? '\n■ ' + label + ' :\n' + v : '■ ' + label + ' : ' + v);
        });
        data.set('message', lines.join('\n').trim());
      }

      if (!FORM_ENDPOINT) {
        showCopyPanel(buildMailText(data));
        return;
      }

      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = T.sending;
      setStatus('', true);
      function post(url) {
        return fetch(url, { method: 'POST', body: new URLSearchParams(data) }).then(function (r) {
          if (!r.ok) { var e = new Error('http ' + r.status); e.retry = true; throw e; }
          return r.json();
        });
      }
      post(FORM_ENDPOINT)
        .catch(function (err) { if (err && (err.retry || err instanceof TypeError)) return post(GAS_ENDPOINT); throw err; })
        .then(function (res) {
          if (res && res.result === 'success') {
            form.reset();
            if (msg) msg.setCustomValidity('');
            checkNeeds(); if (needs.length) needs[0].setCustomValidity('');
            setStatus(T.ok, true);
            if (typeof gtag === 'function') gtag('event', 'generate_lead', { form: 'contact' });
          } else {
            throw new Error((res && res.message) || 'error');
          }
        })
        .catch(function () {
          // 에러 메시지도 언어별로 완벽히 분기
          if (isEN) {
            setStatus(T.fail + CONTACT_EMAIL + '.', false);
          } else if (isCN) {
            setStatus(T.fail + CONTACT_EMAIL, false);
          } else {
            setStatus(T.fail + CONTACT_EMAIL + ' 로 직접 메일을 보내주세요.', false);
          }
        })
        .finally(function () { btn.disabled = false; btn.textContent = old; if (tsField) tsField.value = String(Date.now()); });
    });
  }

  /* M_CTA: 모바일 하단 고정 문의 버튼 */
  (function () {
    var onIndex = !!document.getElementById('contact');
    var a = document.createElement('a');
    a.className = 'm-cta'; a.href = onIndex ? '#contact' : T.ctaHref; a.textContent = T.cta;
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
    b.type = 'button'; b.className = 'fold-btn'; 
    b.textContent = isEN ? '10' + T.more : (isCN ? '10' + T.more : '기술 10' + T.more);
    b.addEventListener('click', function () { ul.classList.add('open'); b.remove(); });
    ul.insertAdjacentElement('afterend', b);
  });

  /* 버튼의 data-type 으로 문의 분야 자동 선택 */
  document.querySelectorAll('a[data-type]').forEach(function (a) {
    a.addEventListener('click', function () { preselect(a.getAttribute('data-type')); });
  });
  function preselect(key) {
    var cb = document.querySelector('#contact-form input[name="need"][data-key="' + key + '"]');
    if (cb) { cb.checked = true; cb.setCustomValidity(''); return; }
    var sel = document.querySelector('#contact-form [name="category"]'); if (!sel || !sel.options) return;
    Array.prototype.forEach.call(sel.options, function (o) { if (o.getAttribute('data-key') === key) sel.value = o.value; });
  }
})();
