package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"golang.org/x/text/encoding/simplifiedchinese"

	"github.com/sqweek/dialog"
)

var (
	// 编译信号量：限制同时进行的 Maven 构建数量
	buildSem     = make(chan struct{}, 1)
	ProgramDir   string
	MavenCommand string
)

// JavaHomesFile 记录扫描到的 JDK 路径列表（程序根目录，避免打入资源包）
var JavaHomesFile string

// JavaHomeInfo 描述一个可用的 JDK
type JavaHomeInfo struct {
	Path    string `json:"path"`
	Version int    `json:"version"`
}

// JavaHomesData 记录文件的 JSON 结构
type JavaHomesData struct {
	ScannedAt string         `json:"scannedAt"`
	JavaHomes []JavaHomeInfo `json:"javaHomes"`
}

// javaHomesCache 内存缓存（避免频繁读文件）
var javaHomesCache []JavaHomeInfo

var TempBuildDir string

// 持久化用户配置
var SettingsFile string

// AppSettings 应用持久化设置
type AppSettings struct {
	OnlineMode bool   `json:"onlineMode"`
	SessionEnc string `json:"sessionEnc,omitempty"`
	SessionIV  string `json:"sessionIv,omitempty"`
}

type StoredSession struct {
	Token string          `json:"token"`
	User  json.RawMessage `json:"user"`
	Exp   int64           `json:"exp"`
}

const _srvSecret = "rcs-srv-session-key-v1"

const (
	_apiOrigin = "https://api.zeromi.cn"
	_authPath  = "/api/market/auth"
)

var _trustedOrigins = []string{
	_apiOrigin,
}

func buildProxyTargetURL(path string) (string, error) {
	var targetURL string
	switch {
	case strings.HasPrefix(path, "http"):
		targetURL = path
	case strings.HasPrefix(path, "/"):
		targetURL = _apiOrigin + path
	default:
		targetURL = _apiOrigin + _authPath + "/" + path
	}

	u, err := url.Parse(targetURL)
	if err != nil || u.Host == "" {
		return "", fmt.Errorf("目标 URL 无效: %s", targetURL)
	}

	host := strings.ToLower(u.Hostname())
	for _, origin := range _trustedOrigins {
		ou, err := url.Parse(origin)
		if err != nil || ou.Host == "" {
			continue
		}
		if strings.ToLower(ou.Hostname()) == host && u.Scheme == ou.Scheme {
			return targetURL, nil
		}
	}
	return "", fmt.Errorf("目标域名不在白名单中: %s", targetURL)
}

type ProxyAuthRequest struct {
	Path    string                 `json:"path"`
	Payload map[string]interface{} `json:"payload"`
}

// 处理 POST /api/proxy/auth
func proxyAuthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req ProxyAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		http.Error(w, `{"error":"path is required"}`, http.StatusBadRequest)
		return
	}

	targetURL, err := buildProxyTargetURL(req.Path)
	if err != nil {
		log.Printf("[proxy] 目标 URL 不受信任: %v", err)
		http.Error(w, `{"error":"untrusted target domain"}`, http.StatusForbidden)
		return
	}

	if req.Payload == nil {
		req.Payload = make(map[string]interface{})
	}
	req.Payload["_ts"] = time.Now().UnixMilli()

	body, err := json.Marshal(req.Payload)
	if err != nil {
		http.Error(w, `{"error":"marshal failed"}`, http.StatusInternalServerError)
		return
	}

	proxyReq, err := http.NewRequest(http.MethodPost, targetURL, strings.NewReader(string(body)))
	if err != nil {
		http.Error(w, `{"error":"create upstream request failed"}`, http.StatusInternalServerError)
		return
	}
	proxyReq.Header.Set("Content-Type", "application/json")

	if auth := r.Header.Get("Authorization"); auth != "" {
		proxyReq.Header.Set("Authorization", auth)
	}
	if xauth := r.Header.Get("X-Auth-Token"); xauth != "" {
		proxyReq.Header.Set("X-Auth-Token", xauth)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("[proxy] 上游请求失败: %v", err)
		http.Error(w, `{"error":"upstream request failed"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, `{"error":"read upstream response failed"}`, http.StatusBadGateway)
		return
	}
	w.WriteHeader(resp.StatusCode)
	w.Write(respBytes)
}

func init() {
	exePath, err := os.Executable()
	if err != nil {
		log.Fatalf("无法获取程序路径: %v", err)
	}
	ProgramDir = filepath.Dir(exePath)
	log.Printf("程序所在目录: %s", ProgramDir)

	MavenCommand = getMavenCommand()
	log.Printf("使用 Maven 命令: %s", MavenCommand)

	TempBuildDir = filepath.Join(ProgramDir, "builds")
	SettingsFile = filepath.Join(ProgramDir, "settings.json")
	JavaHomesFile = filepath.Join(ProgramDir, "java-homes.json")

	// 启动时确保 Java 记录可用（读取记录→验证→失效则重新扫描→保存）
	ensureJavaHomes()
}

func getMavenCommand() string {
	mavenBin := filepath.Join(ProgramDir, "resources", "maven", "bin")

	var mvnExec string
	if runtime.GOOS == "windows" {
		mvnExec = filepath.Join(mavenBin, "mvn.cmd")
		if _, err := os.Stat(mvnExec); err != nil {
			mvnExec = filepath.Join(mavenBin, "mvn.bat")
		}
	} else {
		mvnExec = filepath.Join(mavenBin, "mvn")
	}

	if info, err := os.Stat(mvnExec); err == nil && !info.IsDir() {
		if runtime.GOOS != "windows" && info.Mode()&0111 == 0 {
			if err := os.Chmod(mvnExec, 0755); err != nil {
				log.Printf("警告: 无法为内置 Maven 添加执行权限: %v", err)
			}
		}
		return mvnExec
	}

	log.Println("内置 Maven 不存在，将使用系统 PATH 中的 mvn")
	return "mvn"
}

// 常见 JDK 安装位置候选（Windows 优先，可自行扩展）
var javaCandidates = []string{
	`F:\zulu26`,
	`C:\Program Files\Java\latest`,
	`C:\Program Files\Eclipse Adoptium`,
	`C:\Program Files\Microsoft`,
	`C:\Program Files\Zulu`,
	`C:\Program Files\Amazon Corretto`,
	`F:\zulu17`,
}

// 启动时确保 Java 记录可用：读取记录 → 验证每个路径是否存在 →
// 有失效或记录为空则重新扫描并保存；否则直接用缓存。
func ensureJavaHomes() {
	if err := loadJavaHomes(); err == nil && len(javaHomesCache) > 0 {
		// 验证记录是否仍然有效
		valid := false
		for _, jh := range javaHomesCache {
			if isJavaHomeValid(jh.Path) {
				valid = true
				break
			}
		}
		if valid {
			log.Printf("使用已记录的 Java 环境 (%d 个)", len(javaHomesCache))
			return
		}
	}
	// 记录为空或全部失效 → 快速扫描常见位置兜底（不做全盘扫描，避免启动卡顿）
	list := scanJavaHomes()
	if len(list) > 0 {
		javaHomesCache = list
		saveJavaHomes()
		log.Printf("快速扫描到 %d 个 Java 环境并已记录", len(list))
	} else {
		javaHomesCache = nil
		log.Printf("未找到 Java 环境，可通过配置页手动添加")
	}
}

// 快速扫描系统常见位置的 JDK，返回按版本升序的列表
func scanJavaHomes() []JavaHomeInfo {
	var roots []string
	for _, c := range javaCandidates {
		if st, err := os.Stat(c); err == nil && st.IsDir() {
			subs, _ := os.ReadDir(c)
			if strings.Contains(strings.ToLower(c), "jdk") {
				roots = append(roots, c)
			}
			for _, s := range subs {
				if s.IsDir() && strings.Contains(strings.ToLower(s.Name()), "jdk") {
					roots = append(roots, filepath.Join(c, s.Name()))
				}
			}
		}
	}
	// 补充系统 PATH 中的 java
	if p := javaFromPath(); p != "" {
		roots = append(roots, p)
	}

	var result []JavaHomeInfo
	seen := map[string]bool{}
	for _, root := range roots {
		javac := filepath.Join(root, "bin", "javac.exe")
		if _, err := os.Stat(javac); err != nil {
			javac = filepath.Join(root, "bin", "javac")
			if _, err := os.Stat(javac); err != nil {
				continue
			}
		}
		abs, _ := filepath.Abs(root)
		if seen[abs] {
			continue
		}
		seen[abs] = true
		ver := detectJavaVersion(javac)
		if ver > 0 {
			result = append(result, JavaHomeInfo{Path: abs, Version: ver})
		}
	}
	// 按版本升序排序（冒泡，条目少足够）
	for i := 0; i < len(result); i++ {
		for j := i + 1; j < len(result); j++ {
			if result[j].Version < result[i].Version {
				result[i], result[j] = result[j], result[i]
			}
		}
	}
	return result
}

// 全盘扫描：遍历所有磁盘分区查找 JDK。
// 限制扫描深度、跳过系统/缓存目录，避免扫描过慢。
func scanJavaHomesFull() []JavaHomeInfo {
	var roots []string

	// Windows: 枚举逻辑驱动器
	if runtime.GOOS == "windows" {
		for d := 'A'; d <= 'Z'; d++ {
			root := string(d) + ":\\"
			if st, err := os.Stat(root); err == nil && st.IsDir() {
				roots = append(roots, root)
			}
		}
	} else {
		// 非 Windows：扫描常见挂载点
		for _, p := range []string{"/usr", "/opt", "/home", "/Library/Java"} {
			if st, err := os.Stat(p); err == nil && st.IsDir() {
				roots = append(roots, p)
			}
		}
	}

	// 跳过这些目录（大小写不敏感），避免进入系统/缓存目录
	skipDirs := map[string]bool{
		"windows": true, "programdata": true, "$recycle.bin": true,
		"system volume information": true, "recovery": true, "$sysreset": true,
		"perflogs": true, "documents and settings": true,
		".git": true, "node_modules": true, "appdata": true,
		"tmp": true, "temp": true, "caches": true,
	}

	var result []JavaHomeInfo
	seen := map[string]bool{}
	maxDepth := 6

	var walk func(dir string, depth int)
	walk = func(dir string, depth int) {
		if depth > maxDepth {
			return
		}
		entries, err := os.ReadDir(dir)
		if err != nil {
			return
		}
		for _, e := range entries {
			if !e.IsDir() {
				continue
			}
			name := strings.ToLower(e.Name())
			if skipDirs[name] {
				continue
			}
			sub := filepath.Join(dir, e.Name())
			// 如果该目录下存在 bin/javac，则是一个 JDK
			javac := filepath.Join(sub, "bin", "javac.exe")
			if _, err := os.Stat(javac); err != nil {
				javac = filepath.Join(sub, "bin", "javac")
				if _, err := os.Stat(javac); err == nil {
					abs, _ := filepath.Abs(sub)
					if !seen[abs] {
						seen[abs] = true
						if ver := detectJavaVersion(javac); ver > 0 {
							result = append(result, JavaHomeInfo{Path: abs, Version: ver})
						}
					}
				}
			}
			// 继续深入子目录（除非名字已经像 JDK 目录，通常无需再深入）
			if !strings.Contains(name, "jdk") {
				walk(sub, depth+1)
			}
		}
	}

	for _, root := range roots {
		walk(root, 1)
	}

	// 按版本升序排序
	for i := 0; i < len(result); i++ {
		for j := i + 1; j < len(result); j++ {
			if result[j].Version < result[i].Version {
				result[i], result[j] = result[j], result[i]
			}
		}
	}
	return result
}

// 从系统 PATH 解析 java 所在的 JDK 根目录（尽力而为）
func javaFromPath() string {
	javaExe, err := exec.LookPath("java")
	if err != nil {
		return ""
	}
	// 解析到 bin 的上一级作为 JDK 根
	binDir := filepath.Dir(javaExe)
	if strings.EqualFold(filepath.Base(binDir), "bin") {
		return filepath.Dir(binDir)
	}
	return ""
}

// 判断某个路径是否仍是有效的 JDK（bin/javac 存在）
func isJavaHomeValid(path string) bool {
	javac := filepath.Join(path, "bin", "javac.exe")
	if _, err := os.Stat(javac); err != nil {
		javac = filepath.Join(path, "bin", "javac")
		if _, err := os.Stat(javac); err != nil {
			return false
		}
	}
	return true
}

// 从记录文件加载 JavaHomes 到内存缓存
func loadJavaHomes() error {
	data, err := os.ReadFile(JavaHomesFile)
	if err != nil {
		return err
	}
	var d JavaHomesData
	if err := json.Unmarshal(data, &d); err != nil {
		return err
	}
	javaHomesCache = d.JavaHomes
	return nil
}

// 将当前缓存保存到记录文件
func saveJavaHomes() {
	d := JavaHomesData{
		ScannedAt: time.Now().Format(time.RFC3339),
		JavaHomes: javaHomesCache,
	}
	data, err := json.MarshalIndent(d, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(JavaHomesFile, data, 0644)
}

// 根据所需 Java 版本解析可用的 JDK 路径（用于 Maven 编译）。
// 优先使用记录的路径；找不到满足版本则回退到系统 JAVA_HOME。
func resolveJavaHome(javaVer string) string {
	need := 8
	if n, err := strconv.Atoi(strings.TrimSpace(javaVer)); err == nil && n > 0 {
		need = n
	}

	// 优先使用记录的有效路径，选择满足 need 的最小可用版本
	best := ""
	bestVer := 0
	for _, jh := range javaHomesCache {
		if !isJavaHomeValid(jh.Path) {
			continue
		}
		if jh.Version >= need && (best == "" || jh.Version < bestVer || bestVer < need) {
			best = jh.Path
			bestVer = jh.Version
		}
	}
	if best != "" {
		return best
	}
	// 回退到系统 JAVA_HOME
	if jh := os.Getenv("JAVA_HOME"); jh != "" {
		return jh
	}
	return ""
}

// 运行 javac -version 解析主版本号；失败返回 0
func detectJavaVersion(javac string) int {
	out, err := exec.Command(javac, "-version").CombinedOutput()
	if err != nil {
		return 0
	}
	// javac 输出形如: javac 26.0.2 或 javac 21.0.1 或 javac 1.8.0_xxx
	txt := string(out)
	for _, f := range strings.Fields(txt) {
		// 取每个字段小数点前的主版本号（如 "21.0.1" → 21）
		head := f
		if i := strings.IndexAny(f, "._"); i >= 0 {
			head = f[:i]
		}
		if n, err := strconv.Atoi(head); err == nil {
			// 旧格式 1.8.0_xxx → 主版本 8
			if n == 1 {
				if i := strings.Index(f, "."); i >= 0 && i+1 < len(f) {
					if m, err := strconv.Atoi(string(f[i+1])); err == nil {
						return m
					}
				}
				return n
			}
			return n
		}
	}
	return 0
}

// POST /api/scan-java：手动触发扫描并保存，返回最新列表
func scanJavaHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	list := scanJavaHomes()
	javaHomesCache = list
	saveJavaHomes()
	json.NewEncoder(w).Encode(JavaHomesData{
		ScannedAt: time.Now().Format(time.RFC3339),
		JavaHomes: list,
	})
}

// GET /api/java-homes：返回当前记录的 JDK 列表
func javaHomesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(JavaHomesData{
		ScannedAt: time.Now().Format(time.RFC3339),
		JavaHomes: javaHomesCache,
	})
}

// POST /api/pick-java-dir：弹出系统文件夹选择框，返回用户选中的目录路径
func pickJavaDirHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	dir, err := dialog.Directory().Title("请选择 JDK 目录（包含 bin/javac）").Browse()
	if err != nil {
		// 用户取消选择
		json.NewEncoder(w).Encode(map[string]interface{}{"cancelled": true, "path": ""})
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"cancelled": false, "path": dir})
}

// POST /api/add-java：将指定路径加入 Java 记录（自动检测版本），返回最新列表
func addJavaHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
		return
	}
	p := strings.TrimSpace(req.Path)
	if p == "" {
		http.Error(w, `{"error":"path empty"}`, http.StatusBadRequest)
		return
	}
	// 验证是否为有效 JDK 并检测版本
	javac := filepath.Join(p, "bin", "javac.exe")
	if _, err := os.Stat(javac); err != nil {
		javac = filepath.Join(p, "bin", "javac")
		if _, err := os.Stat(javac); err != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{"error": "该目录下未找到 bin/javac，不是有效的 JDK"})
			return
		}
	}
	ver := detectJavaVersion(javac)
	if ver <= 0 {
		json.NewEncoder(w).Encode(map[string]interface{}{"error": "无法识别该 JDK 的版本"})
		return
	}
	abs, _ := filepath.Abs(p)
	// 去重
	for _, jh := range javaHomesCache {
		if strings.EqualFold(jh.Path, abs) {
			// 已存在，更新版本
			javaHomesCache = []JavaHomeInfo{}
			break
		}
	}
	javaHomesCache = append(javaHomesCache, JavaHomeInfo{Path: abs, Version: ver})
	// 按版本排序
	sortJavaHomes()
	saveJavaHomes()
	json.NewEncoder(w).Encode(JavaHomesData{
		ScannedAt: time.Now().Format(time.RFC3339),
		JavaHomes: javaHomesCache,
	})
}

// POST /api/remove-java：从记录中移除指定路径的 Java，返回最新列表
func removeJavaHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
		return
	}
	target, _ := filepath.Abs(strings.TrimSpace(req.Path))
	var filtered []JavaHomeInfo
	for _, jh := range javaHomesCache {
		if !strings.EqualFold(jh.Path, target) {
			filtered = append(filtered, jh)
		}
	}
	javaHomesCache = filtered
	saveJavaHomes()
	json.NewEncoder(w).Encode(JavaHomesData{
		ScannedAt: time.Now().Format(time.RFC3339),
		JavaHomes: javaHomesCache,
	})
}

// 按版本升序对 Java 记录排序
func sortJavaHomes() {
	for i := 0; i < len(javaHomesCache); i++ {
		for j := i + 1; j < len(javaHomesCache); j++ {
			if javaHomesCache[j].Version < javaHomesCache[i].Version {
				javaHomesCache[i], javaHomesCache[j] = javaHomesCache[j], javaHomesCache[i]
			}
		}
	}
}

func decodeGBK(s []byte) string {
	decoder := simplifiedchinese.GBK.NewDecoder()
	out, _ := decoder.Bytes(s)
	return string(out)
}

type BuildRequest struct {
	PluginName    string `json:"pluginName"`
	PackageName   string `json:"packageName"`
	MainClass     string `json:"mainClass"`
	FullMain      string `json:"fullMain"`
	Version       string `json:"version"`
	Author        string `json:"author"`
	Website       string `json:"website"`
	GroupId       string `json:"groupId"`
	ArtifactId    string `json:"artifactId"`
	ApiVersion    string `json:"apiVersion"`    // e.g. "1.21"
	SpigotVersion string `json:"spigotVersion"` // e.g. "1.21.4-R0.1-SNAPSHOT"
	JavaVersion   string `json:"javaVersion"`   // e.g. "21"
	JavaCode      string `json:"javaCode"`
	PluginYaml    string `json:"pluginYml"`
	ConfigYaml    string `json:"configYml"`
	PomXml        string `json:"pomXml"`
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]string{
		"apiOrigin": _apiOrigin,
	})
}

func remotePassthroughHandler(remotePath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		client := &http.Client{Timeout: 8 * time.Second}
		targetURL := _apiOrigin + remotePath

		resp, err := client.Get(targetURL)
		if err != nil {
			// 网络不通时返回空对象，前端静默忽略
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("{}"))
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("{}"))
			return
		}
		w.WriteHeader(resp.StatusCode)
		w.Write(body)
	}
}

func main() {
	os.MkdirAll(TempBuildDir, 0755)

	port := getFreePort()
	addr := fmt.Sprintf(":%d", port)
	url := fmt.Sprintf("http://localhost:%d", port)

	http.Handle("/", http.FileServer(http.Dir(filepath.Join(ProgramDir, "resources"))))
	http.HandleFunc("/api/build", buildHandler)
	http.HandleFunc("/api/config", configHandler)
	http.HandleFunc("/api/settings", settingsHandler)
	http.HandleFunc("/api/session", sessionHandler)
	http.HandleFunc("/api/scan-java", scanJavaHandler)
	http.HandleFunc("/api/java-homes", javaHomesHandler)
	http.HandleFunc("/api/pick-java-dir", pickJavaDirHandler)
	http.HandleFunc("/api/add-java", addJavaHandler)
	http.HandleFunc("/api/remove-java", removeJavaHandler)
	http.HandleFunc("/api/proxy/auth", proxyAuthHandler)
	http.HandleFunc("/api/update", remotePassthroughHandler("/api/update.php"))
	http.HandleFunc("/api/announce", remotePassthroughHandler("/api/announce.php"))

	go func() {
		if err := http.ListenAndServe(addr, nil); err != nil {
			log.Fatal(err)
		}
	}()

	waitForServer(url)

	openUI(url)
}

func getFreePort() int {
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		return 8080
	}
	defer ln.Close()
	return ln.Addr().(*net.TCPAddr).Port
}

func waitForServer(url string) {
	client := &http.Client{Timeout: 500 * time.Millisecond}
	for i := 0; i < 20; i++ {
		resp, err := client.Get(url)
		if err == nil {
			resp.Body.Close()
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func deriveMachineKey() []byte {
	hostname, _ := os.Hostname()
	mac := hmac.New(sha256.New, []byte(_srvSecret))
	mac.Write([]byte("machine-session-key:"))
	mac.Write([]byte(hostname))
	return mac.Sum(nil)
}
func encryptSession(plaintext []byte) (ivB64, cipherB64 string, err error) {
	block, err := aes.NewCipher(deriveMachineKey())
	if err != nil {
		return "", "", fmt.Errorf("创建 AES 块失败: %w", err)
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", "", fmt.Errorf("创建 GCM 失败: %w", err)
	}
	iv := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, iv); err != nil {
		return "", "", fmt.Errorf("生成 IV 失败: %w", err)
	}
	ciphertext := gcm.Seal(nil, iv, plaintext, nil)
	return base64.StdEncoding.EncodeToString(iv),
		base64.StdEncoding.EncodeToString(ciphertext), nil
}
func decryptSession(ivB64, cipherB64 string) ([]byte, error) {
	iv, err := base64.StdEncoding.DecodeString(ivB64)
	if err != nil {
		return nil, fmt.Errorf("IV 解码失败: %w", err)
	}
	ciphertext, err := base64.StdEncoding.DecodeString(cipherB64)
	if err != nil {
		return nil, fmt.Errorf("密文解码失败: %w", err)
	}
	block, err := aes.NewCipher(deriveMachineKey())
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return gcm.Open(nil, iv, ciphertext, nil)
}
func sessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {

	case http.MethodGet:
		s := loadSettings()
		if s.SessionEnc == "" || s.SessionIV == "" {
			http.Error(w, `{"error":"no session"}`, http.StatusNotFound)
			return
		}
		plain, err := decryptSession(s.SessionIV, s.SessionEnc)
		if err != nil {
			log.Printf("会话解密失败（可能是换了电脑或文件损坏）: %v", err)
			s.SessionEnc = ""
			s.SessionIV = ""
			saveSettings(s)
			http.Error(w, `{"error":"decrypt failed"}`, http.StatusNotFound)
			return
		}
		var sess StoredSession
		if err := json.Unmarshal(plain, &sess); err != nil {
			http.Error(w, `{"error":"invalid session data"}`, http.StatusNotFound)
			return
		}
		if sess.Exp > 0 && time.Now().UnixMilli() > sess.Exp {
			log.Printf("会话已过期，清除存储")
			s.SessionEnc = ""
			s.SessionIV = ""
			saveSettings(s)
			http.Error(w, `{"error":"session expired"}`, http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"token": sess.Token,
			"user":  sess.User,
			"exp":   sess.Exp,
		})

	case http.MethodPost:
		var sess StoredSession
		if err := json.NewDecoder(r.Body).Decode(&sess); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}
		if sess.Token == "" {
			http.Error(w, `{"error":"token is required"}`, http.StatusBadRequest)
			return
		}
		plain, err := json.Marshal(sess)
		if err != nil {
			http.Error(w, `{"error":"marshal failed"}`, http.StatusInternalServerError)
			return
		}
		ivB64, encB64, err := encryptSession(plain)
		if err != nil {
			log.Printf("会话加密失败: %v", err)
			http.Error(w, `{"error":"encrypt failed"}`, http.StatusInternalServerError)
			return
		}
		s := loadSettings()
		s.SessionEnc = encB64
		s.SessionIV = ivB64
		if err := saveSettings(s); err != nil {
			log.Printf("会话保存失败: %v", err)
			http.Error(w, `{"error":"save failed"}`, http.StatusInternalServerError)
			return
		}
		log.Printf("会话已加密保存（TTL 至 %s）", time.UnixMilli(sess.Exp).Format(time.RFC3339))
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})

	case http.MethodDelete:
		s := loadSettings()
		s.SessionEnc = ""
		s.SessionIV = ""
		if err := saveSettings(s); err != nil {
			log.Printf("清除会话失败: %v", err)
			http.Error(w, `{"error":"clear failed"}`, http.StatusInternalServerError)
			return
		}
		log.Printf("会话已清除")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func loadSettings() AppSettings {
	data, err := os.ReadFile(SettingsFile)
	if err != nil {
		return AppSettings{OnlineMode: true}
	}
	var s AppSettings
	if err := json.Unmarshal(data, &s); err != nil {
		return AppSettings{OnlineMode: true}
	}
	return s
}

func saveSettings(s AppSettings) error {
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(SettingsFile, data, 0600)
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	switch r.Method {
	case http.MethodGet:
		s := loadSettings()
		json.NewEncoder(w).Encode(s)

	case http.MethodPost:
		var s AppSettings
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}
		if err := saveSettings(s); err != nil {
			log.Printf("保存设置失败: %v", err)
			http.Error(w, `{"error":"save failed"}`, http.StatusInternalServerError)
			return
		}
		log.Printf("设置已保存: onlineMode=%v", s.OnlineMode)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func buildHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("收到编译请求，方法: %s, URL: %s", r.Method, r.URL.Path)

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req BuildRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 构建整体超时（前端 90s 超时，后端多留余量主动终止进程）
	buildCtx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
	defer cancel()

	// 获取编译信号量：可排队，客户端断开或超时则放弃，避免长期阻塞
	select {
	case buildSem <- struct{}{}:
		defer func() { <-buildSem }()
	case <-buildCtx.Done():
		log.Printf("编译等待被取消或超时: %v", buildCtx.Err())
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"error": "编译队列繁忙，请稍后重试"})
		return
	}

	projectDir := filepath.Join(TempBuildDir, req.PluginName)

	if err := os.RemoveAll(projectDir); err != nil {
		log.Printf("无法清除旧构建目录 %s: %v，中止本次构建", projectDir, err)
		http.Error(w, "无法清除旧构建目录，请稍后重试", http.StatusInternalServerError)
		return
	}

	if err := os.MkdirAll(projectDir, 0755); err != nil {
		log.Printf("创建项目目录失败: %v", err)
		http.Error(w, "无法创建项目目录", http.StatusInternalServerError)
		return
	}

	packagePath := strings.ReplaceAll(req.PackageName, ".", "/")
	javaSourceDir := filepath.Join(projectDir, "src/main/java", packagePath)
	resDir := filepath.Join(projectDir, "src/main/resources")

	if err := os.MkdirAll(javaSourceDir, 0755); err != nil {
		log.Printf("创建源码目录失败: %v", err)
		http.Error(w, "无法创建源码目录", http.StatusInternalServerError)
		return
	}
	if err := os.MkdirAll(resDir, 0755); err != nil {
		log.Printf("创建资源目录失败: %v", err)
		http.Error(w, "无法创建资源目录", http.StatusInternalServerError)
		return
	}

	if req.PomXml != "" {
		writeFile(filepath.Join(projectDir, "pom.xml"), req.PomXml)
	} else {
		writeFile(filepath.Join(projectDir, "pom.xml"), getPom(req))
	}

	if req.PluginYaml != "" {
		writeFile(filepath.Join(resDir, "plugin.yml"), req.PluginYaml)
	} else {
		writeFile(filepath.Join(resDir, "plugin.yml"), getPluginYml(req))
	}

	if req.ConfigYaml != "" {
		writeFile(filepath.Join(resDir, "config.yml"), req.ConfigYaml)
	}

	javaFilePath := filepath.Join(javaSourceDir, req.MainClass+".java")
	if err := os.WriteFile(javaFilePath, []byte(req.JavaCode), 0644); err != nil {
		log.Printf("写入 Java 文件失败: %v", err)
		http.Error(w, "无法写入 Java 源文件", http.StatusInternalServerError)
		return
	}

	mavenCmd := MavenCommand
	mavenHome := filepath.Join(ProgramDir, "resources", "maven")

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" && strings.HasSuffix(mavenCmd, ".cmd") {
		cmd = exec.CommandContext(buildCtx, "cmd", "/c", mavenCmd, "clean", "package", "-DskipTests", "-q")
	} else {
		cmd = exec.CommandContext(buildCtx, mavenCmd, "clean", "package", "-DskipTests", "-q")
	}
	cmd.Dir = projectDir
	// 根据所需 Java 版本解析合适的 JDK 并设置 JAVA_HOME（支持 Java 25 等新版本）
	envList := os.Environ()
	if jh := resolveJavaHome(req.JavaVersion); jh != "" {
		envList = append(envList, "JAVA_HOME="+jh, "PATH="+jh+string(os.PathListSeparator)+filepath.Join(jh, "bin")+string(os.PathListSeparator)+os.Getenv("PATH"))
	}
	cmd.Env = append(envList, "MAVEN_HOME="+mavenHome)

	// Windows 下 cmd /c 会派生子进程，需连同整个进程树一起结束
	if runtime.GOOS == "windows" {
		cmd.Cancel = func() error {
			if cmd.Process == nil {
				return nil
			}
			taskkill := exec.Command("taskkill", "/F", "/T", "/PID", strconv.Itoa(cmd.Process.Pid))
			return taskkill.Run()
		}
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		switch {
		case buildCtx.Err() == context.DeadlineExceeded:
			log.Printf("Maven 编译超时，已终止进程")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusGatewayTimeout)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "编译超时，已终止构建进程，请稍后重试",
			})
			return
		case buildCtx.Err() == context.Canceled:
			log.Printf("客户端断开，编译已取消")
			return
		}
		decodedOutput := decodeGBK(output)
		log.Printf("Maven 编译失败: %v, 输出: %s", err, decodedOutput)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("Maven 编译失败: %v\n%s", err, decodedOutput),
		})
		return
	}

	targetDir := filepath.Join(projectDir, "target")
	jarFiles, err := filepath.Glob(filepath.Join(targetDir, "*.jar"))
	if err != nil || len(jarFiles) == 0 {
		log.Printf("未找到编译后的 JAR 文件，Glob 错误: %v，文件列表: %v", err, jarFiles)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "编译成功但未找到 JAR 文件",
		})
		return
	}

	jarPath := jarFiles[0]
	for _, f := range jarFiles {
		base := filepath.Base(f)
		if !strings.Contains(base, "sources") && !strings.Contains(base, "original") {
			jarPath = f
			break
		}
	}
	log.Printf("找到 JAR 文件: %s", jarPath)

	jarData, readErr := os.ReadFile(jarPath)
	if readErr != nil {
		log.Printf("读取 JAR 文件失败: %v", readErr)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "读取 JAR 文件失败"})
		return
	}

	defer func() {
		go func() {
			if rmErr := os.RemoveAll(projectDir); rmErr != nil {
				log.Printf("清理构建目录失败: %v", rmErr)
			}
		}()
	}()

	w.Header().Set("Content-Disposition", `attachment; filename="`+req.PluginName+`.jar"`)
	w.Header().Set("Content-Type", "application/java-archive")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(jarData)))
	w.WriteHeader(http.StatusOK)
	w.Write(jarData)
	log.Printf("JAR 文件已发送: %s (%d bytes)", jarPath, len(jarData))
}

func getPom(req BuildRequest) string {
	groupId := req.GroupId
	if groupId == "" {
		groupId = req.PackageName
	}
	artifactId := req.ArtifactId
	if artifactId == "" {
		artifactId = strings.ToLower(req.PluginName)
	}
	spigotVer := req.SpigotVersion
	if spigotVer == "" {
		spigotVer = "1.21.4-R0.1-SNAPSHOT"
	}
	javaVer := req.JavaVersion
	if javaVer == "" {
		javaVer = "21"
	}
	return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>` + groupId + `</groupId>
    <artifactId>` + artifactId + `</artifactId>
    <version>` + req.Version + `</version>
    <properties>
        <maven.compiler.source>` + javaVer + `</maven.compiler.source>
        <maven.compiler.target>` + javaVer + `</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.spigotmc</groupId>
            <artifactId>spigot-api</artifactId>
            <version>` + spigotVer + `</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <repositories>
        <repository>
            <id>spigot-repo</id>
            <url>https://hub.spigotmc.org/nexus/content/repositories/snapshots/</url>
        </repository>
    </repositories>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
                <configuration>
                    <archive>
                        <manifestEntries>
                            <Main-Class>` + req.PackageName + `.` + req.MainClass + `</Main-Class>
                        </manifestEntries>
                    </archive>
                    <finalName>` + req.PluginName + `</finalName>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
}

func getPluginYml(req BuildRequest) string {
	apiVer := req.ApiVersion
	if apiVer == "" {
		apiVer = "1.21"
	}
	return `name: ` + req.PluginName + `
version: ` + req.Version + `
main: ` + req.PackageName + `.` + req.MainClass + `
author: ` + req.Author + `
website: ` + req.Website + `
api-version: ` + apiVer
}

func writeFile(path, content string) {
	os.WriteFile(path, []byte(content), 0644)
}
