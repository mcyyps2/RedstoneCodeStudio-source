chcp 65001

# 创建发布目录
if (!(Test-Path "release")) { New-Item -ItemType Directory -Path "release" }

# 定义打包清单
$targets = @(
    # 操作系统, 架构, 扩展名, 是否启用CGO
    @("windows", "amd64", ".exe", 1), # 只有这个版本支持 WebView
    @("windows", "arm64", ".exe", 0), # Windows ARM 不支持 WebView (根据你的代码标签)
    @("linux",   "amd64", "",     0),
    @("linux",   "arm64", "",     0),
    @("darwin",  "amd64", "",     0), # macOS Intel
    @("darwin",  "arm64", "",     0)  # macOS M1/M2/M3
)

foreach ($t in $targets) {
    $os = $t[0]
    $arch = $t[1]
    $ext = $t[2]
    $cgo = $t[3]
    
    $outputName = "release/RedstoneCodeStudio_${os}_${arch}${ext}"
    
    Write-Host "正在编译: $os/$arch (CGO=$cgo)..." -ForegroundColor Cyan
    
    # 设置环境变量
    $env:GOOS = $os
    $env:GOARCH = $arch
    $env:CGO_ENABLED = $cgo
    
    # 针对 Windows 设置 GUI 标志，Linux/Mac 忽略该标志
    $ldflags = "-s -w"
    if ($os -eq "windows") {
        $ldflags += " -H windowsgui"
    }

    # 执行构建
    go build -ldflags="$ldflags" -o $outputName .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "编译失败: $os/$arch"
        exit
    }
}

Write-Host "所有版本打包完成，存放在 ./release 目录" -ForegroundColor Green