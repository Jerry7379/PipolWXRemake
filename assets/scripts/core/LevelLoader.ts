import { JsonAsset } from 'cc';
import {
  DEFAULT_SIMULATION_RULES,
  Direction,
  Int2,
  LevelConfig,
  MovementPriority,
  Rect,
  SimulationRules,
} from './GameTypes';

function assertNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`关卡字段非法: ${path}`);
  }
  return value;
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

export function loadLevelConfig(jsonAsset: JsonAsset): LevelConfig {
  const raw = jsonAsset.json as any;
  const cols = assertNumber(raw?.gridSize?.cols, 'gridSize.cols');
  const rows = assertNumber(raw?.gridSize?.rows, 'gridSize.rows');
  const cellSize = assertNumber(raw?.gridSize?.cellSize, 'gridSize.cellSize');

  const terrain = raw?.terrain as unknown;
  if (!Array.isArray(terrain) || terrain.length !== rows) {
    throw new Error('关卡字段非法: terrain 行数必须与 gridSize.rows 一致');
  }

  const normalizedTerrain = terrain.map((line, idx) => {
    const row = assertString(line, `terrain[${idx}]`);
    if (row.length !== cols) {
      throw new Error(`关卡字段非法: terrain[${idx}] 长度必须为 ${cols}`);
    }
    for (let i = 0; i < row.length; i += 1) {
      const ch = row[i];
      if (ch !== '#' && ch !== '.' && ch !== 'o' && ch !== 'O') {
        throw new Error(`关卡字段非法: terrain[${idx}][${i}] 只允许 '#', '.', 'o'`);
      }
    }
    return row;
  });

  const protectedCellsRaw = Array.isArray(raw?.protectedCells) ? raw.protectedCells : [];

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
    simulationRules: parseSimulationRules(raw?.simulationRules),
    protectedCells: protectedCellsRaw.map((item: any, idx: number) => parseInt2(item, `protectedCells[${idx}]`)),
    terrain: normalizedTerrain,
  };
}
