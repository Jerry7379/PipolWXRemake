#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASELINE_DIR = path.join(ROOT, 'tools', 'baselines');

const DEFAULT_RULES = {
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

function loadCases() {
  const files = fs
    .readdirSync(BASELINE_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const full = path.join(BASELINE_DIR, file);
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  });
}

function createTerrain(level) {
  const cols = level.gridSize.cols;
  const rows = level.gridSize.rows;
  const cells = new Uint8Array(cols * rows);
  const editable = new Uint8Array(cols * rows);
  const protectedSet = new Set(
    (level.protectedCells ?? []).map((cell) => `${Number(cell.x)},${Number(cell.y)}`),
  );

  for (let y = 0; y < rows; y += 1) {
    const sourceRow = level.terrain[rows - 1 - y];
    for (let x = 0; x < cols; x += 1) {
      const i = y * cols + x;
      const ch = sourceRow[x];
      if (ch === '#') {
        cells[i] = 1;
        editable[i] = 1;
      } else if (ch === 'o' || ch === 'O') {
        cells[i] = 0;
        editable[i] = 1;
      } else {
        cells[i] = 0;
        editable[i] = 0;
      }
    }
  }

  const inBounds = (x, y) => x >= 0 && x < cols && y >= 0 && y < rows;
  const index = (x, y) => y * cols + x;
  const key = (x, y) => `${x},${y}`;

  return {
    inBounds,
    isSolid(x, y) {
      if (!inBounds(x, y)) {
        return false;
      }
      return cells[index(x, y)] === 1;
    },
    isEditable(x, y) {
      if (!inBounds(x, y)) {
        return false;
      }
      return editable[index(x, y)] === 1;
    },
    isProtected(x, y) {
      return protectedSet.has(key(x, y));
    },
    dig(x, y) {
      if (!inBounds(x, y) || this.isProtected(x, y) || !this.isEditable(x, y)) {
        return false;
      }
      const i = index(x, y);
      if (cells[i] === 0) {
        return false;
      }
      cells[i] = 0;
      return true;
    },
    fill(x, y) {
      if (!inBounds(x, y) || this.isProtected(x, y) || !this.isEditable(x, y)) {
        return false;
      }
      const i = index(x, y);
      if (cells[i] === 1) {
        return false;
      }
      cells[i] = 1;
      return true;
    },
  };
}

function simulate(caseData) {
  const level = caseData.level;
  const dt = caseData.fixedStepSec ?? 0.1;
  const maxTicks = caseData.maxTicks ?? Math.ceil((level.timeLimitSec ?? 180) / dt);
  const terrain = createTerrain(level);
  const rules = { ...DEFAULT_RULES, ...(level.simulationRules ?? {}) };
  const agentWidth = Math.max(1, Math.floor(rules.agentCollisionWidthCells));
  const agentHeight = Math.max(1, Math.floor(rules.agentCollisionHeightCells));
  const agents = [];

  let nextId = 1;
  let spawnTimer = 0;
  let spawned = 0;
  let saved = 0;
  let dead = 0;
  let ticks = 0;
  let changedActions = 0;

  const isCellInsideAgent = (agent, x, y) =>
    x >= agent.pos.x && x < agent.pos.x + agentWidth && y >= agent.pos.y && y < agent.pos.y + agentHeight;

  const hasAgentAtCell = (x, y) => agents.some((a) => !a.dead && !a.reachedGoal && isCellInsideAgent(a, x, y));

  const hasAgentInRect = (x, y, width, height) =>
    agents.some((a) => {
      if (a.dead || a.reachedGoal) {
        return false;
      }
      const ax0 = a.pos.x;
      const ay0 = a.pos.y;
      const ax1 = ax0 + agentWidth;
      const ay1 = ay0 + agentHeight;
      const bx0 = x;
      const by0 = y;
      const bx1 = x + width;
      const by1 = y + height;
      return ax0 < bx1 && ax1 > bx0 && ay0 < by1 && ay1 > by0;
    });

  const tryReachGoal = (agent) => {
    if (agent.dead || agent.reachedGoal) {
      return false;
    }
    const ax0 = agent.pos.x;
    const ay0 = agent.pos.y;
    const ax1 = ax0 + agentWidth;
    const ay1 = ay0 + agentHeight;

    const gx0 = level.goal.x;
    const gy0 = level.goal.y;
    const gx1 = gx0 + level.goal.width;
    const gy1 = gy0 + level.goal.height;

    const hit = ax0 <= gx1 && ax1 >= gx0 && ay0 <= gy1 && ay1 >= gy0;
    if (!hit) {
      return false;
    }
    agent.reachedGoal = true;
    saved += 1;
    return true;
  };

  const canOccupyCell = (x, y) => terrain.inBounds(x, y) && !terrain.isSolid(x, y);

  const canOccupyFootprint = (baseX, baseY) => {
    for (let dy = 0; dy < agentHeight; dy += 1) {
      for (let dx = 0; dx < agentWidth; dx += 1) {
        if (!canOccupyCell(baseX + dx, baseY + dy)) {
          return false;
        }
      }
    }
    return true;
  };

  const hasSupportAt = (baseX, baseY) => {
    const belowY = baseY - 1;
    if (belowY < 0) {
      return false;
    }
    for (let dx = 0; dx < agentWidth; dx += 1) {
      if (terrain.isSolid(baseX + dx, belowY)) {
        return true;
      }
    }
    return false;
  };

  const canFall = (pos) => {
    return !hasSupportAt(pos.x, pos.y);
  };

  const tryGravityStep = (agent) => {
    if (!canFall(agent.pos)) {
      return false;
    }

    agent.pos = { x: agent.pos.x, y: agent.pos.y - 1 };
    agent.fallCells += 1;

    if (agent.pos.y <= rules.outOfBoundsKillY) {
      agent.dead = true;
      dead += 1;
    }
    return true;
  };

  const resolveLanding = (agent) => {
    if (agent.fallCells <= 0) {
      return false;
    }

    const fallTooFar = rules.maxSafeFallCells >= 0 && agent.fallCells > rules.maxSafeFallCells;
    agent.fallCells = 0;
    if (!fallTooFar) {
      return false;
    }

    agent.dead = true;
    dead += 1;
    return true;
  };

  const tryHorizontalStep = (agent) => {
    const nextX = agent.pos.x + agent.direction;
    const blocked = !canOccupyFootprint(nextX, agent.pos.y);
    if (!blocked) {
      agent.pos = { x: nextX, y: agent.pos.y };
      return true;
    }

    const maxUp = Math.max(0, Math.floor(rules.maxStepUpCells));
    for (let step = 1; step <= maxUp; step += 1) {
      const targetY = agent.pos.y + step;
      if (!canOccupyFootprint(nextX, targetY)) {
        continue;
      }
      if (!hasSupportAt(nextX, targetY)) {
        continue;
      }
      agent.pos = { x: nextX, y: targetY };
      return true;
    }

    const maxDown = Math.max(0, Math.floor(rules.maxStepDownCells));
    for (let step = 1; step <= maxDown; step += 1) {
      const targetY = agent.pos.y - step;
      if (!canOccupyFootprint(nextX, targetY)) {
        continue;
      }
      if (!hasSupportAt(nextX, targetY)) {
        continue;
      }
      agent.pos = { x: nextX, y: targetY };
      return true;
    }

    if (blocked) {
      if (rules.reverseWhenBlocked) {
        agent.direction = agent.direction * -1;
      }
      return false;
    }
    return false;
  };

  const updateSpawn = () => {
    if (spawned >= level.spawn.count) {
      return;
    }
    spawnTimer -= dt;
    while (spawned < level.spawn.count && spawnTimer <= 0) {
      const p = level.spawn.position;
      const blocked = !canOccupyFootprint(p.x, p.y) || hasAgentInRect(p.x, p.y, agentWidth, agentHeight);
      if (blocked) {
        spawnTimer = rules.spawnRetryDelaySec;
        break;
      }

      agents.push({
        id: nextId,
        pos: { x: p.x, y: p.y },
        direction: level.spawn.direction,
        ageSec: 0,
        fallCells: 0,
        reachedGoal: false,
        dead: false,
      });

      nextId += 1;
      spawned += 1;
      spawnTimer += level.spawn.intervalSec;
    }
  };

  const isFinished = () => {
    const noMoreSpawn = spawned >= level.spawn.count;
    const noAlive = agents.every((a) => a.dead || a.reachedGoal);
    return noMoreSpawn && noAlive;
  };

  const actionsByTick = new Map();
  for (const action of caseData.actions ?? []) {
    if (typeof action?.tick !== 'number' || Number.isNaN(action.tick) || action.tick < 0) {
      throw new Error(`非法 action.tick: ${JSON.stringify(action)}`);
    }
    const list = actionsByTick.get(action.tick) ?? [];
    list.push(action);
    actionsByTick.set(action.tick, list);
  }

  const applyAction = (action) => {
    const x = Number(action.x);
    const y = Number(action.y);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(`非法 action 坐标: ${JSON.stringify(action)}`);
    }
    if (action.type === 'dig') {
      const ok = terrain.dig(x, y);
      if (ok) {
        changedActions += 1;
      }
      return ok;
    }
    if (action.type === 'fill') {
      if (hasAgentAtCell(x, y)) {
        return false;
      }
      const ok = terrain.fill(x, y);
      if (ok) {
        changedActions += 1;
      }
      return ok;
    }
    throw new Error(`未知 action.type: ${String(action.type)}`);
  };

  for (; ticks < maxTicks; ticks += 1) {
    const actions = actionsByTick.get(ticks);
    if (actions) {
      for (const action of actions) {
        applyAction(action);
      }
    }

    updateSpawn();

    for (const agent of agents) {
      if (agent.dead || agent.reachedGoal) {
        continue;
      }

      agent.ageSec += dt;
      if (rules.checkGoalBeforeMove && tryReachGoal(agent)) {
        continue;
      }

      if (rules.movementPriority === 'gravity-then-horizontal') {
        const fell = tryGravityStep(agent);
        if (fell) {
          if (rules.checkGoalAfterMove) {
            tryReachGoal(agent);
          }
          continue;
        }

        if (resolveLanding(agent)) {
          continue;
        }
        tryHorizontalStep(agent);
      } else {
        tryHorizontalStep(agent);
        if (rules.checkGoalAfterMove && tryReachGoal(agent)) {
          continue;
        }

        const fell = tryGravityStep(agent);
        if (!fell) {
          if (resolveLanding(agent)) {
            continue;
          }
        }
      }

      if (rules.checkGoalAfterMove) {
        tryReachGoal(agent);
      }
    }

    if (isFinished()) {
      break;
    }
  }

  const alive = agents.filter((a) => !a.dead && !a.reachedGoal).length;
  const finished = isFinished();
  const success = saved >= level.requiredSaved;

  return {
    ticks,
    timeSec: ticks * dt,
    spawned,
    saved,
    dead,
    alive,
    changedActions,
    finished,
    success,
  };
}

function matchExpected(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) {
      return `字段 ${key} 不匹配，期望=${value} 实际=${actual[key]}`;
    }
  }
  return null;
}

function main() {
  const cases = loadCases();
  if (cases.length === 0) {
    console.error('未找到基准用例，请检查 tools/baselines/*.json');
    process.exit(1);
  }

  let failed = 0;
  console.log(`开始基准回放，共 ${cases.length} 个用例`);

  for (const caseData of cases) {
    const result = simulate(caseData);
    const err = matchExpected(result, caseData.expected ?? {});
    if (err) {
      failed += 1;
      console.log(`✗ ${caseData.id} - ${caseData.description}`);
      console.log(`  ${err}`);
      console.log(`  结果: ${JSON.stringify(result)}`);
    } else {
      console.log(`✓ ${caseData.id} - ${caseData.description}`);
    }
  }

  if (failed > 0) {
    console.log(`基准回放失败：${failed}/${cases.length}`);
    process.exit(1);
  }

  console.log('基准回放全部通过');
}

main();
