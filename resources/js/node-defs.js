function registerAllNodes() {
    // 清空已注册节点
    for (const k of Object.keys(LiteGraph.registered_node_types)) {
        delete LiteGraph.registered_node_types[k];
    }


    // 快速定义并注册一个节点类型

    function defNode(typeStr, title, buildFn, c, bg) {
        function N() { buildFn.call(this); this.shape = LiteGraph.BOX_SHAPE; }
        N.title = title;
        N.prototype.color = c;
        N.prototype.bgcolor = bg;
        N.prototype.onConfigure = function () {
            if (this.widgets && this.properties) {
                if (this._propKeys) {
                    this._propKeys.forEach((propKey, i) => {
                        if (this.widgets[i] && propKey && this.properties[propKey] != null) {
                            this.widgets[i].value = this.properties[propKey];
                        }
                    });
                } else {
                    this.widgets.forEach(w => {
                        if (w.name && this.properties[w.name] != null) {
                            w.value = this.properties[w.name];
                        }
                    });
                }
            }
            setTimeout(regenerateAll, 80);
        };
        LiteGraph.registerNodeType(typeStr, N);
    }

    function applyOnConfigure(NodeClass) {
        NodeClass.prototype.onConfigure = function () {
            if (this.widgets && this.properties) {
                if (this._propKeys) {
                    this._propKeys.forEach((propKey, i) => {
                        if (this.widgets[i] && propKey && this.properties[propKey] != null) {
                            this.widgets[i].value = this.properties[propKey];
                        }
                    });
                } else {
                    this.widgets.forEach(w => {
                        if (w.name && this.properties[w.name] != null) {
                            w.value = this.properties[w.name];
                        }
                    });
                }
            }
            setTimeout(regenerateAll, 80);
        };
    }

    //  事件节点 

    defNode("events/onEnable", "插件启用", function () {
        this.addOutput("执行流", "exec");
        this.size = [160, 50];
    }, C.evFg, C.evBg);

    defNode("events/onDisable", "插件卸载", function () {
        this.addOutput("执行流", "exec");
        this.size = [160, 50];
    }, C.evFg, C.evBg);

    defNode("events/playerJoin", "玩家加入", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("加入消息", "string");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/playerQuit", "玩家离开", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("离开消息", "string");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/playerDeath", "玩家死亡", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("死亡消息", "string");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/playerChat", "玩家聊天", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("消息内容", "string");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/playerMove", "玩家移动", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.size = [160, 65];
    }, C.evFg, C.evBg);

    defNode("events/playerRespawn", "玩家复活", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.size = [160, 65];
    }, C.evFg, C.evBg);

    defNode("events/playerInteract", "玩家交互", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("点击类型", "string");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/playerLogin", "玩家登录预处理", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("IP地址", "string");
        this.size = [200, 80];
    }, C.evFg, C.evBg);

    defNode("events/blockBreak", "玩家破坏方块", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("方块位置", "location");
        this.addOutput("方块类型", "string");
        this.size = [200, 100];
    }, C.evFg, C.evBg);

    defNode("events/blockPlace", "玩家放置方块", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("方块位置", "location");
        this.addOutput("方块类型", "string");
        this.size = [200, 100];
    }, C.evFg, C.evBg);

    defNode("events/entityDamageByPlayer", "玩家攻击实体", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("实体", "entity");
        this.addOutput("伤害值", "number");
        this.size = [200, 100];
    }, C.evFg, C.evBg);

    defNode("events/playerDamaged", "玩家受到伤害", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("伤害值", "number");
        this.size = [200, 85];
    }, C.evFg, C.evBg);

    defNode("events/playerDropItem", "玩家丢弃物品", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("物品类型", "string");
        this.size = [200, 85];
    }, C.evFg, C.evBg);

    defNode("events/playerPickupItem", "玩家拾取物品", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("物品类型", "string");
        this.size = [200, 85];
    }, C.evFg, C.evBg);

    defNode("events/playerLevelUp", "玩家升级", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("新等级", "number");
        this.size = [180, 85];
    }, C.evFg, C.evBg);

    defNode("events/playerSneak", "玩家切换潜行", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.size = [190, 65];
    }, C.evFg, C.evBg);

    defNode("events/playerSprint", "玩家切换疾跑", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.size = [190, 65];
    }, C.evFg, C.evBg);

    //  指令节点 

    function OnCommandNode() {
        this.addOutput("执行流", "exec");
        this.addOutput("执行者", "player");
        this.addOutput("参数列表", "string");
        this.addProperty("指令名", "test");
        this.addProperty("描述", "一个测试指令");
        this.addProperty("用法", "/test");
        this.addProperty("权限节点", "myplugin.test");
        this.addWidget("text", "指令名", this.properties["指令名"], (v) => {
            this.properties["指令名"] = v;
            setTimeout(regenerateAll, 80);
        });
        this.addWidget("text", "权限节点", this.properties["权限节点"], (v) => {
            this.properties["权限节点"] = v;
            setTimeout(regenerateAll, 80);
        });
        this.size = [220, 100];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    OnCommandNode.title = "注册指令";
    OnCommandNode.prototype.color = C.cmdFg;
    OnCommandNode.prototype.bgcolor = C.cmdBg;
    OnCommandNode.prototype.onConfigure = function () {
        if (this.widgets) {
            this.widgets.forEach(w => {
                if (w.name === "指令名" && this.properties["指令名"] != null) w.value = this.properties["指令名"];
                if (w.name === "权限节点" && this.properties["权限节点"] != null) w.value = this.properties["权限节点"];
            });
        }
        setTimeout(regenerateAll, 80);
    };
    applyOnConfigure(OnCommandNode);
    LiteGraph.registerNodeType("command/onCommand", OnCommandNode);

    defNode("command/sendUsage", "发送用法提示", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("执行者", "player");
        this.addInput("用法", "string");
        this.size = [180, 70];
    }, C.cmdFg, C.cmdBg);

    defNode("command/checkPermission", "检查权限", function () {
        this.addInput("执行流", "exec");
        this.addOutput("有权限", "exec");
        this.addOutput("无权限", "exec");
        this.addInput("玩家", "player");
        this.addInput("权限节点", "string");
        this.size = [210, 100];
    }, C.cmdFg, C.cmdBg);

    //  消息动作 

    defNode("actions/consoleLog", "后台打印", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("内容", "string");
        this.size = [180, 70];
    }, C.actFg, C.actBg);

    defNode("actions/broadcast", "全服广播", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("消息", "string");
        this.size = [180, 70];
    }, C.msgFg, C.msgBg);

    defNode("actions/sendMessage", "发送消息", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("消息", "string");
        this.size = [180, 85];
    }, C.msgFg, C.msgBg);

    defNode("actions/sendTitle", "发送标题", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("标题", "string");
        this.addInput("副标题", "string");
        this.size = [190, 100];
    }, C.msgFg, C.msgBg);

    defNode("actions/sendActionBar", "发送动作栏", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("消息", "string");
        this.size = [190, 85];
    }, C.msgFg, C.msgBg);

    //  玩家操控 

    defNode("player/kick", "踢出玩家", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("原因", "string");
        this.size = [180, 85];
    }, C.plrFg, C.plrBg);

    defNode("player/giveExp", "给予经验", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("经验值", "number");
        this.size = [180, 85];
    }, C.plrFg, C.plrBg);

    function GiveItemNode() {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("物品类型", "string");
        this.addInput("数量", "number");
        this.size = [200, 115];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    GiveItemNode.title = "给予物品";
    GiveItemNode.prototype.color = C.plrFg;
    GiveItemNode.prototype.bgcolor = C.plrBg;
    applyOnConfigure(GiveItemNode);
    LiteGraph.registerNodeType("player/giveItem", GiveItemNode);

    defNode("player/setHealth", "设置血量", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("血量值", "number");
        this.size = [180, 85];
    }, C.plrFg, C.plrBg);

    defNode("player/setFoodLevel", "设置饱食度", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("饱食度", "number");
        this.size = [180, 85];
    }, C.plrFg, C.plrBg);

    defNode("player/teleport", "传送到玩家", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("目标玩家", "player");
        this.size = [190, 85];
    }, C.plrFg, C.plrBg);

    defNode("player/setGameMode", "设置游戏模式", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addProperty("游戏模式", "SURVIVAL");
        this.addWidget("combo", "游戏模式", "SURVIVAL", (v) => { this.properties["游戏模式"] = v; setTimeout(regenerateAll, 80); },
            { values: ["SURVIVAL", "CREATIVE", "ADVENTURE", "SPECTATOR"] });
        this.size = [210, 85];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.plrFg, C.plrBg);

    defNode("player/setFlying", "设置飞行", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addProperty("允许飞行", true);
        this.addWidget("toggle", "允许飞行", true, (v) => { this.properties["允许飞行"] = v; setTimeout(regenerateAll, 80); });
        this.size = [190, 80];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.plrFg, C.plrBg);

    defNode("player/getHealth", "获取血量", function () {
        this.addInput("玩家", "player");
        this.addOutput("血量值", "number");
        this.size = [160, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/getMaxHealth", "获取最大血量", function () {
        this.addInput("玩家", "player");
        this.addOutput("最大血量", "number");
        this.size = [180, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/getLevel", "获取等级", function () {
        this.addInput("玩家", "player");
        this.addOutput("等级", "number");
        this.size = [160, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/getFoodLevel", "获取饱食度", function () {
        this.addInput("玩家", "player");
        this.addOutput("饱食度", "number");
        this.size = [170, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/getLocation", "获取玩家位置", function () {
        this.addInput("玩家", "player");
        this.addOutput("位置", "location");
        this.size = [170, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/isOnline", "检查是否在线", function () {
        this.addInput("玩家名", "string");
        this.addOutput("在线", "boolean");
        this.size = [180, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/getItemInHand", "获取手持物品", function () {
        this.addInput("玩家", "player");
        this.addOutput("物品", "string");
        this.size = [180, 65];
    }, C.plrFg, C.plrBg);

    defNode("player/clearInventory", "清空背包", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.size = [170, 70];
    }, C.plrFg, C.plrBg);

    defNode("player/removeItem", "移除物品", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("物品类型", "string");
        this.addInput("数量", "number");
        this.size = [200, 105];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.plrFg, C.plrBg);

    defNode("player/setLevel", "设置等级", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("等级", "number");
        this.size = [180, 85];
    }, C.plrFg, C.plrBg);

    defNode("player/setMaxHealth", "设置最大血量", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("最大血量", "number");
        this.size = [190, 85];
    }, C.plrFg, C.plrBg);

    defNode("player/teleportToCoords", "传送到坐标", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("位置", "location");
        this.addInput("世界", "string");
        this.size = [240, 95];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.plrFg, C.plrBg);

    defNode("player/playParticle", "播放粒子特效", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("粒子类型", "string");
        this.addInput("数量", "number");
        this.size = [210, 105];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.plrFg, C.plrBg);

    defNode("player/playSound", "播放音效", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("音效", "string");
        this.addInput("音量", "number");
        this.addInput("音调", "number");
        this.size = [240, 120];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.plrFg, C.plrBg);

    //  世界操作 

    defNode("world/setBlock", "设置方块", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("方块类型", "string");
        this.addInput("偏移X", "number");
        this.addInput("偏移Y", "number");
        this.addInput("偏移Z", "number");
        this.size = [220, 130];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    defNode("world/spawnLightning", "生成闪电", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addProperty("效果闪电", true);
        this.addWidget("toggle", "仅特效(不伤害)", true, (v) => { this.properties["效果闪电"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["效果闪电"];
        this.size = [210, 80];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    defNode("world/createExplosion", "创建爆炸", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("威力", "number");
        this.addProperty("点火", false);
        this.addWidget("toggle", "点火", false, (v) => { this.properties["点火"] = v; setTimeout(regenerateAll, 80); });
        this.size = [210, 100];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    defNode("world/setTime", "设置世界时间", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addProperty("时间刻", 6000);
        this.addWidget("combo", "预设时间", "正午", (v) => {
            const map = { "正午": 6000, "日落": 12000, "午夜": 18000, "日出": 23000 };
            this.properties["时间刻"] = map[v] || 6000; setTimeout(regenerateAll, 80);
        }, { values: ["正午", "日落", "午夜", "日出"] });
        this._propKeys = [null];
        this.size = [210, 80];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    defNode("world/setWeather", "设置天气", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addProperty("天气", "晴天");
        this.addWidget("combo", "天气", "晴天", (v) => {
            this.properties["天气"] = v; setTimeout(regenerateAll, 80);
        }, { values: ["晴天", "下雨", "雷暴"] });
        this.size = [200, 75];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    defNode("world/spawnEntity", "生成实体", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("实体类型", "string");
        this.size = [200, 95];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    defNode("world/fillBlocks", "填充区域方块", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("方块类型", "string");
        this.addInput("半径", "number");
        this.size = [220, 105];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.wldFg, C.wldBg);

    //  服务器操作 

    defNode("server/dispatchCommand", "执行控制台指令", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("指令", "string");
        this.size = [200, 70];
    }, C.srvFg, C.srvBg);

    defNode("server/runTaskLater", "延迟执行", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流 (立即)", "exec");
        this.addOutput("执行流 (延迟后)", "exec");
        this.addInput("延迟刻", "number");
        this.size = [230, 95];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.srvFg, C.srvBg);

    defNode("server/runTaskTimer", "重复定时任务", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流 (启动后)", "exec");
        this.addOutput("执行流 (每次触发)", "exec");
        this.addInput("初始延迟", "number");
        this.addInput("间隔刻", "number");
        this.size = [230, 105];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.srvFg, C.srvBg);

    defNode("server/forEachPlayer", "遍历所有在线玩家", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流 (结束后)", "exec");
        this.addOutput("执行流 (每位玩家)", "exec");
        this.addOutput("当前玩家", "player");
        this.size = [230, 100];
    }, C.srvFg, C.srvBg);

    defNode("server/broadcastToOps", "广播给管理员", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("消息", "string");
        this.size = [200, 70];
    }, C.srvFg, C.srvBg);

    defNode("server/getOnlineCount", "获取在线人数", function () {
        this.addOutput("人数", "number");
        this.size = [170, 50];
    }, C.srvFg, C.srvBg);

    defNode("server/kickAll", "踢出所有玩家", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("原因", "string");
        this.size = [190, 70];
    }, C.srvFg, C.srvBg);

    defNode("server/setMotd", "设置服务器MOTD", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("消息", "string");
        this.size = [210, 70];
    }, C.srvFg, C.srvBg);

    //  配置文件 

    defNode("config/saveDefaultConfig", "保存默认配置", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.size = [190, 55];
    }, C.cfgFg, C.cfgBg);

    defNode("config/reloadConfig", "重载配置", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.size = [180, 55];
    }, C.cfgFg, C.cfgBg);

    defNode("config/getString", "读取字符串配置", function () {
        this.addOutput("值", "string");
        this.addProperty("键", "messages.welcome");
        this.addWidget("text", "键名", "messages.welcome", (v) => { this.properties["键"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["键"];
        this.size = [220, 65];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.cfgFg, C.cfgBg);

    defNode("config/getInt", "读取整数配置", function () {
        this.addOutput("值", "number");
        this.addProperty("键", "settings.max-players");
        this.addWidget("text", "键名", "settings.max-players", (v) => { this.properties["键"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["键"];
        this.size = [220, 65];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.cfgFg, C.cfgBg);

    function SetAndSaveNode() {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("值", "string");
        this.addInput("键", "string");
        this.size = [220, 90];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    SetAndSaveNode.title = "写入并保存";
    SetAndSaveNode.prototype.color = C.cfgFg;
    SetAndSaveNode.prototype.bgcolor = C.cfgBg;
    applyOnConfigure(SetAndSaveNode);
    LiteGraph.registerNodeType("config/setAndSave", SetAndSaveNode);

    //  逻辑控制 

    function IfStringEqualNode() {
        this.addInput("执行流", "exec");
        this.addOutput("相等", "exec");
        this.addOutput("不相等", "exec");
        this.addInput("字符串A", "string");
        this.addInput("字符串B", "string");
        this.addProperty("忽略大小写", false);
        this.addWidget("toggle", "忽略大小写", false, (v) => { this.properties["忽略大小写"] = v; setTimeout(regenerateAll, 80); });
        this.size = [210, 110];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    IfStringEqualNode.title = "字符串相等判断";
    IfStringEqualNode.prototype.color = C.lgcFg;
    IfStringEqualNode.prototype.bgcolor = C.lgcBg;
    applyOnConfigure(IfStringEqualNode);
    LiteGraph.registerNodeType("logic/ifStringEqual", IfStringEqualNode);

    function IfNumberCompareNode() {
        this.addInput("执行流", "exec");
        this.addOutput("成立", "exec");
        this.addOutput("不成立", "exec");
        this.addInput("数值A", "number");
        this.addInput("数值B", "number");
        this.addProperty("运算符", ">=");
        this.addWidget("combo", "运算符", ">=", (v) => { this.properties["运算符"] = v; setTimeout(regenerateAll, 80); },
            { values: ["==", "!=", ">", ">=", "<", "<="] });
        this.size = [210, 110];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    IfNumberCompareNode.title = "数值比较判断";
    IfNumberCompareNode.prototype.color = C.lgcFg;
    IfNumberCompareNode.prototype.bgcolor = C.lgcBg;
    applyOnConfigure(IfNumberCompareNode);
    LiteGraph.registerNodeType("logic/ifNumberCompare", IfNumberCompareNode);

    defNode("logic/ifContains", "字符串包含判断", function () {
        this.addInput("执行流", "exec");
        this.addOutput("包含", "exec");
        this.addOutput("不包含", "exec");
        this.addInput("原始字符串", "string");
        this.addInput("子字符串", "string");
        this.size = [220, 100];
    }, C.lgcFg, C.lgcBg);

    defNode("logic/ifPlayerHasPerm", "判断玩家权限", function () {
        this.addInput("执行流", "exec");
        this.addOutput("有权限", "exec");
        this.addOutput("无权限", "exec");
        this.addInput("玩家", "player");
        this.addInput("权限节点", "string");
        this.size = [220, 95];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.lgcFg, C.lgcBg);

    defNode("logic/ifPlayerIsOp", "判断是否为OP", function () {
        this.addInput("执行流", "exec");
        this.addOutput("是OP", "exec");
        this.addOutput("非OP", "exec");
        this.addInput("玩家", "player");
        this.size = [190, 85];
    }, C.lgcFg, C.lgcBg);

    defNode("logic/ifHealthBelow", "判断血量低于", function () {
        this.addInput("执行流", "exec");
        this.addOutput("低于", "exec");
        this.addOutput("不低于", "exec");
        this.addInput("玩家", "player");
        this.addInput("阈值", "number");
        this.size = [210, 95];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.lgcFg, C.lgcBg);

    defNode("logic/ifItemInHand", "判断手持物品", function () {
        this.addInput("执行流", "exec");
        this.addOutput("是", "exec");
        this.addOutput("否", "exec");
        this.addInput("玩家", "player");
        this.addInput("物品类型", "string");
        this.size = [210, 95];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.lgcFg, C.lgcBg);

    function MathOperationNode() {
        this.addInput("数值A", "number");
        this.addInput("数值B", "number");
        this.addOutput("结果", "number");
        this.addProperty("运算", "+");
        this.addWidget("combo", "运算", "+", (v) => { this.properties["运算"] = v; setTimeout(regenerateAll, 80); },
            { values: ["+", "-", "*", "/", "%"] });
        this.size = [180, 80];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    MathOperationNode.title = "数学运算";
    MathOperationNode.prototype.color = C.lgcFg;
    MathOperationNode.prototype.bgcolor = C.lgcBg;
    applyOnConfigure(MathOperationNode);
    LiteGraph.registerNodeType("logic/mathOp", MathOperationNode);

    function StringConcatNode() {
        this.addInput("字符串A", "string");
        this.addInput("字符串B", "string");
        this.addOutput("拼接结果", "string");
        this.size = [190, 70];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    StringConcatNode.title = "字符串拼接";
    StringConcatNode.prototype.color = C.lgcFg;
    StringConcatNode.prototype.bgcolor = C.lgcBg;
    applyOnConfigure(StringConcatNode);
    LiteGraph.registerNodeType("logic/strConcat", StringConcatNode);

    defNode("logic/cancelEvent", "取消事件", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.size = [170, 55];
    }, C.lgcFg, C.lgcBg);

    //  网络请求 

    defNode("network/httpGet", "异步HTTP GET", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流 (发送后)", "exec");
        this.addOutput("执行流 (成功)", "exec");
        this.addOutput("执行流 (失败)", "exec");
        this.addOutput("响应体", "string");
        this.addInput("URL", "string");
        this.size = [220, 120];
    }, C.netFg, C.netBg);

    defNode("network/httpPost", "异步HTTP POST", function () {
        this.addInput("执行流", "exec");
        this.addOutput("执行流 (发送后)", "exec");
        this.addOutput("执行流 (成功)", "exec");
        this.addOutput("执行流 (失败)", "exec");
        this.addOutput("响应体", "string");
        this.addInput("URL", "string");
        this.addInput("请求体", "string");
        this.size = [220, 130];
    }, C.netFg, C.netBg);

    function ParseJsonFieldNode() {
        this.addInput("JSON字符串", "string");
        this.addOutput("字段值", "string");
        this.addProperty("字段名", "name");
        this.addWidget("text", "字段名", "name", (v) => { this.properties["字段名"] = v; setTimeout(regenerateAll, 80); });
        this.size = [210, 70];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    ParseJsonFieldNode.title = "解析JSON字段";
    ParseJsonFieldNode.prototype.color = C.netFg;
    ParseJsonFieldNode.prototype.bgcolor = C.netBg;
    applyOnConfigure(ParseJsonFieldNode);
    LiteGraph.registerNodeType("network/parseJsonField", ParseJsonFieldNode);

    defNode("network/buildJsonObject", "构建JSON对象", function () {
        this.addInput("键1", "string");
        this.addInput("值1", "string");
        this.addInput("键2", "string");
        this.addInput("值2", "string");
        this.addOutput("JSON", "string");
        this.size = [200, 100];
    }, C.netFg, C.netBg);

    //  数据节点 

    function TextNode() {
        this.addOutput("值", "string");
        this.addProperty("text", "Hello World");
        this.addWidget("text", "内容", "Hello World", (v) => {
            this.properties.text = v; setTimeout(regenerateAll, 80);
        });
        this.size = [200, 60];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    TextNode.title = "文本";
    TextNode.prototype.color = C.datFg;
    TextNode.prototype.bgcolor = C.datBg;
    TextNode.prototype._propKeys = ["text"];
    applyOnConfigure(TextNode);
    LiteGraph.registerNodeType("values/text", TextNode);

    function CoordinateNode() {
        this.addOutput("位置", "location");
        this.addInput("世界", "string");
        this.addProperty("coords", "100,64,200");
        this.addWidget("text", "坐标(例:100,64,200)", "100,64,200", (v) => {
            this.properties.coords = v; setTimeout(regenerateAll, 80);
        });
        this.size = [220, 75];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    CoordinateNode.title = "坐标文本";
    CoordinateNode.prototype.color = C.datFg;
    CoordinateNode.prototype.bgcolor = C.datBg;
    CoordinateNode.prototype._propKeys = ["coords"];
    applyOnConfigure(CoordinateNode);
    LiteGraph.registerNodeType("values/coordinate", CoordinateNode);

    function NumberNode() {
        this.addOutput("值", "number");
        this.addProperty("num", 100);
        this.addWidget("number", "数值", 100, (v) => {
            this.properties.num = v; setTimeout(regenerateAll, 80);
        });
        this.size = [180, 60];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    NumberNode.title = "数字";
    NumberNode.prototype.color = C.datFg;
    NumberNode.prototype.bgcolor = C.datBg;
    NumberNode.prototype._propKeys = ["num"];
    applyOnConfigure(NumberNode);
    LiteGraph.registerNodeType("values/number", NumberNode);

    function ColorTextNode() {
        this.addOutput("值", "string");
        this.addProperty("text", "&a绿色文本");
        this.addWidget("text", "内容", "&a绿色文本", (v) => {
            this.properties.text = v; setTimeout(regenerateAll, 80);
        });
        this.size = [220, 60];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    ColorTextNode.title = "颜色文本";
    ColorTextNode.prototype.color = C.datFg;
    ColorTextNode.prototype.bgcolor = C.datBg;
    ColorTextNode.prototype._propKeys = ["text"];
    applyOnConfigure(ColorTextNode);
    LiteGraph.registerNodeType("values/colorText", ColorTextNode);

    function FormatTextNode() {
        this.addOutput("值", "string");
        this.addInput("玩家名", "player");
        this.addProperty("template", "欢迎 {player} 加入！");
        this.addWidget("text", "模板文本", "欢迎 {player} 加入！", (v) => {
            this.properties.template = v; setTimeout(regenerateAll, 80);
        });
        this.size = [240, 70];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    FormatTextNode.title = "格式化文本";
    FormatTextNode.prototype.color = C.datFg;
    FormatTextNode.prototype.bgcolor = C.datBg;
    FormatTextNode.prototype._propKeys = ["template"];
    applyOnConfigure(FormatTextNode);
    LiteGraph.registerNodeType("values/formatText", FormatTextNode);

    function PlayerNameNode() {
        this.addInput("玩家", "player");
        this.addOutput("名字", "string");
        this.size = [160, 50];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    PlayerNameNode.title = "玩家名字";
    PlayerNameNode.prototype.color = C.plrFg;
    PlayerNameNode.prototype.bgcolor = C.plrBg;
    applyOnConfigure(PlayerNameNode);
    LiteGraph.registerNodeType("values/playerName", PlayerNameNode);

    // 获取参数项节点
    function GetArgNode() {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("参数列表", "string");
        this.addInput("索引", "number");
        this.addOutput("参数值", "string");
        this.addProperty("索引", 0);
        this.addWidget("number", "索引", 0, (v) => { this.properties["索引"] = v; setTimeout(regenerateAll, 80); });
        this.size = [200, 90];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    GetArgNode.title = "获取参数项";
    GetArgNode.prototype.color = C.cmdFg;
    GetArgNode.prototype.bgcolor = C.cmdBg;
    GetArgNode.prototype.onConfigure = function () {
        if (this.widgets) {
            this.widgets.forEach(w => {
                if (w.name === "索引" && this.properties["索引"] != null) w.value = this.properties["索引"];
            });
        }
        setTimeout(regenerateAll, 80);
    };
    applyOnConfigure(GetArgNode);
    LiteGraph.registerNodeType("command/getArg", GetArgNode);

    // 根据名字获取玩家节点
    function GetPlayerByNameNode() {
        this.addInput("玩家名", "string");
        this.addOutput("玩家", "player");
        this.size = [190, 50];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    GetPlayerByNameNode.title = "根据名字获取玩家";
    GetPlayerByNameNode.prototype.color = C.plrFg;
    GetPlayerByNameNode.prototype.bgcolor = C.plrBg;
    applyOnConfigure(GetPlayerByNameNode);
    LiteGraph.registerNodeType("player/getByName", GetPlayerByNameNode);

    // 字符串转数字节点
    function StringToNumberNode() {
        this.addInput("字符串", "string");
        this.addOutput("数字", "number");
        this.size = [160, 50];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    StringToNumberNode.title = "字符串转数字";
    StringToNumberNode.prototype.color = C.datFg;
    StringToNumberNode.prototype.bgcolor = C.datBg;
    applyOnConfigure(StringToNumberNode);
    LiteGraph.registerNodeType("convert/stringToNumber", StringToNumberNode);

    function GetArgCountNode() {
        this.addOutput("参数个数", "number");
        this.size = [160, 50];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    GetArgCountNode.title = "参数个数";
    GetArgCountNode.prototype.color = C.cmdFg;
    GetArgCountNode.prototype.bgcolor = C.cmdBg;
    applyOnConfigure(GetArgCountNode);
    LiteGraph.registerNodeType("command/argCount", GetArgCountNode);

    //  变量存储 

    function SetVarNode() {
        this.addInput("执行流", "exec");
        this.addOutput("执行流", "exec");
        this.addInput("值(字符串)", "string");
        this.addInput("值(数字)", "number");
        this.addProperty("变量名", "myVar");
        this.addProperty("类型", "string");
        this.addWidget("text", "变量名", "myVar", (v) => { this.properties["变量名"] = v; setTimeout(regenerateAll, 80); });
        this.addWidget("combo", "值类型", "string", (v) => { this.properties["类型"] = v; setTimeout(regenerateAll, 80); },
            { values: ["string", "number"] });
        this.size = [220, 105];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    SetVarNode.title = "设置变量";
    SetVarNode.prototype.color = C.varFg;
    SetVarNode.prototype.bgcolor = C.varBg;
    SetVarNode.prototype._propKeys = ["变量名", "类型"];
    applyOnConfigure(SetVarNode);
    LiteGraph.registerNodeType("vars/setVar", SetVarNode);

    function GetVarStrNode() {
        this.addOutput("字符串值", "string");
        this.addProperty("变量名", "myVar");
        this.addWidget("text", "变量名", "myVar", (v) => { this.properties["变量名"] = v; setTimeout(regenerateAll, 80); });
        this.size = [200, 65];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    GetVarStrNode.title = "获取字符串变量";
    GetVarStrNode.prototype.color = C.varFg;
    GetVarStrNode.prototype.bgcolor = C.varBg;
    applyOnConfigure(GetVarStrNode);
    LiteGraph.registerNodeType("vars/getVarStr", GetVarStrNode);

    function GetVarNumNode() {
        this.addOutput("数字值", "number");
        this.addProperty("变量名", "myVar");
        this.addWidget("text", "变量名", "myVar", (v) => { this.properties["变量名"] = v; setTimeout(regenerateAll, 80); });
        this.size = [200, 65];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    GetVarNumNode.title = "获取数字变量";
    GetVarNumNode.prototype.color = C.varFg;
    GetVarNumNode.prototype.bgcolor = C.varBg;
    applyOnConfigure(GetVarNumNode);
    LiteGraph.registerNodeType("vars/getVarNum", GetVarNumNode);

    //  类型转换

    defNode("convert/numToStr", "数字转字符串", function () {
        this.addInput("数值", "number");
        this.addOutput("字符串", "string");
        this.size = [190, 55];
    }, C.cvtFg, C.cvtBg);

    defNode("convert/strToPlayer", "字符串获取玩家", function () {
        this.addInput("玩家名", "string");
        this.addOutput("玩家", "player");
        this.size = [190, 55];
    }, C.cvtFg, C.cvtBg);

    defNode("convert/numToInt", "数字取整", function () {
        this.addInput("数值", "number");
        this.addOutput("整数", "number");
        this.size = [170, 55];
    }, C.cvtFg, C.cvtBg);

    defNode("convert/playerToName", "玩家转名字", function () {
        this.addInput("玩家", "player");
        this.addOutput("名字", "string");
        this.size = [170, 55];
    }, C.cvtFg, C.cvtBg);

    defNode("convert/numAbsVal", "数字绝对值", function () {
        this.addInput("数值", "number");
        this.addOutput("绝对值", "number");
        this.size = [170, 55];
    }, C.cvtFg, C.cvtBg);

    defNode("convert/locationToStr", "坐标转字符串", function () {
        this.addInput("位置", "location");
        this.addOutput("字符串", "string");
        this.size = [190, 55];
    }, C.cvtFg, C.cvtBg);

    defNode("convert/strToLocation", "字符串转坐标", function () {
        this.addInput("字符串", "string");
        this.addInput("世界", "string");
        this.addOutput("位置", "location");
        this.size = [190, 80];
    }, C.cvtFg, C.cvtBg);

    // 类型判断节点
    function CheckTypeNode() {
        this.addInput("执行流", "exec");
        this.addInput("待检查字符串", "string");
        this.addOutput("成功", "exec");
        this.addOutput("失败", "exec");
        this.addProperty("类型", "数字");
        this.addWidget("combo", "类型", "数字", (v) => {
            this.properties["类型"] = v;
            setTimeout(regenerateAll, 80);
        }, { values: ["数字", "整数", "非空字符串"] });
        this.size = [220, 90];
        this.shape = LiteGraph.BOX_SHAPE;
    }
    CheckTypeNode.title = "类型判断";
    CheckTypeNode.prototype.color = C.lgcFg;
    CheckTypeNode.prototype.bgcolor = C.lgcBg;
    applyOnConfigure(CheckTypeNode);
    LiteGraph.registerNodeType("logic/checkType", CheckTypeNode);

    //  === GUI / 物品栏交互节点 ===

    defNode("gui/openChest", "打开箱子GUI", function () {
        this.addInput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("标题", "string");
        this.addOutput("执行流", "exec");
        this.addProperty("行数", "3");
        this.addWidget("combo", "行数", "3", (v) => { this.properties["行数"] = v; setTimeout(regenerateAll, 80); },
            { values: ["1", "2", "3", "4", "5", "6"] });
        this._propKeys = ["行数"];
        this.size = [200, 85];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.guiFg, C.guiBg);

    defNode("gui/setSlot", "设置GUI槽位", function () {
        this.addInput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("物品类型", "string");
        this.addInput("物品", "object");
        this.addOutput("执行流", "exec");
        this.addProperty("槽位", 0);
        this.addWidget("number", "槽位", 0, (v) => { this.properties["槽位"] = v; setTimeout(regenerateAll, 80); });
        this.addProperty("数量", 1);
        this.addWidget("number", "数量", 1, (v) => { this.properties["数量"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["槽位", "数量"];
        this.size = [200, 110];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.guiFg, C.guiBg);

    defNode("events/inventoryClick", "GUI点击事件", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("槽位", "number");
        this.addOutput("物品", "string");
        this.size = [180, 110];
    }, C.evFg, C.evBg);

    defNode("events/inventoryClose", "GUI关闭事件", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.size = [180, 65];
    }, C.evFg, C.evBg);

    //  === Vault 经济节点 ===

    defNode("vault/getBalance", "获取余额", function () {
        this.addInput("玩家", "player");
        this.addOutput("余额", "number");
        this.size = [160, 65];
    }, C.vltFg, C.vltBg);

    defNode("vault/withdraw", "扣除金币", function () {
        this.addInput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("金额", "number");
        this.addOutput("执行流", "exec");
        this.size = [190, 85];
    }, C.vltFg, C.vltBg);

    defNode("vault/deposit", "给予金币", function () {
        this.addInput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("金额", "number");
        this.addOutput("执行流", "exec");
        this.size = [190, 85];
    }, C.vltFg, C.vltBg);

    //  === 物品 Meta 操作节点 ===

    defNode("item/createBuilder", "创建物品", function () {
        this.addInput("物品类型", "string");
        this.addOutput("物品", "object");
        this.addProperty("数量", 1);
        this.addWidget("number", "数量", 1, (v) => { this.properties["数量"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["数量"];
        this.size = [190, 80];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.itmFg, C.itmBg);

    defNode("item/setDisplayName", "设置物品名", function () {
        this.addInput("物品", "object");
        this.addInput("名称", "string");
        this.addOutput("物品", "object");
        this.size = [180, 80];
    }, C.itmFg, C.itmBg);

    defNode("item/addEnchant", "添加附魔", function () {
        this.addInput("物品", "object");
        this.addOutput("物品", "object");
        this.addProperty("附魔", "SHARPNESS");
        this.addWidget("combo", "附魔", "SHARPNESS", (v) => { this.properties["附魔"] = v; setTimeout(regenerateAll, 80); },
            { values: ["SHARPNESS", "PROTECTION", "FIRE_ASPECT", "KNOCKBACK", "EFFICIENCY", "UNBREAKING", "FORTUNE", "SILK_TOUCH"] });
        this.addProperty("等级", 1);
        this.addWidget("number", "等级", 1, (v) => { this.properties["等级"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["附魔", "等级"];
        this.size = [190, 100];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.itmFg, C.itmBg);

    //  === 补充事件节点 ===

    defNode("events/playerCommand", "玩家执行指令", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("指令", "string");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/projectileHit", "投掷物命中", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("实体", "string");
        this.size = [170, 65];
    }, C.evFg, C.evBg);

    defNode("events/entityDeath", "实体死亡", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("实体类型", "string");
        this.size = [180, 65];
    }, C.evFg, C.evBg);

    defNode("events/foodLevelChange", "饱食度变化", function () {
        this.addOutput("执行流", "exec");
        this.addOutput("玩家", "player");
        this.addOutput("新饱食度", "number");
        this.size = [180, 80];
    }, C.evFg, C.evBg);

    defNode("events/portalCreate", "传送门创建", function () {
        this.addOutput("执行流", "exec");
        this.size = [160, 50];
    }, C.evFg, C.evBg);

    //  === Scoreboard 节点 ===

    defNode("scoreboard/setObjective", "设置计分板目标", function () {
        this.addInput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("标题", "string");
        this.addOutput("执行流", "exec");
        this.addProperty("显示名称", "分数");
        this.addWidget("text", "显示名称", "分数", (v) => { this.properties["显示名称"] = v; setTimeout(regenerateAll, 80); });
        this._propKeys = ["显示名称"];
        this.size = [210, 90];
        this.shape = LiteGraph.BOX_SHAPE;
    }, C.scbFg, C.scbBg);

    defNode("scoreboard/setScore", "设置分数", function () {
        this.addInput("执行流", "exec");
        this.addInput("玩家", "player");
        this.addInput("目标", "string");
        this.addInput("条目", "string");
        this.addInput("分数", "number");
        this.addOutput("执行流", "exec");
        this.size = [210, 110];
    }, C.scbFg, C.scbBg);

    //  端口颜色配置 
    LiteGraph.slot_types_default_out = LiteGraph.slot_types_default_out || {};
    LiteGraph.slot_types_default_out["exec"] = { color_off: "#ffaa00", color_on: "#ffcc44" };
    LiteGraph.slot_types_default_out["string"] = { color_off: "#4caf50", color_on: "#66bb6a" };
    LiteGraph.slot_types_default_out["player"] = { color_off: "#00bcd4", color_on: "#4dd0e1" };
    LiteGraph.slot_types_default_out["number"] = { color_off: "#ff9800", color_on: "#ffb74d" };
    LiteGraph.slot_types_default_out["location"] = { color_off: "#26c6da", color_on: "#80deea" };
    LiteGraph.slot_types_default_out["boolean"] = { color_off: "#ec407a", color_on: "#f48fb1" };
    LiteGraph.slot_types_default_out["entity"] = { color_off: "#ef5350", color_on: "#ef9a9a" };
}