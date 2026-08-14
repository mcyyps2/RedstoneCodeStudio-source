### v1.3.4 核心体验修复

Bug 修复:
- 移除硬编码开发机路径 F:\zulu26、F:\zulu17，改为通用 JDK 扫描路径
- 修复 addJavaHandler 去重 bug：添加重复路径时不再清空整个 Java 环境列表
- 修复 config.yml 去重失效：Set 存对象无法去重，改用 Map 按 key 字符串去重
- 补全 5 个缺失 onConfigure 的节点，修复蓝图导入时 widget 值不恢复

代码生成:
- resolvePlayer 空指针安全：18 个玩家动作节点自动包裹 null check，防止玩家不在线时 NPE 崩服
- 生成的代码示例: { Player __p = Bukkit.getPlayer("name"); if (__p != null) { __p.setHealth(20); } }

新功能:
- 撤销/重做：Ctrl+Z 撤销、Ctrl+Y 或 Ctrl+Shift+Z 重做，最多 50 步历史
- 代码锁定：点击"锁定代码"按钮后，节点变更不会覆盖编辑器中手动修改的代码
