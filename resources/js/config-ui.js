// 添加一条新的配置项并刷新 UI
function addConfigEntry() {
    configEntries.push({ key: "settings.new-key", value: "defaultValue" });
    renderConfigEntries();
    regenerateAll();
}

// 删除指定索引的配置项并刷新 UI
function removeConfigEntry(idx) {
    configEntries.splice(idx, 1);
    renderConfigEntries();
    regenerateAll();
}

// 从后端加载已记录的 Java 环境列表并渲染到「Java 环境」区块
async function loadJavaHomes() {
    try {
        const resp = await fetch('/api/java-homes');
        if (!resp.ok) return;
        const data = await resp.json();
        renderJavaHomes(data.javaHomes || []);
    } catch (e) {
        console.warn('加载 Java 环境失败', e);
    }
}

// 渲染 Java 环境列表，并同步 Java 版本下拉框（加入已检测的版本）
function renderJavaHomes(homes) {
    const list = document.getElementById('javaHomesList');
    const status = document.getElementById('javaHomeStatus');
    if (!list) return;

    list.innerHTML = '';
    if (!homes || homes.length === 0) {
        list.innerHTML = '<div class="text-xs text-gray-400">尚未添加 Java 环境。</div>';
        if (status) status.textContent = '';
        return;
    }

    // 同步 Java 版本下拉框：加入已添加的版本（去重，不覆盖用户已选）
    const sel = document.getElementById('javaVersion');
    const currentVal = sel ? sel.value : '';
    const existing = sel ? new Set([...sel.options].map(o => o.value)) : new Set();
    if (sel) {
        const sorted = [...homes].sort((a, b) => a.version - b.version);
        for (const h of sorted) {
            const v = String(h.version);
            if (!existing.has(v)) {
                const opt = document.createElement('option');
                opt.value = v;
                opt.textContent = 'Java ' + v;
                sel.appendChild(opt);
                existing.add(v);
            }
        }
        if (sel.value && ![...sel.options].some(o => o.value === currentVal)) {
            // 用户之前选择的值仍保留
        } else {
            sel.value = currentVal;
        }
    }

    // 渲染每条 Java 记录
    const sortedHomes = [...homes].sort((a, b) => a.version - b.version);
    sortedHomes.forEach(h => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1.5';

        const badge = document.createElement('span');
        badge.className = 'text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5';
        badge.textContent = 'Java ' + h.version;
        row.appendChild(badge);

        const path = document.createElement('span');
        path.className = 'text-xs text-gray-600 flex-1 truncate';
        path.textContent = h.path;
        path.title = h.path;
        row.appendChild(path);

        const del = document.createElement('button');
        del.className = 'text-xs text-red-500 hover:text-red-700 font-bold px-2';
        del.textContent = '删除';
        del.onclick = () => removeJavaHome(h.path);
        row.appendChild(del);

        list.appendChild(row);
    });
    if (status) status.textContent = '共 ' + homes.length + ' 个 Java 环境';
}

// 通用：将指定路径添加到 Java 环境（调用后端检测版本）
async function addJavaHomePath(path, status) {
    try {
        const addResp = await fetch('/api/add-java', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        const data = await addResp.json();
        if (data.error) {
            if (status) status.textContent = data.error;
            return false;
        }
        renderJavaHomes(data.javaHomes || []);
        if (status) status.textContent = '已添加';
        return true;
    } catch (err) {
        if (status) status.textContent = '添加失败：' + err.message;
        return false;
    }
}

// 点击「浏览…」：尝试调用系统目录选择框，选中的路径填入输入框并添加
async function browseJavaHome() {
    const status = document.getElementById('javaHomeStatus');
    if (status) status.textContent = '请在弹出的窗口中选择 JDK 目录…';

    try {
        const pickResp = await fetch('/api/pick-java-dir', { method: 'POST' });
        if (!pickResp.ok) throw new Error('无法打开目录选择框');
        const picked = await pickResp.json();
        if (picked.cancelled || !picked.path) {
            if (status) status.textContent = '';
            return; // 用户取消
        }
        // 把选中的路径填入输入框
        const input = document.getElementById('javaPathInput');
        if (input) input.value = picked.path;
        await addJavaHomePath(picked.path, status);
    } catch (err) {
        // 平台不支持弹框时，提示用户手动输入
        if (status) status.textContent = '无法打开目录选择框（当前平台可能不支持），请手动输入路径后点「添加」。';
    }
}

// 点击「添加」：读取输入框中的路径并添加
async function addJavaHomeFromInput() {
    const input = document.getElementById('javaPathInput');
    const status = document.getElementById('javaHomeStatus');
    if (!input) return;
    const path = (input.value || '').trim();
    if (!path) {
        if (status) status.textContent = '请输入 JDK 目录路径。';
        return;
    }
    await addJavaHomePath(path, status);
}

// 删除一个已记录的 Java 环境
async function removeJavaHome(path) {
    const status = document.getElementById('javaHomeStatus');
    try {
        const resp = await fetch('/api/remove-java', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        const data = await resp.json();
        renderJavaHomes(data.javaHomes || []);
        if (status) status.textContent = '已删除';
    } catch (err) {
        if (status) status.textContent = '删除失败：' + err.message;
    }
}

// 页面加载后，加载已记录的 Java 环境
document.addEventListener('DOMContentLoaded', function () {
    if (typeof loadJavaHomes === 'function') {
        loadJavaHomes();
    }
    if (typeof applyFoliaVersionRestriction === 'function') {
        applyFoliaVersionRestriction();
    }
});

// Folia 端仅支持 MC 1.19~26.2。开启 Folia 时，禁用低于 1.19 的版本选项。
// Folia 主版本号最小为 1.19（19），旧命名 1.x；新命名如 26.2 直接解析为 26。
function parseVersionNum(val) {
    // 取首个数字段；如 "1.16" → 1，"26.2" → 26，"1.16.5-R0.1" → 1
    const m = String(val).match(/^(\d+)\.(\d+)/);
    if (!m) return Number(String(val).match(/^\d+/)?.[0] || 0);
    // 旧命名 1.x：主版本 = x（如 1.19 → 19）
    if (m[1] === '1') return Number(m[2]);
    // 新命名年份版本：直接用大版本（如 26.2 → 26）
    return Number(m[1]);
}

function applyFoliaVersionRestriction() {
    const folia = document.getElementById('foliaMode');
    const isFolia = folia ? folia.checked : false;
    const minVer = 19; // Folia 最低支持 1.19

    // 禁用游戏版本（apiVersion）中低于 1.19 的选项
    const apiSel = document.getElementById('apiVersion');
    if (apiSel) {
        for (const opt of apiSel.options) {
            const v = parseVersionNum(opt.value);
            if (v > 0 && v < minVer) {
                opt.disabled = isFolia;
            }
        }
        // 若当前选中了被禁用的版本，自动切回最近的可选版本
        if (isFolia) {
            const cur = parseVersionNum(apiSel.value);
            if (cur > 0 && cur < minVer) {
                const valid = [...apiSel.options].filter(o => !o.disabled);
                if (valid.length > 0) apiSel.value = valid[valid.length - 1].value;
            }
        }
    }

    // 禁用 Spigot/Paper 依赖版本（spigotVersion）中低于 1.19 的选项。
    // 注意：不修改下拉框 value（保持原格式），Folia 模式下的 Paper API 版本
    // 由 codegen 生成 pom 时根据游戏版本（apiVersion）映射。
    const spigotSel = document.getElementById('spigotVersion');
    if (spigotSel) {
        for (const opt of spigotSel.options) {
            const v = parseVersionNum(opt.value);
            if (v > 0 && v < minVer) {
                opt.disabled = isFolia;
            }
        }
        if (isFolia) {
            const cur = parseVersionNum(spigotSel.value);
            if (cur > 0 && cur < minVer) {
                const valid = [...spigotSel.options].filter(o => !o.disabled);
                if (valid.length > 0) spigotSel.value = valid[valid.length - 1].value;
            }
        }
    }
}

// 将 configEntries 渲染为可编辑的表单行
function renderConfigEntries() {
    const container = document.getElementById('config-entries');
    if (!container) return;
    container.innerHTML = '';
    configEntries.forEach((e, i) => {
        const row = document.createElement('div');
        row.className = 'flex gap-2 items-center';

        const keyInput = document.createElement('input');
        keyInput.className = 'cfg-input flex-1';
        keyInput.style.fontSize = '12px';
        keyInput.placeholder = '键名';
        keyInput.value = e.key;
        keyInput.addEventListener('input', () => {
            configEntries[i].key = keyInput.value;
            regenerateAll();
        });

        const valInput = document.createElement('input');
        valInput.className = 'cfg-input flex-1';
        valInput.style.fontSize = '12px';
        valInput.placeholder = '默认值';
        valInput.value = e.value;
        valInput.addEventListener('input', () => {
            configEntries[i].value = valInput.value;
            regenerateAll();
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'text-red-400 hover:text-red-600 text-xs font-bold px-2';
        delBtn.textContent = '删除';
        delBtn.addEventListener('click', () => removeConfigEntry(i));

        row.appendChild(keyInput);
        row.appendChild(valInput);
        row.appendChild(delBtn);
        container.appendChild(row);
    });
}