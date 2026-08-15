// 解析 Maven 编译错误，提取关键信息并友好化显示
function parseMavenError(errorMsg) {
    if (!errorMsg) return { title: '编译失败', message: '未知错误' };

    // 提取所有 [ERROR] 行
    const errorLines = errorMsg.split('\n').filter(line => line.includes('[ERROR]'));

    // 优先检测依赖错误
    if (errorMsg.includes('Could not resolve dependencies') ||
        errorMsg.includes('Could not find artifact') ||
        errorMsg.includes('Cannot resolve')) {
        const depMatch = errorMsg.match(/Could not find artifact\s+([\w.:-]+)/) ||
                         errorMsg.match(/Cannot resolve\s+([\w.:]+)/);
        return {
            title: '依赖下载失败',
            message: depMatch ? `无法下载依赖: ${depMatch[1]}\n\n建议：检查网络连接或开启加速器重试` : '依赖解析失败，请检查网络连接或 pom.xml 配置'
        };
    }

    // 检测编译错误
    const compileErrorPattern = /\[ERROR\]\s+(.+\.java):\[([0-9]+),[0-9]+\]\s+(.+)/;
    const compileMatch = errorLines.find(line => compileErrorPattern.test(line));

    if (compileMatch) {
        const match = compileError.match(compileErrorPattern);
        const filePath = match[1].split('/').pop(); // 只显示文件名
        const lineNum = match[2];
        const errMsg = match[3];
        return {
            title: '编译错误',
            message: `文件: ${filePath}\n行号: ${lineNum}\n错误: ${errMsg}\n\n请检查节点逻辑是否正确，或查看完整错误日志了解详情。`
        };
    }

    // 提取第一个有意义的错误消息
    const firstError = errorLines.find(line => {
        const msg = line.replace(/\[ERROR\]\s*/, '');
        return msg && !msg.startsWith('---') && !msg.startsWith('Failed to execute') && msg.length > 10;
    });

    if (firstError) {
        const msg = firstError.replace(/\[ERROR\]\s*/, '');
        // 限制长度，避免显示过多内容
        return {
            title: '编译失败',
            message: msg.length > 200 ? msg.substring(0, 200) + '...' : msg
        };
    }

    // 默认回退
    return {
        title: '编译失败',
        message: errorMsg.length > 300 ? errorMsg.substring(0, 300) + '...' : errorMsg
    };
}

function compilePlugin() {
    const btn = document.getElementById('compileBtn');

    const pluginNameVal  = document.getElementById('pluginName')?.value?.trim()      || '';
    const mainClassVal   = document.getElementById('mainClass')?.value?.trim()       || '';
    const versionVal     = document.getElementById('pluginVersion')?.value?.trim()   || '1.0';
    const authorVal      = document.getElementById('author')?.value?.trim()          || '';
    const websiteVal     = document.getElementById('website')?.value?.trim()         || '';
    const groupIdVal     = document.getElementById('groupId')?.value?.trim()         || '';
    const artifactIdVal  = document.getElementById('artifactId')?.value?.trim()      || '';
    const apiVersionVal  = document.getElementById('apiVersion')?.value?.trim()      || '1.21';
    const spigotVerVal   = document.getElementById('spigotVersion')?.value?.trim()   || '1.21-R0.1-SNAPSHOT';
    const javaVerVal     = document.getElementById('javaVersion')?.value?.trim()     || '21';

    // 校验插件名
    if (!pluginNameVal || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(pluginNameVal)) {
        alert('插件名称格式不正确！\n只能包含字母、数字和连字符，且不能以数字开头。\n例如：MagicPlugin、my-plugin、TestPlugin123');
        switchTab('config');
        document.getElementById('pluginName').focus();
        return;
    }

    // 校验主类路径
    const mainClassErrors = validateMainClass(mainClassVal);
    if (mainClassErrors.length > 0) {
        alert('主类路径格式不正确！\n' + mainClassErrors[0] + '\n\n正确格式示例：me.yourname.myplugin.Main');
        switchTab('config');
        document.getElementById('mainClass').focus();
        return;
    }

    showStatus("正在连接编译服务器...");
    if (btn) btn.disabled = true;

    const code = editors.java ? editors.java.getValue() : "";
    if (!code.includes("JavaPlugin")) {
        alert("请先设计节点逻辑！");
        if (btn) btn.disabled = false;
        return;
    }

    // 从生成的代码中提取包名和类名
    const pkgMatch   = code.match(/^package\s+([\w.]+)\s*;/m);
    const classMatch = code.match(/public\s+class\s+(\w+)\s+extends/);
    const pkg = pkgMatch   ? pkgMatch[1]   : getMainClassParts().pkg;
    const cls = classMatch ? classMatch[1] : getMainClassParts().cls;

    // 90 秒超时
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 90000);

    fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
            pluginName:    pluginNameVal,
            packageName:   pkg,
            mainClass:     cls,
            fullMain:      pkg + '.' + cls,
            version:       versionVal,
            author:        authorVal,
            website:       websiteVal,
            groupId:       groupIdVal,
            artifactId:    artifactIdVal,
            apiVersion:    apiVersionVal,
            spigotVersion: spigotVerVal,
            javaVersion:   javaVerVal,
            javaCode:      code,
            pluginYml:     editors.yml?.getValue() || "",
            configYml:     editors.cfg?.getValue() || "",
            pomXml:        editors.pom?.getValue() || ""
        })
    })
    .then(async res => {
        if (res.ok) {
            const blob = await res.blob();
            const a    = document.createElement('a');
            a.href     = URL.createObjectURL(blob);
            a.download = pluginNameVal + ".jar";
            a.click();
            showStatus("编译成功，JAR 文件已下载");
            showModalDialog("编译成功", "JAR 文件已生成并下载。", "success");
        } else {
            const d = await res.json().catch(() => ({}));
            showStatus("编译失败");
            const parsed = parseMavenError(d.error);
            showModalDialog(parsed.title, parsed.message, "error");
        }
    })
    .catch(err => {
        if (err.name === 'AbortError') {
            showModalDialog("编译超时", "编译请求超时（90秒），可能是依赖下载失败，请尝试开启加速器再试", "error");
        } else {
            showModalDialog("网络错误", "后端未启动或网络连接失败。", "error");
        }
        showStatus("编译失败");
    })
    .finally(() => {
        clearTimeout(timeoutId);
        if (btn) btn.disabled = false;
    });
}
