# RedstoneCodeStudio 第四阶段 v2.0.0 - 架构升级实施计划

> **开始时间**: 2026年8月15日  
> **目标版本**: v2.0.0  
> **预估周期**: 6-8 周  
> **当前状态**: ⚡ 进行中  

## 📋 阶段概述

第四阶段将专注于**架构升级**，引入现代前端构建工具链，实现核心架构的专业化和完整开发闭环。这将使RedstoneCodeStudio从基础工具升级为专业级的Minecraft插件开发IDE。

## 🎯 阶段目标

- **架构专业化**: 引入Vite构建工具，实现模块化开发
- **功能完整化**: 覆盖完整开发生命周期（预览→开发→测试→部署）
- **体验现代化**: 提供实时代码预览、自定义代码节点等专业功能
- **工程化提升**: 支持多文件项目、依赖管理、版本控制

---

## 📊 详细实施路线

### 第一部分：前端架构重构

#### 任务 1: 前端构建工具链引入
**状态**: 🔄 计划中  
**预估时间**: 2-3 周  
**优先级**: P0

**实施方案**:
1. **引入Vite构建工具**
   - 创建`vite.config.js`配置文件
   - 配置开发服务器、构建优化、插件系统
   - 设置热重载和模块化开发环境

2. **前端文件结构重构**
   ```bash
   src/
   ├── components/          # Vue组件
   ├── views/              # 页面视图
   ├── stores/             # 状态管理
   ├── utils/              # 工具函数
   ├── assets/             # 静态资源
   └── main.js             # 应用入口
   ```

3. **依赖管理升级**
   - 从CDN迁移到npm包管理
   - 实现依赖版本锁定和安全性检查
   - 优化第三方库集成

**涉及文件**:
- 新建: `vite.config.js`, `package.json`, `src/`
- 重构: `index.html`, 所有JS文件模块化

**验证标准**:
- ✅ 构建工具正常工作
- ✅ 开发服务器热重载功能
- ✅ 生产环境构建优化
- ✅ 所有现有功能保持兼容

---

### 任务 2: 节点图代码实时预览面板
**状态**: 🔄 计划中  
**预估时间**: 2-3 周  
**优先级**: P0  
**依赖**: 任务1完成

**实施方案**:
1. **预览面板UI设计**
   ```vue
   <!-- CodePreview.vue -->
   <template>
     <div class="code-preview">
       <div class="preview-header">
         <span>代码预览</span>
         <div class="highlight-options">
           <select v-model="language">
             <option value="java">Java</option>
             <option value="yaml">YAML</option>
           </select>
         </div>
       </div>
       <div class="code-editor" ref="previewEditor"></div>
     </div>
   </template>
   ```

2. **实时代码生成**
   - 监听节点选择变化
   - 生成当前选中节点的代码片段
   - 高亮对应代码行

3. **预览功能**
   - 单节点代码预览
   - 连接节点代码合并预览
   - 全部代码预览模式

**涉及文件**:
- 新建: `src/components/CodePreview.vue`
- 修改: `graph.js`, `codegen.js`, `index.html`

**验证标准**:
- ✅ 选中节点时实时显示代码
- ✅ 代码行高亮同步
- ✅ 支持Java/YAML预览
- ✅ 性能影响最小化

---

### 任务 3: 自定义代码节点
**状态**: 🔄 计划中  
**预估时间**: 2-3 周  
**优先级**: P1

**实施方案**:
1. **自定义节点UI设计**
   ```vue
   <!-- CustomCodeNode.vue -->
   <template>
     <div class="custom-code-node">
       <div class="node-header">
         <input type="text" v-model="displayName" placeholder="节点名称">
       </div>
       <div class="code-editor">
         <textarea v-model="codeSnippet" placeholder="输入Java代码..."></textarea>
       </div>
       <div class="port-config">
         <input type="text" v-model="inputPorts" placeholder="输入端口: 类型,名称">
         <input type="text" v-model="outputPorts" placeholder="输出端口: 类型,名称">
       </div>
     </div>
   </template>
   ```

2. **代码生成机制**
   - 解析用户输入的Java代码片段
   - 自动包装成方法体
   - 处理变量替换和类型检查

3. **端口配置系统**
   - 支持自定义输入输出端口
   - 动态端口类型验证
   - 端口连接规则检查

**涉及文件**:
- 新建: `src/components/CustomCodeNode.vue`
- 修改: `node-defs.js`, `codegen.js`, `graph.js`

**验证标准**:
- ✅ 用户可编写自定义Java代码
- ✅ 动态端口配置正常
- ✅ 代码片段正确嵌入生成结果
- ✅ 类型检查功能可用

---

### 任务 4: 多文件项目支持
**状态**: 🔄 计划中  
**预估时间**: 2-3 周  
**优先级**: P1

**实施方案**:
1. **多文件项目结构**
   ```yaml
   my-plugin/
   ├── src/
   │   ├── Main.java          # 主类
   │   ├── listeners/
   │   │   ├── PlayerListener.java
   │   │   └── BlockListener.java
   │   └── commands/
   │       ├── Command1.java
   │       └── Command2.java
   ├── plugin.yml
   └── pom.xml
   ```

2. **节点图标签页系统**
   - 每个标签页对应一个Java类或方法
   - 支持节点图复制和引用
   - 跨文件代码引用

3. **代码生成策略**
   - 按文件结构生成代码
   - 自动处理类依赖和import语句
   - 生成独立的编译单元

**涉及文件**:
- 新建: `src/components/ProjectTabs.vue`
- 修改: `codegen.js`, `main.go`, `graph.js`

**验证标准**:
- ✅ 支持多文件项目结构
- ✅ 标签页切换正常
- ✅ 跨文件引用功能
- ✅ 正确生成多个Java类

---

### 任务 5: 一键测试服务器部署
**状态**: 🔄 计划中  
**预估时间**: 3-4 周  
**优先级**: P1

**实施方案**:
1. **服务器下载管理**
   ```javascript
   // ServerManager.js
   class ServerManager {
     async downloadPaperMC(version) {
       // 自动下载PaperMC服务端
     }
     
     async startServer() {
       // 启动测试服务器
     }
     
     async installPlugin(pluginFile) {
       // 安装生成的插件
     }
   }
   ```

2. **服务器配置界面**
   - Minecraft版本选择
   - 内存配置调整
   - 插件安装状态监控

3. **实时控制台输出**
   - WebSocket连接服务器日志
   - 错误高亮和过滤
   - 命令输入支持

**涉及文件**:
- 新建: `src/ServerManager.js`, `src/components/ServerManager.vue`
- 修改: `main.go`, `compile.js`, `index.html`

**验证标准**:
- ✅ 自动下载PaperMC服务端
- ✅ 启动测试服务器
- ✅ 安装并测试生成插件
- ✅ 实时日志显示

---

### 任务 6: 数据持久化节点
**状态**: 🔄 计划中  
**预估时间**: 1-2 周  
**优先级**: P2

**实施方案**:
1. **持久化数据API节点**
   - `data/setPersistent` - 写入持久化数据
   - `data/getPersistent` - 读取持久化数据
   - `data/removePersistent` - 删除持久化数据

2. **配置文件操作节点**
   - `config/getBoolean` - 读取布尔配置
   - `config/getDouble` - 读取数值配置
   - `config/getList` - 读取列表配置
   - `config/setValue` - 设置配置值

3. **数据类型支持**
   - 支持基础Java类型
   - 支持自定义对象序列化
   - 支持嵌套数据结构

**涉及文件**:
- 新建: `src/nodes/PersistenceNodes.js`
- 修改: `node-defs.js`, `codegen.js`

**验证标准**:
- ✅ 持久化数据读写功能
- ✅ 配置文件操作节点
- ✅ 数据类型支持完整

---

### 任务 7: 世界获取类节点
**状态**: 🔄 计划中  
**预估时间**: 1 周  
**优先级**: P2

**实施方案**:
1. **世界操作节点**
   - `world/getByName` - 根据名称获取世界
   - `world/getSpawnLocation` - 获取世界出生点
   - `world/getEntities` - 获取世界实体
   - `world/getTime` - 获取/设置世界时间
   - `world/getWeather` - 获取/设置天气

2. **实体操作节点**
   - `world/findEntity` - 按条件查找实体
   - `world/teleportEntity` - 传送实体
   - `world/spawnEntity` - 生成实体

**涉及文件**:
- 新建: `src/nodes/WorldNodes.js`
- 修改: `node-defs.js`, `codegen.js`

**验证标准**:
- ✅ 世界获取功能完整
- ✅ 实体操作功能正常
- ✅ 多世界支持

---

### 任务 8: 内置项目模板
**状态**: 🔄 计划中  
**预估时间**: 2 周  
**优先级**: P2

**实施方案**:
1. **模板管理系统**
   ```javascript
   // templates.js
   const TEMPLATES = {
     welcome: {
       name: "欢迎插件",
       description: "基础欢迎功能",
       icon: "👋",
       nodes: [...]
     },
     economy: {
       name: "经济系统",
       description: "简易经济管理",
       icon: "💰",
       nodes: [...]
     },
     pvp: {
       name: "PVP计分板",
       description: "竞技场计分系统",
       icon: "⚔️",
       nodes: [...]
     }
   }
   ```

2. **模板选择界面**
   - 模板预览和描述
   - 一键导入模板
   - 模板定制功能

3. **模板生成机制**
   - 基于模板生成完整项目
   - 自动配置文件生成
   - 代码片段插入

**涉及文件**:
- 新建: `src/templates/`, `src/components/TemplateManager.vue`
- 修改: `index.html`, `codegen.js`

**验证标准**:
- ✅ 内置模板功能完整
- ✅ 模板导入正常
- ✅ 自动配置生成

---

### 任务 9: 节点连接类型校验
**状态**: 🔄 计划中  
**预估时间**: 1 周  
**优先级**: P2

**实施方案**:
1. **类型系统设计**
   - 输入/输出端口类型定义
   - 类型兼容性规则
   - 自动类型转换

2. **视觉反馈系统**
   - 连接时类型检查
   - 不匹配连接的视觉警告
   - 类型匹配状态指示器

3. **错误提示优化**
   - 类型不匹配的具体说明
   - 建议的正确连接类型
   - 自动修复建议

**涉及文件**:
- 修改: `graph.js`, `node-defs.js`

**验证标准**:
- ✅ 类型检查功能正常
- ✅ 视觉警告显示
- ✅ 错误提示完整

---

### 任务 10: 插件依赖管理
**状态**: 🔄 计划中  
**预估时间**: 2 周  
**优先级**: P2

**实施方案**:
1. **依赖管理界面**
   ```vue
   <!-- DependencyManager.vue -->
   <template>
     <div class="dependency-manager">
       <div class="search-bar">
         <input v-model="searchQuery" placeholder="搜索Maven依赖...">
         <button @click="searchDependencies">搜索</button>
       </div>
       <div class="dependency-list">
         <div v-for="dep in searchResults" :key="dep.artifactId">
           <span>{{ dep.groupId }}:{{ dep.artifactId }}</span>
           <span>{{ dep.version }}</span>
           <button @click="addDependency(dep)">添加</button>
         </div>
       </div>
       <div class="added-dependencies">
         <div v-for="dep in projectDependencies" :key="dep.artifactId">
           <span>{{ dep.groupId }}:{{ dep.artifactId }}:{{ dep.version }}</span>
           <button @click="removeDependency(dep)">移除</button>
         </div>
       </div>
     </div>
   </template>
   ```

2. **Maven集成**
   - 从Maven Central搜索依赖
   - 自动更新pom.xml
   - 版本冲突检测和解决

3. **依赖管理功能**
   - 添加/删除依赖
   - 版本更新
   - 依赖树显示

**涉及文件**:
- 新建: `src/components/DependencyManager.vue`
- 修改: `codegen.js`, `main.go`, `index.html`

**验证标准**:
- ✅ Maven依赖搜索功能
- ✅ 自动pom.xml更新
- ✅ 版本管理功能

---

### 任务 11: 版本管理/项目历史
**状态**: 🔄 计划中  
**预估时间**: 2 周  
**优先级**: P2

**实施方案**:
1. **项目存储系统**
   - 使用IndexedDB存储项目历史
   - 项目快照功能
   - 版本比较工具

2. **项目管理界面**
   ```vue
   <!-- ProjectManager.vue -->
   <template>
     <div class="project-manager">
       <div class="project-list">
         <div v-for="project in projects" :key="project.id">
           <h3>{{ project.name }}</h3>
           <p>{{ project.lastModified }}</p>
           <div class="project-actions">
             <button @click="openProject(project)">打开</button>
             <button @click="compareVersions(project)">对比版本</button>
           </div>
         </div>
       </div>
       <div class="version-history">
         <div v-for="version in versionHistory" :key="version.id">
           <span>{{ version.version }}</span>
           <span>{{ version.date }}</span>
           <button @click="restoreVersion(version)">恢复</button>
         </div>
       </div>
     </div>
   </template>
   ```

3. **版本控制功能**
   - 自动保存项目快照
   - 版本标签管理
   - 差异对比

**涉及文件**:
- 新建: `src/ProjectManager.js`, `src/components/ProjectManager.vue`
- 修改: `index.html`, `blueprint.js`

**验证标准**:
- ✅ 项目历史存储功能
- ✅ 版本对比工具
- ✅ 版本恢复功能

---

### 任务 12: 自动化测试
**状态**: 🔄 计划中  
**预估时间**: 3 周  
**优先级**: P2

**实施方案**:
1. **测试框架搭建**
   ```javascript
   // tests/codegen.test.js
   describe('代码生成测试', () => {
     test('StringConcat节点生成正确', () => {
       const node = createNode('string/concat');
       const code = generateCode(node);
       expect(code).toContain('String.join');
     });
     
     test('PlayerMessage节点包含安全检查', () => {
       const node = createNode('player/message');
       const code = generateCode(node);
       expect(code).toContain('if (target != null)');
     });
   });
   ```

2. **测试覆盖范围**
   - 单元测试：每个节点类型的代码生成
   - 集成测试：节点连接和代码合并
   - 端到端测试：完整项目生成和编译

3. **测试工具集成**
   - Jest测试框架
   - 持续集成支持
   - 测试覆盖率报告

**涉及文件**:
- 新建: `tests/`, `jest.config.js`, `package.json`测试配置
- 修改: 所有核心代码添加测试

**验证标准**:
- ✅ 测试框架搭建完成
- ✅ 核心功能测试覆盖
- ✅ 测试报告生成

---

## 📅 时间安排

### 周次规划
- **第1-3周**: 任务1 - 前端架构重构
- **第4-6周**: 任务2 + 任务3 - 代码预览 + 自定义节点
- **第7-9周**: 任务4 + 任务5 - 多文件项目 + 服务器部署
- **第10-12周**: 任务6-9 - 持久化节点 + 世界节点 + 模板 + 校验
- **第13-14周**: 任务10-12 - 依赖管理 + 版本管理 + 自动化测试

### 里程碑设置
1. **Week 3**: 完成前端架构重构
2. **Week 6**: 完成代码预览功能
3. **Week 9**: 完成多文件项目支持
4. **Week 12**: 完成核心功能开发
5. **Week 14**: 完成测试和优化

---

## 🎯 成功标准

### 功能完整性
- ✅ 完整的前端架构重构
- ✅ 代码实时预览功能
- ✅ 自定义代码节点支持
- ✅ 多文件项目管理
- ✅ 测试服务器集成
- ✅ 数据持久化支持
- ✅ 插件依赖管理
- ✅ 版本控制系统
- ✅ 自动化测试框架

### 性能指标
- ✅ 应用启动时间 < 3秒
- ✅ 代码预览响应时间 < 100ms
- ✅ 构建时间 < 10秒
- ✅ 内存占用 < 1GB

### 用户体验
- ✅ 现代化UI设计
- ✅ 完整的功能文档
- ✅ 错误提示友好
- ✅ 操作流程简化

---

## 🔧 技术栈升级

### 新增技术
- **构建工具**: Vite 5.x
- **UI框架**: Vue 3 + Composition API
- **状态管理**: Pinia
- **测试框架**: Jest + Vue Test Utils
- **数据存储**: IndexedDB
- **WebSocket**: 实时服务器日志
- **Maven集成**: 依赖管理API

### 移除技术
- 传统的CDN依赖
- 手动文件管理
- 简单的localStorage存储
- 原生DOM操作

---

## 📈 价值预期

### 开发效率提升
- **代码预览**: 减少30%调试时间
- **自定义节点**: 支持60%特殊场景需求
- **多文件项目**: 支持100%复杂项目开发
- **测试服务器**: 减少50%测试环境准备时间

### 用户体验改善
- **现代化界面**: 提升视觉体验和专业度
- **实时反馈**: 减少80%代码生成等待时间
- **错误提示**: 提升90%问题定位效率

### 项目质量提升
- **自动化测试**: 确保代码质量稳定
- **架构重构**: 提升代码可维护性
- **依赖管理**: 减少80%兼容性问题

---

*RedstoneCodeStudio v2.0.0 - 专业级Minecraft插件开发IDE*