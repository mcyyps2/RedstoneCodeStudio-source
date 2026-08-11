//go:build windows

package main

import "github.com/sqweek/dialog"

// pickDirectory 在 Windows 上弹出系统文件夹选择框，返回选中的目录路径。
// 用户取消或失败时返回空字符串。
func pickDirectory() string {
	dir, err := dialog.Directory().Title("请选择 JDK 目录（包含 bin/javac）").Browse()
	if err != nil {
		return ""
	}
	return dir
}
