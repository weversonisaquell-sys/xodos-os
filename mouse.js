/* =========================================================
   XodosOS - mouse.js
   Cursor Xodós: transforma toque em trackpad virtual.
   - 1 dedo: move o cursor (relativo, estilo trackpad).
   - Segurar parado com 1 dedo: ativa "hold" (mousedown).
   - Tocar com 2º dedo enquanto segura: arrasta o cursor
     (estilo "segura com um dedo, arrasta com o outro").
   - Toque rápido (tap): simula clique no elemento sob o cursor.
   - Dois taps rápidos no mesmo elemento: simula "dblclick".
   - Também segue o mouse real (modo desktop/preview),
     ignorando eventos sintéticos via e.isTrusted.
   ========================================================= */
(function () {
  const cursorEl = document.getElementById('xodosCursor');
  const desktop = document.getElementById('desktopArea');
  if (!cursorEl || !desktop) return;

  const TOUCH_SENSITIVITY = 1.35;
  const HOLD_DELAY = 380;
  const MOVE_CANCEL_PX = 10;
  const CLICK_RING_MS = 350;
  const DOUBLE_TAP_MS = 350;

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;

  let primaryId = null, secondaryId = null;
  let primaryStart = null, primaryLast = null, secondaryLast = null;
  let holdTimer = null;
  let holding = false;
  let movedPastThreshold = false;
  let hoverEl = null;
  let lastTapTime = 0, lastTapEl = null;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function placeCursor() {
    cx = clamp(cx, 0, window.innerWidth - 2);
    cy = clamp(cy, 0, window.innerHeight - 2);
    cursorEl.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
  }

  function elAtCursor() {
    return document.elementFromPoint(cx, cy);
  }

  function updateHover() {
    const el = elAtCursor();
    const target = el
      ? el.closest('.desktop-icon, .app-item, .start-btn, .store-btn, .taskbar-app, .win-btn, .resize-handle, .bp-tile, .browser-bookmarks button, .files-grid > div')
      : null;
    if (target !== hoverEl) {
      if (hoverEl) hoverEl.classList.remove('hover');
      if (target) target.classList.add('hover');
      hoverEl = target;
    }
  }

  function dispatchMouse(type, target) {
    const el = target || elAtCursor() || document;
    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: cx,
      clientY: cy,
      button: 0
    });
    el.dispatchEvent(evt);
    return el;
  }

  function flashClickRing() {
    cursorEl.classList.remove('clicking');
    void cursorEl.offsetWidth;
    cursorEl.classList.add('clicking');
    setTimeout(() => cursorEl.classList.remove('clicking'), CLICK_RING_MS);
  }

  function doTap() {
    flashClickRing();
    const el = elAtCursor();
    dispatchMouse('mousedown', el);
    dispatchMouse('mouseup', el);
    dispatchMouse('click', el);

    const now = Date.now();
    if (el && el === lastTapEl && (now - lastTapTime) < DOUBLE_TAP_MS) {
      dispatchMouse('dblclick', el);
      lastTapTime = 0;
      lastTapEl = null;
    } else {
      lastTapTime = now;
      lastTapEl = el;
    }
  }

  function startHolding() {
    holding = true;
    cursorEl.classList.add('holding');
    dispatchMouse('mousedown');
  }

  function stopHolding() {
    if (!holding) return;
    holding = false;
    cursorEl.classList.remove('holding');
    dispatchMouse('mouseup');
  }

  function clearHoldTimer() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  }

  function onTouchStart(e) {
    for (const t of e.changedTouches) {
      if (primaryId === null) {
        primaryId = t.identifier;
        primaryStart = { x: t.clientX, y: t.clientY };
        primaryLast = { x: t.clientX, y: t.clientY };
        movedPastThreshold = false;
        clearHoldTimer();
        holdTimer = setTimeout(() => {
          if (primaryId !== null && !movedPastThreshold) startHolding();
        }, HOLD_DELAY);
      } else if (secondaryId === null) {
        secondaryId = t.identifier;
        secondaryLast = { x: t.clientX, y: t.clientY };
      }
    }
    e.preventDefault();
  }

  function onTouchMove(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === secondaryId) {
        const dx = (t.clientX - secondaryLast.x) * TOUCH_SENSITIVITY;
        const dy = (t.clientY - secondaryLast.y) * TOUCH_SENSITIVITY;
        secondaryLast = { x: t.clientX, y: t.clientY };
        cx += dx; cy += dy;
        placeCursor();
        updateHover();
        if (holding) dispatchMouse('mousemove');
      } else if (t.identifier === primaryId) {
        const dx = t.clientX - primaryLast.x;
        const dy = t.clientY - primaryLast.y;
        primaryLast = { x: t.clientX, y: t.clientY };

        const totalDx = t.clientX - primaryStart.x;
        const totalDy = t.clientY - primaryStart.y;
        if (!movedPastThreshold && Math.hypot(totalDx, totalDy) > MOVE_CANCEL_PX) {
          movedPastThreshold = true;
          clearHoldTimer();
        }

        if (secondaryId === null) {
          cx += dx * TOUCH_SENSITIVITY;
          cy += dy * TOUCH_SENSITIVITY;
          placeCursor();
          updateHover();
          if (holding) dispatchMouse('mousemove');
        }
      }
    }
    e.preventDefault();
  }

  function onTouchEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === secondaryId) {
        secondaryId = null;
        secondaryLast = null;
      } else if (t.identifier === primaryId) {
        clearHoldTimer();
        if (holding) {
          stopHolding();
        } else if (!movedPastThreshold) {
          doTap();
        }
        primaryId = null;
        primaryStart = null;
        primaryLast = null;
        movedPastThreshold = false;

        if (secondaryId !== null) {
          primaryId = secondaryId;
          primaryStart = { x: secondaryLast.x, y: secondaryLast.y };
          primaryLast = { x: secondaryLast.x, y: secondaryLast.y };
          secondaryId = null;
          secondaryLast = null;
        }
      }
    }
    e.preventDefault();
  }

  function onMouseMoveReal(e) {
    if (!e.isTrusted) return;
    cx = e.clientX; cy = e.clientY;
    placeCursor();
    updateHover();
  }
  function onMouseDownReal(e) {
    if (!e.isTrusted) return;
    cursorEl.classList.add('holding');
  }
  function onMouseUpReal(e) {
    if (!e.isTrusted) return;
    cursorEl.classList.remove('holding');
    flashClickRing();
  }

  function init() {
    desktop.style.touchAction = 'none';
    placeCursor();

    desktop.addEventListener('touchstart', onTouchStart, { passive: false });
    desktop.addEventListener('touchmove', onTouchMove, { passive: false });
    desktop.addEventListener('touchend', onTouchEnd, { passive: false });
    desktop.addEventListener('touchcancel', onTouchEnd, { passive: false });

    document.addEventListener('mousemove', onMouseMoveReal);
    document.addEventListener('mousedown', onMouseDownReal);
    document.addEventListener('mouseup', onMouseUpReal);

    document.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', placeCursor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
