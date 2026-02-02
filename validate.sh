#!/bin/bash

echo "=== Word 2007 编辑器验证脚本 ==="
echo ""

echo "1. 检查 Node.js 版本..."
node --version

echo ""
echo "2. 检查项目文件..."
if [ -f "package.json" ] && [ -f "main.js" ] && [ -f "index.html" ]; then
    echo "   ✓ 核心文件存在"
else
    echo "   ✗ 缺少核心文件"
    exit 1
fi

echo ""
echo "3. 检查依赖..."
if [ -d "node_modules" ]; then
    echo "   ✓ 依赖已安装"
else
    echo "   ✗ 依赖未安装，运行 'npm install'"
    exit 1
fi

echo ""
echo "4. 验证 Electron..."
node -e "require('electron'); console.log('   ✓ Electron 可用');"

echo ""
echo "5. 验证 Mammoth.js..."
node -e "require('mammoth'); console.log('   ✓ Mammoth.js 可用');"

echo ""
echo "=== 验证完成 ==="
echo ""
echo "运行应用: npm start"
