const UPDATE_API     = 'https://api.zeromi.cn/api/market/update.php';
const UPDATE_VER_KEY = 'rcs_dismissed_ver';

async function initUpdateCheck() {
    if (typeof isOnlineMode === 'function' && !isOnlineMode()) return;

    try {
        const r = await fetch(UPDATE_API);
        if (!r.ok) return;
        const data = await r.json();
        _handleUpdateResult(data);
    } catch (_) {
    }
}

function _handleUpdateResult(data) {
    const latestVer = Number(data.version);
    const current   = Number(typeof APP_VERSION !== 'undefined' ? APP_VERSION : 0);

    if (!latestVer || latestVer <= current) return;

    const isForced = !!data.update;

    if (!isForced) {
        const dismissed = Number(localStorage.getItem(UPDATE_VER_KEY) || 0);
        if (dismissed >= latestVer) return;
    }

    _showUpdateModal(latestVer, isForced, data.content || '');
}

function _showUpdateModal(latestVer, isForced, htmlContent) {
    const modal = document.getElementById('updateModal');
    if (!modal) return;

    const changelogEl = document.getElementById('update-changelog');
    if (changelogEl) changelogEl.innerHTML = htmlContent;

    const verEl = document.getElementById('update-version-badge');
    if (verEl) verEl.textContent = 'v' + latestVer;

    const ignoreBtn = document.getElementById('update-ignore-btn');
    if (ignoreBtn) ignoreBtn.style.display = isForced ? 'none' : '';

    modal.dataset.latestVer = latestVer;
    modal.dataset.forced    = isForced ? '1' : '0';
    modal.classList.remove('hidden');
}

function dismissUpdate() {
    const modal = document.getElementById('updateModal');
    if (!modal) return;
    const latestVer = Number(modal.dataset.latestVer || 0);
    if (latestVer) {
        try { localStorage.setItem(UPDATE_VER_KEY, String(latestVer)); } catch (_) {}
    }
    modal.classList.add('hidden');
}

function confirmUpdate() {
    const modal = document.getElementById('updateModal');
    window.location.href="https://rcstudio.zeromi.cn/"
}
