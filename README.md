# Pipol 风格微信小游戏 - Cocos 开工包

这个目录是一个可直接开工的最小原型骨架，目标是：

- 玩法复刻：挖/填地形 + 小人自动行走到终点
- 表达重制：美术、角色、UI、命名全部原创
- 平台目标：微信小游戏（通过 Cocos Creator 3.8.5 导出）

## 目录结构

```text
assets/
  levels/
    level_001.json            # 第一关数据
  scripts/
    controllers/
      GameController.ts       # 主控制器（关卡加载/模拟/胜负）
    core/
      GameTypes.ts            # 类型定义
      LevelLoader.ts          # 关卡 JSON 解析
      TerrainGrid.ts          # 网格地形与挖填规则
    input/
      TerrainPainterInput.ts  # 触控挖填输入
    render/
      TerrainDebugRenderer.ts # 调试渲染（Graphics）
    sim/
      GameSimulator.ts        # 小人生成与移动模拟
```

## 快速接入（Cocos Creator 3.8.5）

1. 新建一个 2D 项目（TypeScript）。
2. 把本目录下 `assets/levels` 和 `assets/scripts` 整体拷进你的项目 `assets/`。
3. 场景中创建一个 Node（建议命名 `GameRoot`），并挂载脚本：
- `GameController`
- `TerrainDebugRenderer`
- `TerrainPainterInput`
4. 挂在同一个 `GameRoot` 后，默认会自动从 `assets/resources/levels/` 加载关卡（无需手拖 `levelJson`）。
5. 运行后：
- 默认模式是 `Dig`，点击网格可挖空。
- 调用 `GameController.toggleToolMode()` 可切换 `Fill`。

## 说明

- 当前是“逻辑可玩”原型，渲染为调试样式（方块+圆点），便于先验证手感。
- 坐标系采用“左下角为 (0,0)”的网格规则。
- `level_001.json` 的 `terrain` 数组是“从上到下”书写，加载时会自动转换到底部原点坐标。
- `terrain` 字符：
- `#` 实体且可编辑（可挖/可填）
- `o` 空格但可编辑（土层洞）
- `.` 空格且不可编辑（天空/管道区）

## 文档

- `docs/core-scripts.md`: 核心脚本职责清单
- `docs/level-json-format.md`: 关卡 JSON 字段规范
- `docs/first-level-tasks.md`: 第一关任务拆分
- `docs/GameSpec.md`: 复刻玩法规格（行为基线）
- `docs/PROJECT_PROGRESS.md`: 当前进度总览（下次会话优先阅读）

## 回归测试

```bash
node tools/replay-baselines.mjs
```

用于验证关键玩法基准（生成、移动、掉落、终点判定）是否偏离规格。
当前已覆盖静态移动与挖/填动作回放。
