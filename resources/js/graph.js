// 常用节点记录（localStorage）
const NODE_USAGE_KEY = 'node_usage_stats';

function getNodeUsageStats() {
    try {
        return JSON.parse(localStorage.getItem(NODE_USAGE_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

function saveNodeUsageStats(stats) {
    try {
        localStorage.setItem(NODE_USAGE_KEY, JSON.stringify(stats));
    } catch (e) {}
}

function recordNodeUsage(nodeType) {
    const stats = getNodeUsageStats();
    stats[nodeType] = (stats[nodeType] || 0) + 1;
    saveNodeUsageStats(stats);
}

function getMostUsedNodes(limit = 10) {
    const stats = getNodeUsageStats();
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([type]) => type);
}

function initLiteGraph() {
    if (typeof LiteGraph === 'undefined') { setTimeout(initLiteGraph, 100); return; }

    registerAllNodes();

    const graph = new LiteGraph.LGraph();
    litegraphGraph = graph;

    const container = document.getElementById('blocklyDiv');
    container.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.id = 'lg-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;';
    container.appendChild(canvas);

    function doResize() {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || (window.innerHeight - 56);
        canvas.width = w; canvas.height = h;
        if (litegraphCanvas) litegraphCanvas.resize(w, h);
    }
    doResize();
    window.addEventListener('resize', doResize);

    const lgc = new LiteGraph.LGraphCanvas(canvas, graph);
    litegraphCanvas = lgc;
    lgc.background_image = null;
    lgc.clear_background_color = "#181b27";

    // 启用网格吸附（帮助节点对齐）
    lgc.align_to_grid = true;
    lgc.grid_size = 20; // 网格大小为 20px
    lgc.draw_grid = true; // 显示网格线
    lgc.grid_color = "#1e2230"; // 网格线颜色（淡色）

    // 中文分类名称映射
    const CN_CATEGORY = {
        "events":  "<i class=\"fa-regular fa-calendar\"></i> 事件节点",
        "command": "<i class=\"fa-solid fa-terminal\"></i> 指令节点",
        "actions": "<i class=\"fa-solid fa-envelope\"></i> 消息动作",
        "player":  "<i class=\"fa-solid fa-user\"></i> 玩家操控",
        "world":   "<i class=\"fa-solid fa-globe\"></i> 世界操作",
        "server":  "<i class=\"fa-solid fa-server\"></i> 服务器操作",
        "logic":   "<i class=\"fa-solid fa-cogs\"></i> 逻辑控制",
        "network": "<i class=\"fa-solid fa-network-wired\"></i> 网络请求",
        "config":  "<i class=\"fa-solid fa-gear\"></i> 配置文件",
        "values":  "<i class=\"fa-solid fa-database\"></i> 数据节点",
        "vars":    "<i class=\"fa-solid fa-box-archive\"></i> 变量存储",
        "convert": "<i class=\"fa-solid fa-shuffle\"></i> 类型转换",
    };

    // 右键菜单
    function openAddNodeMenu(event, prev_menu) {
        const cats = {};
        for (const type of Object.keys(LiteGraph.registered_node_types)) {
            const cat = type.split('/')[0];
            if (!cats[cat]) cats[cat] = [];
            cats[cat].push(type);
        }

        // 构建分类菜单项
        const catItems = [];

        // 添加"常用节点"分类（优先显示）
        const mostUsed = getMostUsedNodes(10);
        if (mostUsed.length > 0) {
            catItems.push({
                content: "<i class=\"fa-solid fa-star\"></i> 常用节点",
                has_submenu: true,
                callback: (_v, _opts, ev, prev) => {
                    const nodeItems = mostUsed.map(type => ({
                        content: LiteGraph.registered_node_types[type]?.title || type,
                        callback: () => {
                            recordNodeUsage(type);
                            const node = LiteGraph.createNode(type);
                            if (!node) return;
                            const rect = canvas.getBoundingClientRect();
                            const x = (event.clientX - rect.left) / lgc.ds.scale - lgc.ds.offset[0];
                            const y = (event.clientY - rect.top)  / lgc.ds.scale - lgc.ds.offset[1];
                            node.pos = [x, y];
                            graph.add(node);
                        }
                    }));
                    new LiteGraph.ContextMenu(nodeItems, { event: ev, parentMenu: prev });
                }
            });
            catItems.push(null); // 分隔线
        }

        // 添加其他分类
        Object.keys(cats).forEach(cat => {
            catItems.push({
                content: CN_CATEGORY[cat] || cat,
                has_submenu: true,
                callback: (_v, _opts, ev, prev) => {
                    const nodeItems = cats[cat].map(type => ({
                        content: LiteGraph.registered_node_types[type].title || type,
                        callback: () => {
                            recordNodeUsage(type);
                            const node = LiteGraph.createNode(type);
                            if (!node) return;
                            const rect = canvas.getBoundingClientRect();
                            const x = (event.clientX - rect.left) / lgc.ds.scale - lgc.ds.offset[0];
                            const y = (event.clientY - rect.top)  / lgc.ds.scale - lgc.ds.offset[1];
                            node.pos = [x, y];
                            graph.add(node);
                        }
                    }));
                    new LiteGraph.ContextMenu(nodeItems, { event: ev, parentMenu: prev });
                }
            });
        });

        new LiteGraph.ContextMenu(catItems, { event, parentMenu: prev_menu });
    }

    // 画布空白区右键菜单
    lgc.getMenuOptions = function () {
        return [
            {
                content: "<i class=\"fa-solid fa-plus\"></i> 添加节点",
                has_submenu: true,
                callback: (_v, _opts, ev, prev) => openAddNodeMenu(ev, prev)
            },
            null,
            {
                content: "适应全部节点",
                callback: () => { lgc.ds.reset(); lgc.setDirty(true, true); }
            },
            {
                content: "清空画布",
                callback: () => {
                    if (confirm("确定清空画布上的所有节点？此操作不可撤销。")) {
                        graph.clear();
                        regenerateAll();
                    }
                }
            }
        ];
    };

    // 节点右键菜单
    lgc.getNodeMenuOptions = function (node) {
        return [
            { content: "克隆节点", callback: () => { const c = node.clone(); c.pos = [node.pos[0] + 30, node.pos[1] + 30]; graph.add(c); } },
            null,
            { content: "删除节点", callback: () => graph.remove(node) },
        ];
    };

    graph.start();

    // 保存当前图状态到撤销栈
    function pushUndoState() {
        if (_isUndoing) return;
        const snapshot = JSON.stringify(graph.serialize());
        _undoStack.push(snapshot);
        if (_undoStack.length > _MAX_UNDO) _undoStack.shift();
        _redoStack = []; // 新操作清空重做栈
    }

    function undoGraph() {
        if (_undoStack.length === 0) return;
        const current = JSON.stringify(graph.serialize());
        const prev = _undoStack.pop();
        _redoStack.push(current);
        _isUndoing = true;
        graph.configure(JSON.parse(prev));
        _isUndoing = false;
        regen();
    }

    function redoGraph() {
        if (_redoStack.length === 0) return;
        const current = JSON.stringify(graph.serialize());
        const next = _redoStack.pop();
        _undoStack.push(current);
        _isUndoing = true;
        graph.configure(JSON.parse(next));
        _isUndoing = false;
        regen();
    }

    // 节点变化时延迟重新生成代码
    const regen = () => setTimeout(regenerateAll, 80);
    const saveAndRegen = () => { pushUndoState(); regen(); };
    graph.onNodeAdded        = saveAndRegen;
    graph.onNodeRemoved      = saveAndRegen;
    graph.onConnectionChange = saveAndRegen;

    // 拖拽放置节点到画布
    const blocklyDiv = document.getElementById('blocklyDiv');
    blocklyDiv.addEventListener('dragover', e => e.preventDefault());
    blocklyDiv.addEventListener('drop', e => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData('nodeType');
        if (!nodeType) return;
        recordNodeUsage(nodeType); // 记录节点使用频率
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / lgc.ds.scale - lgc.ds.offset[0];
        const y = (e.clientY - rect.top)  / lgc.ds.scale - lgc.ds.offset[1];
        const node = LiteGraph.createNode(nodeType);
        if (node) { node.pos = [x, y]; graph.add(node); }
    });

    document.querySelectorAll('.node-item[draggable]').forEach(el => {
        el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('nodeType', el.dataset.node);
        });
    });

    // 放置默认起始节点
    setTimeout(() => {
        const node = LiteGraph.createNode("events/onEnable");
        node.pos = [100, 140];
        graph.add(node);
        regenerateAll();
    }, 200);

    // 绑定撤销/重做快捷键
    document.addEventListener('keydown', function(e) {
        const isCtrl = e.ctrlKey || e.metaKey;
        if (isCtrl && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            undoGraph();
        } else if (isCtrl && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
            e.preventDefault();
            redoGraph();
        }
    });
}
