package tools

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

func PyRun(fileName string) ([]byte, error) {

	// 检查文件是否存在
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		return nil, fmt.Errorf("脚本文件不存在: %s", fileName)
	}

	// 执行 Python 脚本的逻辑
	cmd := exec.Command("python", fileName)

	// 设置环境变量确保UTF-8编码
	cmd.Env = append(os.Environ(),
		"PYTHONIOENCODING=utf-8",
		"LANG=en_US.UTF-8",
		"LC_ALL=en_US.UTF-8",
	)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// 运行命令
	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("脚本执行错误: %v", err)
	}

	// 获取原始输出
	output := stdout.Bytes()

	// 调试信息
	fmt.Printf("收到 %d 字节数据\n", len(output))

	if len(output) == 0 {
		return nil, fmt.Errorf("脚本没有输出任何内容")
	}

	return output, nil
}
