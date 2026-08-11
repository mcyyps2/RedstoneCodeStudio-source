//go:build !windows

package main

// pickDirectory 在非 Windows 平台上不弹出系统对话框（避免依赖系统库）。
// 返回空字符串，前端会提示用户手动输入 JDK 路径。
func pickDirectory() string {
	return ""
}
