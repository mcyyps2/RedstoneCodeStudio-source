const ANNOUNCE_API          = 'https://api.zeromi.cn/api/market/announce.php';
const ANNOUNCE_DISMISS_KEY  = 'rcs_announce_dismiss_hash';

async function initAnnounce() {
    if (typeof isOnlineMode === 'function' && !isOnlineMode()) return;

    try {
        const r = await fetch(ANNOUNCE_API);
        if (!r.ok) return;
        const data = await r.json();
        if (!data || !data.content) return;
        _handleAnnounce(data);
    } catch (_) {
    }
}

function _handleAnnounce(data) {
    const content = String(data.content || '').trim();
    if (!content) return;

    const contentHash = _hashStr(content);
    try {
        const dismissed = localStorage.getItem(ANNOUNCE_DISMISS_KEY);
        if (dismissed === contentHash) return;
    } catch (_) {}

    _showAnnounceModal(content, contentHash);
}

function _showAnnounceModal(htmlContent, contentHash) {
    const modal = document.getElementById('announceModal');
    if (!modal) return;

    const bodyEl = document.getElementById('announce-body');
    if (bodyEl) bodyEl.innerHTML = htmlContent;

    modal.dataset.contentHash = contentHash;
    modal.classList.remove('hidden');
}

function closeAnnounce() {
    const modal = document.getElementById('announceModal');
    if (modal) modal.classList.add('hidden');
}

function dismissAnnounce() {
    const modal = document.getElementById('announceModal');
    if (!modal) return;
    const hash = modal.dataset.contentHash || '';
    if (hash) {
        try { localStorage.setItem(ANNOUNCE_DISMISS_KEY, hash); } catch (_) {}
    }
    modal.classList.add('hidden');
}

function _hashStr(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i);
        h = h >>> 0;
    }
    return h.toString(36);
}
