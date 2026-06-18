/**
 * ChatbotsHub Widget
 * Injects a chat iframe into the host page.
 *
 * Usage:
 * <script src="https://yourdomain.com/widget.js" data-api-key="chk_..."></script>
 */
(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var apiKey = script.getAttribute('data-api-key');
  var position = script.getAttribute('data-position') || 'bottom-right';
  var primaryColor = script.getAttribute('data-color') || '#6366f1';

  if (!apiKey) {
    console.error('[ChatbotsHub] data-api-key attribute is required');
    return;
  }

  var WIDGET_BASE_URL = script.src.replace(/\/widget\.js.*$/, '');
  var CHAT_URL = WIDGET_BASE_URL + '/chat?apiKey=' + encodeURIComponent(apiKey) + '&color=' + encodeURIComponent(primaryColor);

  var positionStyle = position === 'bottom-left'
    ? 'bottom:24px;left:24px;'
    : 'bottom:24px;right:24px;';

  // ─── Inject styles ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#chk-toggle{position:fixed;' + positionStyle + 'z-index:9999;width:56px;height:56px;border-radius:50%;background:' + primaryColor + ';border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;transition:transform .2s;}',
    '#chk-toggle:hover{transform:scale(1.08);}',
    '#chk-toggle svg{width:26px;height:26px;fill:white;}',
    // Width/height cap to the viewport so the popup (incl. its header) always
    // fits regardless of browser zoom. dvh handles mobile UI chrome; vh is the
    // fallback for older engines. 116px = bottom offset (92) + top breathing room.
    '#chk-iframe-container{position:fixed;' + positionStyle.replace('bottom:24px', 'bottom:92px') + 'z-index:9998;width:380px;max-width:calc(100vw - 48px);height:560px;max-height:calc(100vh - 116px);max-height:calc(100dvh - 116px);border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden;display:none;transition:opacity .2s;}',
    '#chk-iframe-container.open{display:block;}',
    '#chk-iframe-container iframe{width:100%;height:100%;border:none;display:block;}',
    '@media(max-width:480px){#chk-iframe-container{width:calc(100vw - 32px);max-width:none;height:70vh;max-height:calc(100dvh - 96px);bottom:82px;left:16px;right:16px;}}',
  ].join('');
  document.head.appendChild(style);

  // ─── Toggle button ───────────────────────────────────────────────────────────
  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'chk-toggle';
  toggleBtn.setAttribute('aria-label', 'Open chat');
  toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  // ─── Iframe container ────────────────────────────────────────────────────────
  var container = document.createElement('div');
  container.id = 'chk-iframe-container';

  var iframe = document.createElement('iframe');
  iframe.src = CHAT_URL;
  iframe.title = 'ChatbotsHub Widget';
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('loading', 'lazy');
  container.appendChild(iframe);

  // ─── Toggle logic ────────────────────────────────────────────────────────────
  var isOpen = false;

  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add('open');
      toggleBtn.setAttribute('aria-label', 'Close chat');
      toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    } else {
      container.classList.remove('open');
      toggleBtn.setAttribute('aria-label', 'Open chat');
      toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
    }
  });

  // ─── Sync branding color from dashboard settings ─────────────────────────────
  // The chat page (inside the iframe) fetches the live organization settings and
  // posts the resolved primaryColor back to this parent script, so the floating
  // toggle button matches the branding color chosen in settings — even when the
  // host page did not pass a data-color attribute.
  var chatOrigin;
  try {
    chatOrigin = new URL(WIDGET_BASE_URL).origin;
  } catch (e) {
    chatOrigin = null;
  }

  window.addEventListener('message', function (event) {
    if (chatOrigin && event.origin !== chatOrigin) return;
    var data = event.data;
    if (!data || data.type !== 'chatbotshub:settings') return;
    if (typeof data.primaryColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(data.primaryColor)) {
      primaryColor = data.primaryColor;
      toggleBtn.style.background = data.primaryColor;
    }
  });

  document.body.appendChild(container);
  document.body.appendChild(toggleBtn);
})();
