# RedstoneCode Studio 改进实施计划

> 生成时间：2026-08-15  
> 当前版本：v1.3.32  
> 分析基于：main.go (1456行) / node-defs.js (1095行) / codegen.js (1396行) / index.html (2870行)

---

## 一、节点功能补全（当前 82 个节点）

### [P0] 1.1 GUI / 物品栏交互节点
- **工作量**：大
- **缺失原因**：GUI 插件是 MC 插件最大品类（菜单/商店/背包整理），当前完全无覆盖
- **需新增节点**：
  - `inventory/openChest` — 打开虚拟箱子 GUI（支持行数、标题）
  - `events/inventoryClick` — GUI 点击事件（获取槽位、物品）
  - `inventory/setSlot` — 设置 GUI 槽位物品
  - `events/inventoryClose` — GUI 关闭事件
- **涉及文件**：`node-defs.js`（节点定义）、`codegen.js`（代码生成）、`index.html`（左侧节点面板 HTML）

### [P0] 1.2 PlaceholderAPI / Vault 集成节点
- **工作量**：中
- **缺失原因**：正式服务器基础设施，缺少则插件几乎无法实用
- **需新增节点**：
  - `hook/vaultGetBalance` — 获取玩家经济余额
  - `hook/vaultWithdraw` — 扣款
  - `hook/vaultDeposit` — 存款
  - `hook/placeholderAPI` — 解析 PAPI 占位符
- **代码生成注意**：需要生成 hook 检测代码（`Bukkit.getPluginManager().getPlugin("Vault") != null`），plugin.yml 中自动添加 `depend: [Vault]`
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

### [P1] 1.3 Scoreboard 计分板节点
- **工作量**：中
- **需新增节点**：
  - `player/setScoreboard` — 设置玩家计分板
  - `scoreboard/createTeam` — 创建队伍
  - `scoreboard/setObjective` — 设置目标行
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

### [P1] 1.4 物品 NBT / Meta 操作节点
- **工作量**：大
- **需新增节点**：
  - `item/createBuilder` — 创建物品构建器（Material 类型选择）
  - `item/addEnchant` — 添加附魔
  - `item/setDisplayName` — 设置自定义名称
  - `item/setLore` — 设置 Lore
  - `item/setCustomModelData` — 自定义模型数据（1.14+）
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

### [P1] 1.5 补充缺失事件节点
- **工作量**：中
- **需新增节点**：
  - `events/playerCommand` — 玩家执行指令预处理（`PlayerCommandPreprocessEvent`）
  - `events/serverCommand` — 服务器指令预处理（`ServerCommandEvent`）
  - `events/projectileHit` — 投掷物命中事件
  - `events/entityDeath` — 实体死亡事件（非玩家）
  - `events/blockRedstone` — 红石信号事件
  - `events/portalCreate` — 传送门创建事件
  - `events/foodLevelChange` — 饱食度变化事件
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

### [P2] 1.6 数据持久化节点
- **工作量**：中
- **需新增节点**：
  - `data/setPersistent` — 写入持久化数据（PersistentDataContainer，1.14+）
  - `data/getPersistent` — 读取持久化数据
  - `config/getBoolean` — 读取布尔配置
  - `config/getDouble` — 读取浮点配置
  - `config/getList` — 读取列表配置
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

### [P2] 1.7 世界获取类节点
- **工作量**：小
- **需新增节点**：
  - `world/getByName` — 根据名称获取世界
  - `world/getSpawnLocation` — 获取世界出生点
  - `world/getEntities` — 获取世界实体
  - `world/getTime` — 获取世界时间
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

---

## 二、用户体验优化

### [P0] 2.1 代码生成与编辑器手动修改冲突
- **工作量**：大
- **问题**：`main.js:38-42` 所有编辑器设为可编辑，但 `regenerateAll()` 每次节点变化都会覆盖用户修改
- **方案**：
  - 增加"锁定代码"按钮：锁定后停止自动覆盖，解锁后重新生成
  - 或增加 diff 提示：检测到用户手动修改时弹窗确认是否覆盖
- **涉及文件**：`main.js`、`ui.js`、`index.html`（按钮 HTML）

### [P0] 2.2 撤销/重做功能
- **工作量**：中
- **问题**：LiteGraph.js 无 undo/redo，节点误删误连无法恢复
- **方案**：
  - 在 `graph.onNodeAdded/onNodeRemoved/onConnectionChange` 时保存 JSON 快照
  - 维护操作历史栈（最近 50 步）
  - 绑定 `Ctrl+Z` / `Ctrl+Y` 快捷键
  - `main.js:2-13` 的快捷键拦截中放行 Ctrl+Z/Y
- **涉及文件**：`graph.js`、`main.js`（快捷键放行）、`index.html`（按钮 HTML）

### [P1] 2.3 编译错误提示优化
- **工作量**：中
- **问题**：`compile.js:87` 直接显示 Maven 原始错误，小白不可读
- **方案**：
  - 解析常见 Maven 错误模式：
    - `cannot find symbol` → "某节点生成的代码引用了不存在的 API"
    - `Could not resolve dependencies` → "依赖下载失败，请检查网络或更换 API 版本"
    - `Compilation failure` → "Java 代码语法错误"
  - 增加错误分类标签（依赖/语法/版本/超时）
  - 提供"复制错误信息"按钮
- **涉及文件**：`compile.js`

### [P1] 2.4 节点搜索优化
- **工作量**：小
- **方案**：
  - 收藏/常用节点置顶
  - 搜索结果显示分类标签
  - 最近使用的节点历史（最近 10 个）
- **涉及文件**：`ui.js`、`index.html`

### [P1] 2.5 画布辅助功能
- **工作量**：中
- **方案**：
  - 小地图/minimap（画布大时导航）
  - 节点对齐辅助线
  - 节点分组/注释框（复杂逻辑标注）
  - `Ctrl+S` 拦截后增加自动保存提示（`main.js:12` 当前直接吞掉）
- **涉及文件**：`graph.js`、`main.js`、`index.html`

### [P2] 2.6 内置项目模板
- **工作量**：中
- **方案**：内置离线模板（不依赖在线市场）：
  - 基础欢迎插件
  - 简易经济系统
  - 指令菜单
  - PVP 计分
- **涉及文件**：新建 `resources/templates/` 目录、`index.html`（模板选择 UI）

### [P2] 2.7 节点连接类型校验
- **工作量**：小
- **方案**：连接时做类型检查，不匹配时给出视觉警告（黄色边框）
- **涉及文件**：`graph.js`

---

## 三、代码生成质量

### [P0] 3.1 resolvePlayer 空指针安全
- **工作量**：大
- **问题**：`codegen.js:230-239` 注释已指出 `Bukkit.getPlayer(name)` 可能返回 null，但生成代码不包含空指针检查
- **方案**：将 `resolvePlayer` 重构为返回代码块，自动包裹 null check：
  ```java
  Player __target = Bukkit.getPlayer(name);
  if (__target != null) {
      // ... 操作代码
  }
  ```
- **涉及文件**：`codegen.js`

### [P1] 3.2 stringToNumber 无异常处理
- **工作量**：小
- **问题**：`codegen.js:200` 生成 `Integer.parseInt(strExpr)` 无 try-catch
- **方案**：统一使用已有的 `__parseDouble` 工具方法（`codegen.js:1107`），或加 try-catch
- **涉及文件**：`codegen.js`

### [P1] 3.3 __parseJson 实现简陋
- **工作量**：中
- **问题**：`codegen.js:1082-1099` 用字符串 indexOf 手动解析，无法处理嵌套对象/数组/转义字符
- **方案**：改用 Spigot API 自带的 `org.json.JSONObject`
- **涉及文件**：`codegen.js`

### [P1] 3.4 forEachPlayer 正则替换不安全
- **工作量**：中
- **问题**：`codegen.js:551` `l.replace(/\bplayer\b/g, "__loopPlayer")` 会误替换字符串字面量中的 "player"
- **方案**：改用作用域变量传递，不做文本替换
- **涉及文件**：`codegen.js`

### [P2] 3.5 import 排序优化
- **工作量**：小
- **问题**：import 按字母排序，不符合 Java 惯例（按包分组）
- **涉及文件**：`codegen.js`

### [P2] 3.6 onTabComplete 空实现
- **工作量**：小
- **问题**：`codegen.js:1070-1072` 永远返回空 ArrayList
- **方案**：根据指令参数生成基础补全（在线玩家名/子指令）
- **涉及文件**：`codegen.js`

### [P2] 3.7 buildJsonObject 引号转义 bug
- **工作量**：小
- **问题**：`codegen.js:148` 字符串拼接转义错误，生成格式错误的 JSON
- **方案**：改用 `JSONObject` API
- **涉及文件**：`codegen.js`

---

## 四、新功能建议

### [P0] 4.1 节点图代码实时预览面板
- **工作量**：大
- **方案**：画布旁增加折叠式代码预览面板，只显示当前选中节点生成的代码片段，高亮对应行
- **涉及文件**：`index.html`（面板 HTML/CSS）、`graph.js`（节点选中事件）、`codegen.js`（单节点代码生成）

### [P1] 4.2 一键测试服务器部署
- **工作量**：大
- **方案**：
  - 集成 PaperMC 下载器（自动下载对应版本服务端）
  - 一键启动本地测试服务器并加载生成的插件
  - 控制台输出实时显示在 IDE 内
- **涉及文件**：`main.go`（后端下载/启动逻辑）、`index.html`（UI）、新建 `compile.js` 中的测试按钮逻辑

### [P1] 4.3 自定义代码节点
- **工作量**：大
- **方案**：
  - 增加"自定义代码节点"：用户在节点内直接写 Java 代码片段
  - 支持自定义输入/输出端口类型
  - 代码片段直接嵌入生成的方法体中
- **涉及文件**：`node-defs.js`、`codegen.js`、`index.html`

### [P1] 4.4 多文件项目支持
- **工作量**：大
- **方案**：
  - 支持生成多个 Java 类（独立 Listener 类、CommandExecutor 类）
  - 节点图按模块/标签页组织，每个标签页生成一个方法或类
- **涉及文件**：`codegen.js`（多文件生成）、`main.go`（多文件写入）、`index.html`（多标签页 UI）

### [P2] 4.5 插件依赖管理
- **工作量**：中
- **方案**：配置面板增加"第三方依赖"管理，从 Maven Central 搜索添加，自动更新 pom.xml 和 plugin.yml
- **涉及文件**：`config-ui.js`、`codegen.js`（pom 生成）、`index.html`

### [P2] 4.6 版本管理 / 项目历史
- **工作量**：中
- **方案**：自动保存到 localStorage/IndexedDB，维护项目历史版本列表，支持多项目管理
- **涉及文件**：新建 `resources/js/project-manager.js`、`index.html`

---

## 五、技术债务

### [P0] 5.1 node-defs.js 中 onConfigure 重复代码
- **工作量**：中
- **问题**：`defNode`（10-34行）和 `applyOnConfigure`（36-55行）逻辑完全相同，但部分节点手动写了不同版本，还有的完全没有 onConfigure，导致导入蓝图时 widget 值不恢复
- **受影响节点**：`StringConcatNode`（764行）、`PlayerNameNode`（911行）等缺少 onConfigure
- **方案**：统一到 `defNode` 一个入口，删除 `applyOnConfigure`
- **涉及文件**：`node-defs.js`

### [P0] 5.2 硬编码开发机路径
- **工作量**：小
- **问题**：`main.go:239-247` 的 `javaCandidates` 包含 `F:\zulu26` 和 `F:\zulu17`
- **方案**：移除硬编码路径，改为通用扫描策略（注册表/环境变量/常见安装目录）
- **涉及文件**：`main.go`

### [P1] 5.3 前端无构建工具链
- **工作量**：大
- **问题**：`index.html` 2870 行单文件（138KB）+ 16 个分散 JS 文件，无模块化，CDN 依赖离线全崩
- **方案**：引入 Vite 构建工具，HTML 拆分为组件化模板，CDN 资源本地化
- **涉及文件**：全前端重构

### [P1] 5.4 addJavaHandler 去重 bug
- **工作量**：小
- **问题**：`main.go:608-613` 检测到重复路径时执行 `javaHomesCache = []`（清空整个列表），导致所有已添加环境被删除
- **方案**：改为只跳过或更新匹配的条目
- **涉及文件**：`main.go`

### [P1] 5.5 config.yml 去重失效
- **工作量**：小
- **问题**：`codegen.js:1207` 使用 `new Set()` 存储 `{key, type}` 对象，Set 按引用比较，去重无效
- **方案**：改用 Map 或以 key 字符串去重
- **涉及文件**：`codegen.js`

### [P1] 5.6 pom.xml 可编辑安全风险
- **工作量**：中
- **问题**：`main.js:42` pom 编辑器可编辑，用户可手动添加任意 Maven 依赖（供应链攻击风险）
- **方案**：将 pom 编辑器改回只读，或仅允许编辑有限字段（依赖 groupId/artifactId/version）
- **涉及文件**：`main.js`、`index.html`

### [P2] 5.7 缺少自动化测试
- **工作量**：大
- **方案**：为 codegen 添加单元测试（Jest 或类似框架），测试每种节点类型生成的代码
- **涉及文件**：新建 `test/` 目录

### [P2] 5.8 开源仓库暴露开发机路径
- **工作量**：小
- **同 5.2**，作为开源项目（GPL v3），硬编码路径不专业
- **涉及文件**：`main.go`

---

## 六、优先级总表

| 优先级 | 编号 | 标题 | 工作量 | 涉及文件 |
|--------|------|------|--------|----------|
| **P0** | 1.1 | GUI/物品栏交互节点 | 大 | node-defs, codegen, index.html |
| **P0** | 1.2 | PlaceholderAPI / Vault 集成 | 中 | node-defs, codegen, index.html |
| **P0** | 2.1 | 代码生成与手动修改冲突 | 大 | main.js, ui.js, index.html |
| **P0** | 2.2 | 撤销/重做功能 | 中 | graph.js, main.js, index.html |
| **P0** | 3.1 | resolvePlayer 空指针安全 | 大 | codegen.js |
| **P0** | 4.1 | 节点图代码实时预览 | 大 | index.html, graph.js, codegen.js |
| **P0** | 5.1 | onConfigure 重复代码 | 中 | node-defs.js |
| **P0** | 5.2 | 硬编码开发机路径 | 小 | main.go |
| **P1** | 1.3 | Scoreboard 节点 | 中 | node-defs, codegen, index.html |
| **P1** | 1.4 | 物品 NBT/Meta 操作 | 大 | node-defs, codegen, index.html |
| **P1** | 1.5 | 更多事件节点 | 中 | node-defs, codegen, index.html |
| **P1** | 2.3 | 编译错误提示优化 | 中 | compile.js |
| **P1** | 2.4 | 节点搜索优化 | 小 | ui.js, index.html |
| **P1** | 2.5 | 画布辅助功能 | 中 | graph.js, main.js, index.html |
| **P1** | 3.2 | stringToNumber 无异常处理 | 小 | codegen.js |
| **P1** | 3.3 | __parseJson 实现简陋 | 中 | codegen.js |
| **P1** | 3.4 | forEachPlayer 正则替换不安全 | 中 | codegen.js |
| **P1** | 4.2 | 一键测试服务器部署 | 大 | main.go, index.html, compile.js |
| **P1** | 4.3 | 自定义代码节点 | 大 | node-defs, codegen, index.html |
| **P1** | 4.4 | 多文件项目支持 | 大 | codegen.js, main.go, index.html |
| **P1** | 5.3 | 前端无构建工具链 | 大 | 全前端重构 |
| **P1** | 5.4 | addJavaHandler 去重 bug | 小 | main.go |
| **P1** | 5.5 | config.yml 去重失效 | 小 | codegen.js |
| **P1** | 5.6 | pom.xml 可编辑安全风险 | 中 | main.js, index.html |
| **P2** | 1.6 | 数据持久化节点 | 中 | node-defs, codegen, index.html |
| **P2** | 1.7 | 世界获取类节点 | 小 | node-defs, codegen, index.html |
| **P2** | 2.6 | 内置项目模板 | 中 | 新建 templates/, index.html |
| **P2** | 2.7 | 节点连接类型校验 | 小 | graph.js |
| **P2** | 3.5 | import 排序优化 | 小 | codegen.js |
| **P2** | 3.6 | onTabComplete 空实现 | 小 | codegen.js |
| **P2** | 3.7 | buildJsonObject 转义 bug | 小 | codegen.js |
| **P2** | 4.5 | 插件依赖管理 | 中 | config-ui.js, codegen.js, index.html |
| **P2** | 4.6 | 版本管理/项目历史 | 中 | 新建 project-manager.js, index.html |
| **P2** | 5.7 | 缺少自动化测试 | 大 | 新建 test/ |
| **P2** | 5.8 | 开源仓库暴露开发机路径 | 小 | main.go |

---

## 七、实施路线

### 第一阶段 v1.4.0 — 核心体验修复（预估 2-3 周）✅ 已完成

| 顺序 | 编号 | 标题 | 工作量 | 依赖 |
|------|------|------|--------|------|
| 1 | 5.2 | 移除硬编码开发机路径 | 小 | 无 |
| 2 | 5.4 | 修复 addJavaHandler 去重 bug | 小 | 无 |
| 3 | 5.5 | 修复 config.yml 去重失效 | 小 | 无 |
| 4 | 5.1 | 统一 onConfigure，修复蓝图导入 | 中 | 无 |
| 5 | 3.1 | resolvePlayer 空指针安全 | 大 | 无 |
| 6 | 2.2 | 撤销/重做功能 | 中 | 无 |
| 7 | 2.1 | 代码生成与手动修改冲突 | 大 | 无 |

**目标**：修复所有已知 bug + 基础编辑器体验达标

### 第二阶段 v1.5.0 — 节点能力扩展（预估 3-4 周）✅ 已完成

| 顺序 | 编号 | 标题 | 工作量 | 依赖 |
|------|------|------|--------|------|
| 1 | 1.1 | GUI/物品栏交互节点 | 大 | 无 |
| 2 | 1.2 | PlaceholderAPI / Vault 集成 | 中 | 无 |
| 3 | 1.4 | 物品 NBT/Meta 操作 | 大 | 1.1 |
| 4 | 1.5 | 补充缺失事件节点 | 中 | 无 |
| 5 | 1.3 | Scoreboard 节点 | 中 | 无 |

**目标**：覆盖 MC 插件开发 80% 以上常见场景

### 第三阶段 v1.6.0 — 代码质量与安全（预估 2 周）

| 顺序 | 编号 | 标题 | 工作量 | 依赖 |
|------|------|------|--------|------|
| 1 | 3.3 | __parseJson 重写 | 中 | 无 |
| 2 | 3.4 | forEachPlayer 替换修复 | 中 | 无 |
| 3 | 3.2 | stringToNumber 异常处理 | 小 | 无 |
| 4 | 3.7 | buildJsonObject 转义修复 | 小 | 3.3 |
| 5 | 2.3 | 编译错误友好提示 | 中 | 无 |
| 6 | 5.6 | pom.xml 安全加固 | 中 | 无 |
| 7 | 2.4 | 节点搜索优化 | 小 | 无 |
| 8 | 2.5 | 画布辅助功能 | 中 | 无 |

**目标**：生成的代码生产级可用，错误提示对新手友好

### 第四阶段 v2.0.0 — 架构升级（预估 6-8 周）

| 顺序 | 编号 | 标题 | 工作量 | 依赖 |
|------|------|------|--------|------|
| 1 | 5.3 | 前端构建工具链引入 | 大 | 无 |
| 2 | 4.1 | 节点图代码实时预览 | 大 | 5.3 |
| 3 | 4.3 | 自定义代码节点 | 大 | 无 |
| 4 | 4.4 | 多文件项目支持 | 大 | 无 |
| 5 | 4.2 | 一键测试服务器部署 | 大 | 无 |
| 6 | 1.6 | 数据持久化节点 | 中 | 无 |
| 7 | 1.7 | 世界获取类节点 | 小 | 无 |
| 8 | 2.6 | 内置项目模板 | 中 | 无 |
| 9 | 2.7 | 节点连接类型校验 | 小 | 无 |
| 10 | 4.5 | 插件依赖管理 | 中 | 无 |
| 11 | 4.6 | 版本管理/项目历史 | 中 | 无 |
| 12 | 5.7 | 自动化测试 | 大 | 无 |

**目标**：工具架构专业化，功能覆盖完整开发闭环

---

## 八、关键代码位置索引

> 修改时快速定位

| 功能 | 文件 | 关键行号 | 说明 |
|------|------|----------|------|
| 节点注册入口 | `node-defs.js` | 1-34 | `defNode()` 和 `applyOnConfigure()` |
| 事件节点定义 | `node-defs.js` | 57-220 | 20 个事件节点 |
| 代码生成核心 | `codegen.js` | 1-1396 | `generateJava()` 主函数 |
| resolvePlayer | `codegen.js` | 230-239 | 空指针风险点 |
| resolveNumber | `codegen.js` | 200 | parseInt 无异常处理 |
| forEachPlayer | `codegen.js` | 551 | 正则替换不安全 |
| __parseJson | `codegen.js` | 1082-1099 | 简陋的 JSON 解析 |
| buildJsonObject | `codegen.js` | 148 | 引号转义 bug |
| generatePomXml | `codegen.js` | 1230-1356 | pom.xml 生成 |
| 编辑器初始化 | `main.js` | 38-42 | 所有编辑器可编辑 |
| 快捷键拦截 | `main.js` | 2-13 | F12/Ctrl+U/Ctrl+S 等 |
| 画布初始化 | `graph.js` | 1-146 | LiteGraph 设置 |
| 编译请求 | `compile.js` | 1-102 | fetch /api/build |
| HTTP 服务器 | `main.go` | 719-749 | 路由注册 + ListenAndServe |
| buildHandler | `main.go` | 952-1132 | 编译流程 |
| getPom | `main.go` | 1134-1196 | 后端默认 pom 生成 |
| Java 扫描 | `main.go` | 232-247 | 硬编码路径 F:\zulu26 |
| addJavaHandler | `main.go` | 567-616 | 去重 bug |
| 蓝图导入导出 | `blueprint.js` | 1-114 | .mcbp 格式 |
| 在线模式 | `online-mode.js` | 1-171 | 离线模式 fetch 拦截 |
| 模板市场 | `market.js` | 1-50+ | 在线模板浏览/下载 |
