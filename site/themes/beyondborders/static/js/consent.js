/* ── Cookie consent banner (Google Consent Mode v2) ──
   Stores the choice in the bb_consent cookie, shared across *.beyondborders.com.sa.
   Bump VERSION to re-ask everyone (e.g. after adding a new kind of tracking). */
(function () {
  var COOKIE = 'bb_consent';
  var VERSION = 1;
  var MAX_AGE = 60 * 60 * 24 * 180; // 180 days

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  function read() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    try {
      var c = m && JSON.parse(decodeURIComponent(m[1]));
      return c && c.v === VERSION ? c : null;
    } catch (e) { return null; }
  }

  function write(c) {
    var parts = [COOKIE + '=' + encodeURIComponent(JSON.stringify(c)), 'path=/', 'max-age=' + MAX_AGE, 'SameSite=Lax'];
    if (/(^|\.)beyondborders\.com\.sa$/.test(location.hostname)) parts.push('domain=.beyondborders.com.sa');
    if (location.protocol === 'https:') parts.push('Secure');
    document.cookie = parts.join('; ');
  }

  function apply(analytics, marketing) {
    var a = analytics ? 'granted' : 'denied';
    var k = marketing ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: a,
      ad_storage: k,
      ad_user_data: k,
      ad_personalization: k
    });
    dataLayer.push({ event: 'consent_update', consent_analytics: a, consent_marketing: k });
  }

  function save(analytics, marketing) {
    write({ v: VERSION, a: analytics ? 1 : 0, m: marketing ? 1 : 0, t: Date.now() });
    apply(analytics, marketing);
    hide();
  }

  var banner;

  function build() {
    banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cc-title');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="cc-inner container">' +
        '<div class="cc-text">' +
          '<p class="cc-title" id="cc-title">We value your privacy</p>' +
          '<p>We use cookies to understand how visitors use our site and to measure our marketing. ' +
          'Essential cookies are always on. You can accept all, reject the rest, or choose below.</p>' +
        '</div>' +
        '<div class="cc-prefs" hidden>' +
          '<label class="cc-toggle"><input type="checkbox" checked disabled /><span><strong>Essential</strong> Required for the site to work. Always on.</span></label>' +
          '<label class="cc-toggle"><input type="checkbox" data-cc="analytics" /><span><strong>Analytics</strong> Helps us understand which pages are useful.</span></label>' +
          '<label class="cc-toggle"><input type="checkbox" data-cc="marketing" /><span><strong>Marketing</strong> Measures ad campaigns and shows relevant ads.</span></label>' +
        '</div>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-link" data-cc-action="prefs">Preferences</button>' +
          '<button type="button" class="btn btn-primary" data-cc-action="save" hidden>Save preferences</button>' +
          '<button type="button" class="btn btn-outline-inv" data-cc-action="reject">Reject all</button>' +
          '<button type="button" class="btn btn-primary" data-cc-action="accept">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cc-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-cc-action');
      if (action === 'accept') save(true, true);
      else if (action === 'reject') save(false, false);
      else if (action === 'prefs') showPrefs();
      else if (action === 'save') save(box('analytics').checked, box('marketing').checked);
    });
  }

  function box(name) { return banner.querySelector('[data-cc="' + name + '"]'); }

  function showPrefs() {
    var c = read();
    box('analytics').checked = !!(c && c.a);
    box('marketing').checked = !!(c && c.m);
    banner.querySelector('.cc-prefs').hidden = false;
    banner.querySelector('[data-cc-action="prefs"]').hidden = true;
    banner.querySelector('[data-cc-action="save"]').hidden = false;
  }

  function show(withPrefs) {
    if (!banner) build();
    banner.querySelector('.cc-prefs').hidden = true;
    banner.querySelector('[data-cc-action="prefs"]').hidden = false;
    banner.querySelector('[data-cc-action="save"]').hidden = true;
    if (withPrefs) showPrefs();
    banner.hidden = false;
  }

  function hide() { if (banner) banner.hidden = true; }

  // "Cookie settings" links anywhere on the page reopen the banner
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-open]')) { e.preventDefault(); show(true); }
  });

  if (!read()) show(false);
})();
