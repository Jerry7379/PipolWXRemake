# 第一关实现任务拆分

## 目标

把 `level_001.json` 做到“可通关 + 手感稳定 + 可继续扩关”。

## 任务顺序

1. 场景接入
- 挂载 `GameController` / `TerrainDebugRenderer` / `TerrainPainterInput`
- 使用默认自动加载（`assets/resources/levels/level_001.json`）
- 跑通基础循环（生成、移动、胜负日志）

2. 挖填交互验证
- 验证 `Dig` 能打通路径
- 验证 `Fill` 能搭桥
- 验证受保护格子不可修改

3. 关卡调参
- 调整 `spawn.count`、`requiredSaved`
- 调整地形字符串，确保“1~2 次关键操作可解”

4. UI 最小闭环
- 添加顶部 HUD：已救人数/目标人数/剩余时间
- 添加按钮：Dig / Fill / Restart

5. 可发布前检查
- 微信端帧率稳定性（真机）
- 包体与资源分包策略
- 引导提示（第一次进入）
