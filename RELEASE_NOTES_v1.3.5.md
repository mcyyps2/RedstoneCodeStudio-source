# RedstoneCodeStudio v1.3.5 - 完整版本

## 🎯 版本概述

**版本号**: v1.3.5  
**发布日期**: 2026年8月15日  
**构建日期**: 2026年8月15日 14:01  
**编译器**: Go 1.21.6  

## 📋 更新内容总览

### v1.4.0 - 核心体验修复
- **resolvePlayer 空指针安全**: 通过 `emitPlayerAction` 函数解决 `__target` 空指针问题
- **撤销/重做功能**: 添加 `Ctrl+Z`/`Ctrl+Y` 快捷键支持，最多50步历史
- **代码生成与手动修改冲突**: 编辑器集成，提供明确的冲突说明

### v1.5.0 - 节点能力扩展  
- **GUI/物品栏交互**: `gui/openChest`, `events/inventoryClick`, `gui/itemClick` 等节点
- **PlaceholderAPI/Vault 集成**: 经济系统集成节点
- **物品 NBT/Meta 操作**: `item/meta`, `item/nbt-read`, `item/nbt-write`
- **Scoreboard 节点**: `scoreboard/setObjective`, `scoreboard/setScore`
- **缺失事件补充**: `onCommand`, `onAsyncChat`, `onRightClickPlayer`

### v1.6.0 - 代码质量改进
- **JSON解析重写**: 使用 `com.google.gson.JsonParser` 替代手动解析
- **forEachPlayer 安全修复**: 使用全局变量避免正则替换问题
- **异常处理增强**: `__parseDouble` 工具方法，异常处理优化
- **编译错误友好提示**: 改进 Maven 错误解析，提取关键信息
- **pom.xml 安全加固**: 编辑器设为只读模式，防止意外修改
- **节点搜索优化**: 关键词过滤和智能折叠展开功能
- **画布网格吸附**: 启用 LiteGraph 网格功能，帮助节点对齐
- **画布辅助功能**: 添加 ARIA 属性和键盘导航支持

## 🔧 技术改进

### 安全性增强
- 修复所有已知的空指针异常问题
- 加强代码生成时的安全性检查
- 防止用户意外修改关键配置文件

### 性能优化
- 优化节点搜索算法，提升用户体验
- 启用网格吸附功能，提高代码布局效率
- 改进错误处理机制，减少程序崩溃风险

### 代码质量
- 使用 Gson API 进行 JSON 解析，提高可靠性
- 增强异常处理，提供更好的错误信息
- 优化 Maven 编译错误解析

## 📦 构建信息

### 文件信息
- **主程序**: RedstoneCodeStudio.exe (15.64 MB)
- **构建命令**: `F:\Go\bin\go build -o RedstoneCodeStudio.exe .`
- **依赖管理**: Maven 内置集成

### 运行环境要求
- **操作系统**: Windows 10/11 (64位)
- **Java环境**: JDK 11+ (Maven 内置集成)
- **内存要求**: 最低 2GB RAM
- **存储空间**: 最低 50MB 可用空间

## 🚀 安装和使用

### 下载
- **GitHub仓库**: https://github.com/mcyyps2/RedstoneCodeStudio-source
- **版本标签**: v1.3.5
- **下载地址**: GitHub Releases 或编译产物

### 快速启动
```bash
# 直接运行构建的EXE文件
RedstoneCodeStudio.exe

# 或使用命令行
./RedstoneCodeStudio.exe --help
```

### 验证安装
运行程序后，检查以下信息是否正常显示：
- 程序所在目录
- Maven 服务状态
- Java 环境信息
- 会话密钥加载状态

## 📊 功能验证

### 核心功能测试
- ✅ GUI/物品栏交互节点正常工作
- ✅ PlaceholderAPI/Vault 集成功能完整
- ✅ Scoreboard 节点功能实现
- ✅ JSON 解析使用 Gson API
- ✅ 撤销/重做快捷键可用
- ✅ 节点搜索和过滤功能
- ✅ 网格吸附功能正常
- ✅ 画布辅助功能实现

### 兼容性测试
- ✅ Windows 10/11 兼容
- ✅ Maven 集成工作正常
- ✅ Java 环境检测正确
- ✅ 项目文件兼容性保持

## 🔍 故障排除

### 常见问题
1. **程序无法启动**: 检查 Java 环境是否正确安装
2. **Maven 错误**: 确保内置 Maven 路径正确
3. **节点不显示**: 重新加载节点定义文件
4. **编译失败**: 检查插件代码语法和 Spigot API 版本

### 联系支持
- **GitHub Issues**: https://github.com/mcyyps2/RedstoneCodeStudio-source/issues
- **讨论区**: GitHub Discussions
- **文档**: 项目 Wiki 页面

## 📈 版本历史

### v1.3.4 (前一个版本)
- 核心体验修复
- 错误处理改进

### v1.3.3 (基础版本)
- 基础功能实现

## 🎯 下一步计划

- v1.4.0 规划中的新功能
- 性能优化计划
- 用户体验改进

---

*RedstoneCodeStudio - Minecraft 插件可视化开发工具*  
*GitHub: https://github.com/mcyyps2/RedstoneCodeStudio-source*