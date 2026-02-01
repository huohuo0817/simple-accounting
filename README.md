# 记账本 (Simple Accounting)

一个简单的月度盘点记账应用，专注于宏观财务把控。

## 功能特点

- 不记录日常流水账，只在月底盘点一次
- 通过趋势图了解财务趋势
- 通过数据卡片快速查看关键指标
- 设置目标并追踪进度
- 简单易用的 Excel 导出/导入功能
- 本地数据存储，安全隐私
- 响应式设计，适配桌面和移动端

## 技术栈

- React 18 + TypeScript
- Vite
- Ant Design
- ECharts
- LocalStorage

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署

此项目已配置为通过 Vercel 部署：

1. Fork 或克隆此仓库到你的 GitHub 账号
2. 在 Vercel 中导入项目
3. Vercel 会自动构建和部署

访问地址：`https://simple-accounting.vercel.app`（或你的自定义域名）

## 数据说明

所有数据存储在浏览器的 LocalStorage 中，不会上传到任何服务器。更换设备或清除浏览器缓存会导致数据丢失，建议定期导出 Excel 备份。

## 许可证

MIT
