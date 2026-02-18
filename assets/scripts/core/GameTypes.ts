export enum ToolMode {
  Dig = 'dig',
  Fill = 'fill',
}

export type Direction = -1 | 1;
export type MovementPriority = 'gravity-then-horizontal' | 'horizontal-then-gravity';

export interface Int2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridSize {
  cols: number;
  rows: number;
  cellSize: number;
}

export interface SpawnConfig {
  position: Int2;
  direction: Direction;
  count: number;
  intervalSec: number;
}

export interface SimulationRules {
  movementPriority: MovementPriority;
  reverseWhenBlocked: boolean;
  checkGoalBeforeMove: boolean;
  checkGoalAfterMove: boolean;
  agentCollisionWidthCells: number;
  agentCollisionHeightCells: number;
  maxStepUpCells: number;
  maxStepDownCells: number;
  spawnRetryDelaySec: number;
  outOfBoundsKillY: number;
  maxSafeFallCells: number;
}

export type RgbaColor = [number, number, number, number];

export interface GoalVisualConfig {
  spritePath: string;
  useFixedPixelSize: boolean;
  widthPx: number;
  heightPx: number;
  longSideScale: number;
  positionMode: 'goal-center' | 'absolute-cell';
  positionCell: Int2;
}

export interface GoalDebugConfig {
  showArea: boolean;
  fillRgba: RgbaColor;
  strokeRgba: RgbaColor;
}

export const DEFAULT_SIMULATION_RULES: SimulationRules = {
  movementPriority: 'gravity-then-horizontal',
  reverseWhenBlocked: true,
  checkGoalBeforeMove: true,
  checkGoalAfterMove: true,
  agentCollisionWidthCells: 1,
  agentCollisionHeightCells: 1,
  maxStepUpCells: 1,
  maxStepDownCells: 1,
  spawnRetryDelaySec: 0.2,
  outOfBoundsKillY: -1,
  maxSafeFallCells: -1,
};

export const DEFAULT_GOAL_VISUAL: GoalVisualConfig = {
  spritePath: 'images/goal_house_transparent_80k',
  useFixedPixelSize: true,
  widthPx: 64,
  heightPx: 56,
  longSideScale: 2,
  positionMode: 'goal-center',
  positionCell: { x: 0, y: 0 },
};

export const DEFAULT_GOAL_DEBUG: GoalDebugConfig = {
  showArea: false,
  fillRgba: [255, 243, 150, 70],
  strokeRgba: [255, 246, 138, 255],
};

export interface LevelConfig {
  id: string;
  name: string;
  gridSize: GridSize;
  timeLimitSec: number;
  requiredSaved: number;
  spawn: SpawnConfig;
  goal: Rect;
  goalVisual: GoalVisualConfig;
  goalDebug: GoalDebugConfig;
  simulationRules: SimulationRules;
  protectedCells: Int2[];
  terrain: string[];
}

export interface AgentState {
  id: number;
  pos: Int2;
  direction: Direction;
  ageSec: number;
  fallCells: number;
  reachedGoal: boolean;
  dead: boolean;
}

export interface SimStats {
  spawned: number;
  alive: number;
  saved: number;
  dead: number;
}
