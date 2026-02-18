import { JsonAsset } from 'cc';
import {
  DEFAULT_GOAL_DEBUG,
  DEFAULT_GOAL_VISUAL,
  DEFAULT_SIMULATION_RULES,
  Direction,
  GoalDebugConfig,
  GoalVisualConfig,
  Int2,
  LevelConfig,
  MovementPriority,
  Rect,
  RgbaColor,
  SimulationRules,
} from './GameTypes';

function assertNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`关卡字段非法: ${path}`);
  }
  return value;
}

function assertInteger(value: unknown, path: string): number {
  const n = assertNumber(value, path);
  if (!Number.isInteger(n)) {
    throw new Error(`关卡字段非法: ${path}, 必须是整数`);
  }
  return n;
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Error(`关卡字段非法: ${path}`);
  }
  return value;
}

function assertBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`关卡字段非法: ${path}`);
  }
  return value;
}

function parseInt2(value: any, path: string): Int2 {
  return {
    x: assertNumber(value?.x, `${path}.x`),
    y: assertNumber(value?.y, `${path}.y`),
  };
}

function parseRect(value: any, path: string): Rect {
  return {
    x: assertNumber(value?.x, `${path}.x`),
    y: assertNumber(value?.y, `${path}.y`),
    width: assertNumber(value?.width, `${path}.width`),
    height: assertNumber(value?.height, `${path}.height`),
  };
}

function parseRectInt(value: any, path: string): Rect {
  const rect = {
    x: assertInteger(value?.x, `${path}.x`),
    y: assertInteger(value?.y, `${path}.y`),
    width: assertInteger(value?.width, `${path}.width`),
    height: assertInteger(value?.height, `${path}.height`),
  };
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(`关卡字段非法: ${path}, width/height 必须 > 0`);
  }
  return rect;
}

function parseDirection(value: unknown, path: string): Direction {
  if (value !== 1 && value !== -1) {
    throw new Error(`关卡字段非法: ${path}, 只允许 1 或 -1`);
  }
  return value;
}

function parseMovementPriority(value: unknown, path: string): MovementPriority {
  if (value !== 'gravity-then-horizontal' && value !== 'horizontal-then-gravity') {
    throw new Error(`关卡字段非法: ${path}, 只允许 'gravity-then-horizontal' 或 'horizontal-then-gravity'`);
  }
  return value;
}

function parseSimulationRules(rawRules: any): SimulationRules {
  if (rawRules === undefined || rawRules === null) {
    return { ...DEFAULT_SIMULATION_RULES };
  }

  if (typeof rawRules !== 'object' || Array.isArray(rawRules)) {
    throw new Error('关卡字段非法: simulationRules 必须是对象');
  }

  const rules: SimulationRules = { ...DEFAULT_SIMULATION_RULES };

  if (rawRules.movementPriority !== undefined) {
    rules.movementPriority = parseMovementPriority(rawRules.movementPriority, 'simulationRules.movementPriority');
  }
  if (rawRules.reverseWhenBlocked !== undefined) {
    rules.reverseWhenBlocked = assertBoolean(rawRules.reverseWhenBlocked, 'simulationRules.reverseWhenBlocked');
  }
  if (rawRules.checkGoalBeforeMove !== undefined) {
    rules.checkGoalBeforeMove = assertBoolean(rawRules.checkGoalBeforeMove, 'simulationRules.checkGoalBeforeMove');
  }
  if (rawRules.checkGoalAfterMove !== undefined) {
    rules.checkGoalAfterMove = assertBoolean(rawRules.checkGoalAfterMove, 'simulationRules.checkGoalAfterMove');
  }
  if (rawRules.agentCollisionWidthCells !== undefined) {
    rules.agentCollisionWidthCells = assertNumber(
      rawRules.agentCollisionWidthCells,
      'simulationRules.agentCollisionWidthCells',
    );
  }
  if (rawRules.agentCollisionHeightCells !== undefined) {
    rules.agentCollisionHeightCells = assertNumber(
      rawRules.agentCollisionHeightCells,
      'simulationRules.agentCollisionHeightCells',
    );
  }
  if (rawRules.maxStepUpCells !== undefined) {
    rules.maxStepUpCells = assertNumber(rawRules.maxStepUpCells, 'simulationRules.maxStepUpCells');
  }
  if (rawRules.maxStepDownCells !== undefined) {
    rules.maxStepDownCells = assertNumber(rawRules.maxStepDownCells, 'simulationRules.maxStepDownCells');
  }
  if (rawRules.spawnRetryDelaySec !== undefined) {
    rules.spawnRetryDelaySec = assertNumber(rawRules.spawnRetryDelaySec, 'simulationRules.spawnRetryDelaySec');
  }
  if (rawRules.outOfBoundsKillY !== undefined) {
    rules.outOfBoundsKillY = assertNumber(rawRules.outOfBoundsKillY, 'simulationRules.outOfBoundsKillY');
  }
  if (rawRules.maxSafeFallCells !== undefined) {
    rules.maxSafeFallCells = assertNumber(rawRules.maxSafeFallCells, 'simulationRules.maxSafeFallCells');
  }

  return rules;
}

function assertRgbaColor(value: unknown, path: string): RgbaColor {
  if (!Array.isArray(value) || value.length !== 4) {
    throw new Error(`关卡字段非法: ${path}, 必须是长度为 4 的 RGBA 数组`);
  }

  const rgba = value.map((v, i) => assertInteger(v, `${path}[${i}]`));
  for (let i = 0; i < rgba.length; i += 1) {
    if (rgba[i] < 0 || rgba[i] > 255) {
      throw new Error(`关卡字段非法: ${path}[${i}], 必须在 0~255`);
    }
  }
  return [rgba[0], rgba[1], rgba[2], rgba[3]];
}

function parseGoalVisual(rawVisual: any): GoalVisualConfig {
  if (rawVisual === undefined || rawVisual === null) {
    return {
      ...DEFAULT_GOAL_VISUAL,
      positionCell: { ...DEFAULT_GOAL_VISUAL.positionCell },
    };
  }
  if (typeof rawVisual !== 'object' || Array.isArray(rawVisual)) {
    throw new Error('关卡字段非法: goalVisual 必须是对象');
  }

  const visual: GoalVisualConfig = {
    ...DEFAULT_GOAL_VISUAL,
    positionCell: { ...DEFAULT_GOAL_VISUAL.positionCell },
  };
  if (rawVisual.spritePath !== undefined) {
    visual.spritePath = assertString(rawVisual.spritePath, 'goalVisual.spritePath').trim();
    if (!visual.spritePath) {
      throw new Error('关卡字段非法: goalVisual.spritePath 不能为空');
    }
  }
  if (rawVisual.useFixedPixelSize !== undefined) {
    visual.useFixedPixelSize = assertBoolean(rawVisual.useFixedPixelSize, 'goalVisual.useFixedPixelSize');
  }
  if (rawVisual.widthPx !== undefined) {
    visual.widthPx = assertNumber(rawVisual.widthPx, 'goalVisual.widthPx');
  }
  if (rawVisual.heightPx !== undefined) {
    visual.heightPx = assertNumber(rawVisual.heightPx, 'goalVisual.heightPx');
  }
  if (rawVisual.longSideScale !== undefined) {
    visual.longSideScale = assertNumber(rawVisual.longSideScale, 'goalVisual.longSideScale');
  }
  if (rawVisual.positionMode !== undefined) {
    const mode = assertString(rawVisual.positionMode, 'goalVisual.positionMode');
    if (mode !== 'goal-center' && mode !== 'absolute-cell') {
      throw new Error("关卡字段非法: goalVisual.positionMode 只允许 'goal-center' 或 'absolute-cell'");
    }
    visual.positionMode = mode;
  }
  if (rawVisual.positionCell !== undefined) {
    visual.positionCell = parseInt2(rawVisual.positionCell, 'goalVisual.positionCell');
  }

  if (visual.widthPx <= 0 || visual.heightPx <= 0 || visual.longSideScale <= 0) {
    throw new Error('关卡字段非法: goalVisual.widthPx/heightPx/longSideScale 必须 > 0');
  }
  return visual;
}

function parseGoalDebug(rawRoot: any): GoalDebugConfig {
  const rawDebug = rawRoot?.goalDebug ?? rawRoot?.goal?.debug;
  if (rawDebug === undefined || rawDebug === null) {
    return { ...DEFAULT_GOAL_DEBUG };
  }
  if (typeof rawDebug !== 'object' || Array.isArray(rawDebug)) {
    throw new Error('关卡字段非法: goalDebug 必须是对象');
  }

  const debug: GoalDebugConfig = {
    showArea: DEFAULT_GOAL_DEBUG.showArea,
    fillRgba: [...DEFAULT_GOAL_DEBUG.fillRgba] as RgbaColor,
    strokeRgba: [...DEFAULT_GOAL_DEBUG.strokeRgba] as RgbaColor,
  };
  if (rawDebug.showArea !== undefined) {
    debug.showArea = assertBoolean(rawDebug.showArea, 'goalDebug.showArea');
  }
  if (rawDebug.fillRgba !== undefined) {
    debug.fillRgba = assertRgbaColor(rawDebug.fillRgba, 'goalDebug.fillRgba');
  }
  if (rawDebug.strokeRgba !== undefined) {
    debug.strokeRgba = assertRgbaColor(rawDebug.strokeRgba, 'goalDebug.strokeRgba');
  }
  return debug;
}

function validateTerrainRows(terrainRaw: unknown, cols: number, rows: number, path: string): string[] {
  if (!Array.isArray(terrainRaw) || terrainRaw.length !== rows) {
    throw new Error(`关卡字段非法: ${path} 行数必须与 gridSize.rows 一致`);
  }

  return terrainRaw.map((line, idx) => {
    const row = assertString(line, `${path}[${idx}]`);
    if (row.length !== cols) {
      throw new Error(`关卡字段非法: ${path}[${idx}] 长度必须为 ${cols}`);
    }
    for (let i = 0; i < row.length; i += 1) {
      const ch = row[i];
      if (ch !== '#' && ch !== '.' && ch !== 'o' && ch !== 'O') {
        throw new Error(`关卡字段非法: ${path}[${idx}][${i}] 只允许 '#', '.', 'o'`);
      }
    }
    return row;
  });
}

function parseRectArray(raw: unknown, path: string): Rect[] {
  if (raw === undefined) {
    return [];
  }
  if (!Array.isArray(raw)) {
    throw new Error(`关卡字段非法: ${path} 必须是数组`);
  }
  return raw.map((item, idx) => parseRectInt(item, `${path}[${idx}]`));
}

function paintRect(terrainTopDown: string[][], rect: Rect, cell: '#' | 'o' | '.', cols: number, rows: number): void {
  const x0 = Math.max(0, rect.x);
  const y0 = Math.max(0, rect.y);
  const x1 = Math.min(cols, rect.x + rect.width);
  const y1 = Math.min(rows, rect.y + rect.height);
  if (x0 >= x1 || y0 >= y1) {
    return;
  }

  for (let y = y0; y < y1; y += 1) {
    const rowTopDown = rows - 1 - y;
    const row = terrainTopDown[rowTopDown];
    for (let x = x0; x < x1; x += 1) {
      row[x] = cell;
    }
  }
}

function generateTerrainFromTemplate(rawTemplate: unknown, cols: number, rows: number): string[] {
  if (typeof rawTemplate !== 'object' || rawTemplate === null || Array.isArray(rawTemplate)) {
    throw new Error('关卡字段非法: terrainTemplate 必须是对象');
  }

  const template = rawTemplate as any;
  const kind = template.kind === undefined ? 'layered' : assertString(template.kind, 'terrainTemplate.kind');
  if (kind !== 'layered') {
    throw new Error(`关卡字段非法: terrainTemplate.kind=${kind}, 当前仅支持 'layered'`);
  }

  const topAirRows =
    template.topAirRows === undefined ? 0 : assertInteger(template.topAirRows, 'terrainTemplate.topAirRows');
  if (topAirRows < 0 || topAirRows > rows) {
    throw new Error(`关卡字段非法: terrainTemplate.topAirRows 必须在 [0, ${rows}]`);
  }

  const terrainTopDown = Array.from({ length: rows }, () => Array(cols).fill('#'));
  for (let rowTop = 0; rowTop < topAirRows; rowTop += 1) {
    terrainTopDown[rowTop].fill('.');
  }

  const carveEditableRects = parseRectArray(template.carveEditableRects, 'terrainTemplate.carveEditableRects');
  const forceSolidRects = parseRectArray(template.forceSolidRects, 'terrainTemplate.forceSolidRects');
  const forceSkyRects = parseRectArray(template.forceSkyRects, 'terrainTemplate.forceSkyRects');

  for (const rect of carveEditableRects) {
    paintRect(terrainTopDown, rect, 'o', cols, rows);
  }
  for (const rect of forceSolidRects) {
    paintRect(terrainTopDown, rect, '#', cols, rows);
  }
  for (const rect of forceSkyRects) {
    paintRect(terrainTopDown, rect, '.', cols, rows);
  }

  return terrainTopDown.map((row) => row.join(''));
}

function normalizeTerrain(raw: any, cols: number, rows: number): string[] {
  if (raw?.terrain !== undefined) {
    return validateTerrainRows(raw.terrain, cols, rows, 'terrain');
  }
  if (raw?.terrainTemplate !== undefined) {
    const generated = generateTerrainFromTemplate(raw.terrainTemplate, cols, rows);
    return validateTerrainRows(generated, cols, rows, 'terrainTemplate.generatedTerrain');
  }
  throw new Error('关卡字段非法: terrain 或 terrainTemplate 至少需要一个');
}

function addProtectedCellUnique(cells: Int2[], dedupe: Set<string>, x: number, y: number): void {
  const key = `${x},${y}`;
  if (dedupe.has(key)) {
    return;
  }
  dedupe.add(key);
  cells.push({ x, y });
}

function parseProtectedCells(raw: any, cols: number, rows: number): Int2[] {
  const cells: Int2[] = [];
  const dedupe = new Set<string>();

  const explicitCellsRaw = Array.isArray(raw?.protectedCells) ? raw.protectedCells : [];
  for (let i = 0; i < explicitCellsRaw.length; i += 1) {
    const p = parseInt2(explicitCellsRaw[i], `protectedCells[${i}]`);
    addProtectedCellUnique(cells, dedupe, p.x, p.y);
  }

  const protectedRects = parseRectArray(raw?.protectedRects, 'protectedRects');
  for (const rect of protectedRects) {
    const x0 = Math.max(0, rect.x);
    const y0 = Math.max(0, rect.y);
    const x1 = Math.min(cols, rect.x + rect.width);
    const y1 = Math.min(rows, rect.y + rect.height);
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        addProtectedCellUnique(cells, dedupe, x, y);
      }
    }
  }

  return cells;
}

export function loadLevelConfig(jsonAsset: JsonAsset): LevelConfig {
  const raw = jsonAsset.json as any;
  const cols = assertNumber(raw?.gridSize?.cols, 'gridSize.cols');
  const rows = assertNumber(raw?.gridSize?.rows, 'gridSize.rows');
  const cellSize = assertNumber(raw?.gridSize?.cellSize, 'gridSize.cellSize');
  const normalizedTerrain = normalizeTerrain(raw, cols, rows);
  const normalizedProtectedCells = parseProtectedCells(raw, cols, rows);
  const goalVisual = parseGoalVisual(raw?.goalVisual);
  const goalDebug = parseGoalDebug(raw);

  return {
    id: assertString(raw?.id, 'id'),
    name: assertString(raw?.name, 'name'),
    gridSize: { cols, rows, cellSize },
    timeLimitSec: assertNumber(raw?.timeLimitSec, 'timeLimitSec'),
    requiredSaved: assertNumber(raw?.requiredSaved, 'requiredSaved'),
    spawn: {
      position: parseInt2(raw?.spawn?.position, 'spawn.position'),
      direction: parseDirection(raw?.spawn?.direction, 'spawn.direction'),
      count: assertNumber(raw?.spawn?.count, 'spawn.count'),
      intervalSec: assertNumber(raw?.spawn?.intervalSec, 'spawn.intervalSec'),
    },
    goal: parseRect(raw?.goal, 'goal'),
    goalVisual,
    goalDebug,
    simulationRules: parseSimulationRules(raw?.simulationRules),
    protectedCells: normalizedProtectedCells,
    terrain: normalizedTerrain,
  };
}
