# 核心脚本清单

## controllers/GameController.ts

- 关卡入口。
- 负责加载关卡、驱动固定步长模拟、胜负判定、工具模式切换。

## core/GameTypes.ts

- 全局类型定义：关卡结构、角色状态、工具模式等。

## core/LevelLoader.ts

- 从 `JsonAsset` 解析并校验关卡数据。
- 在加载阶段拦截字段错误（行数、列数、方向值等）。

## core/TerrainGrid.ts

- 网格地形模型。
- 提供 `dig/fill`、边界判断、保护格判断。

## sim/GameSimulator.ts

- 小人生成与移动模拟。
- 规则：重力优先，水平移动碰撞后反向。
- 统计：出生、存活、到达、死亡。

## render/TerrainDebugRenderer.ts

- 用 `Graphics` 绘制调试画面（地形、网格、出生点、终点、小人）。
- 用于玩法验证阶段的快速可视化。

## input/TerrainPainterInput.ts

- 触摸输入映射到网格坐标。
- 支持点击/拖动挖填。
