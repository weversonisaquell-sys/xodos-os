// ============================================================
// Xodós OS - script.js
// Núcleo do sistema: relógio, arraste de janelas, foco (z-index)
// e sincronização automática da barra de tarefas.
// ============================================================

// ---- Relógio do sistema ----
setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.innerText = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
}, 1000);

// ---- Metadados das janelas pra montar a taskbar ----
const WIN_META = {
    files: { label: 'Arquivos', icon: '📁' },
    firefox: { label: 'Firefox', icon: '🌐' },
    youtube: { label: 'YouTube', icon: '▶️' },
    terminal: { label: 'Terminal', icon: '💻' },
    'photo-viewer': { label: 'Imagem', icon: '🖼️' }
};

function xodosWindowIds() {
    return Object.keys(WIN_META).filter(id => document.getElementById('win-' + id));
}

function updateTaskbar() {
    const bar = document.getElementById('taskbarApps');
    if (!bar) return;
    bar.innerHTML = '';
    xodosWindowIds().forEach(id => {
        const win = document.getElementById('win-' + id);
        if (!win || win.classList.contains('minimized')) return;
        const meta = WIN_META[id];
        const btn = document.createElement('div');
        btn.className = 'taskbar-app';
        btn.textContent = meta.icon + ' ' + meta.label;
        btn.onclick = () => {
            win.classList.remove('minimized');
            focusWindow(win);
        };
        bar.appendChild(btn);
    });
}

// ---- Foco / z-index (mesmo padrão do apps.js, pra não conflitar) ----
function focusWindow(win) {
    win.style.zIndex = Date.now();
    document.querySelectorAll('.win').forEach(w => w.classList.remove('focused'));
    win.classList.add('focused');
}

// ---- Arraste de janelas pela titlebar ----
let dragWin = null, dragOffsetX = 0, dragOffsetY = 0;

function startWindowDrag(e, winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    dragWin = win;
    dragOffsetX = e.clientX - win.offsetLeft;
    dragOffsetY = e.clientY - win.offsetTop;
    focusWindow(win);
    document.addEventListener('mousemove', onWindowDrag);
    document.addEventListener('mouseup', stopWindowDrag);
}

function onWindowDrag(e) {
    if (!dragWin) return;
    let left = e.clientX - dragOffsetX;
    let top = e.clientY - dragOffsetY;
    left = Math.max(-dragWin.offsetWidth + 60, Math.min(left, window.innerWidth - 60));
    top = Math.max(0, Math.min(top, window.innerHeight - 60));
    dragWin.style.left = left + 'px';
    dragWin.style.top = top + 'px';
}

function stopWindowDrag() {
    dragWin = null;
    document.removeEventListener('mousemove', onWindowDrag);
    document.removeEventListener('mouseup', stopWindowDrag);
}

document.querySelectorAll('.titlebar[data-win]').forEach(tb => {
    tb.addEventListener('mousedown', e => {
        if (e.target.closest('.close-btn') || e.target.closest('.upload-btn')) return;
        startWindowDrag(e, tb.dataset.win);
    });
});

// ---- Atualiza a taskbar sozinha sempre que uma janela abre/fecha ----
const winObserver = new MutationObserver(updateTaskbar);
document.querySelectorAll('.win').forEach(w => {
    winObserver.observe(w, { attributes: true, attributeFilter: ['class'] });
});

document.addEventListener('DOMContentLoaded', updateTaskbar);
updateTaskbar();
