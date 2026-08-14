### 安全修复
- HTTP 服务器绑定 127.0.0.1，不再监听 0.0.0.0
- 移除 3 处 CORS Access-Control-Allow-Origin: * 响应头
- 会话密钥改为持久化随机 32 字节密钥（不再硬编码）
- 新增构建请求路径穿越校验（PluginName/MainClass/PackageName 字符合法性）
- 新增 pom.xml 危险插件过滤（拦截 exec-maven-plugin、maven-antrun-plugin 等 RCE 插件）
- writeFile 返回 error 并在所有调用处检查
- Content-Disposition filename 过滤（防止 HTTP 头注入）
- Maven 错误输出截断 2000 字符并过滤 JVM WARNING（避免泄露本机信息）
- 公告/更新弹窗 innerHTML XSS 修复为 textContent
- 模板 ID 注入用 Number() 强转

### Maven 构建修复
- 加 -U 参数强制更新 SNAPSHOT 依赖缓存
- 加 --enable-final-field-mutation=ALL-UNNAMED 抑制 Java 24+ JVM 警告
- 修复 paper-api 1.20.5 的 adventure-bom:4.17.0-SNAPSHOT 缺失问题（自动安装正式版到本地仓库）
- Folia 模式 pom.xml 添加 dependencyManagement 覆盖 adventure-bom 版本
