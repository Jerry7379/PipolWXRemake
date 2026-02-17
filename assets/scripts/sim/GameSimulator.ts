import { AgentState, Int2, LevelConfig, SimStats, SimulationRules } from '../core/GameTypes';
import { TerrainGrid } from '../core/TerrainGrid';

export class GameSimulator {
  private readonly _level: LevelConfig;
  private readonly _terrain: TerrainGrid;
  private readonly _rules: SimulationRules;
  private readonly _agents: AgentState[] = [];

  private _spawnTimer = 0;
  private _spawned = 0;
  private _saved = 0;
  private _dead = 0;
  private _nextId = 1;

  constructor(level: LevelConfig, terrain: TerrainGrid) {
    this._level = level;
    this._terrain = terrain;
    this._rules = level.simulationRules;
    this._spawnTimer = 0;
  }

  getAgents(): readonly AgentState[] {
    return this._agents;
  }

  getStats(): SimStats {
    return {
      spawned: this._spawned,
      alive: this._agents.filter((a) => !a.dead && !a.reachedGoal).length,
      saved: this._saved,
      dead: this._dead,
    };
  }

  isFinished(): boolean {
    const noMoreSpawn = this._spawned >= this._level.spawn.count;
    const noAlive = this._agents.every((a) => a.dead || a.reachedGoal);
    return noMoreSpawn && noAlive;
  }

  isSuccess(): boolean {
    return this._saved >= this._level.requiredSaved;
  }

  hasAgentAtCell(x: number, y: number): boolean {
    return this._agents.some((a) => !a.dead && !a.reachedGoal && this.isCellInsideAgent(a, x, y));
  }

  tick(dt: number): void {
    this.updateSpawn(dt);

    for (const agent of this._agents) {
      if (agent.dead || agent.reachedGoal) {
        continue;
      }
      agent.ageSec += dt;

      if (this._rules.checkGoalBeforeMove && this.tryReachGoal(agent)) {
        continue;
      }

      if (this._rules.movementPriority === 'gravity-then-horizontal') {
        const fell = this.tryGravityStep(agent);
        if (fell) {
          if (this._rules.checkGoalAfterMove) {
            this.tryReachGoal(agent);
          }
          continue;
        }

        if (this.resolveLanding(agent)) {
          continue;
        }
        this.tryHorizontalStep(agent);
      } else {
        this.tryHorizontalStep(agent);
        if (this._rules.checkGoalAfterMove && this.tryReachGoal(agent)) {
          continue;
        }

        const fell = this.tryGravityStep(agent);
        if (!fell) {
          if (this.resolveLanding(agent)) {
            continue;
          }
        }
      }

      if (this._rules.checkGoalAfterMove) {
        this.tryReachGoal(agent);
      }
    }
  }

  private updateSpawn(dt: number): void {
    if (this._spawned >= this._level.spawn.count) {
      return;
    }

    this._spawnTimer -= dt;
    while (this._spawned < this._level.spawn.count && this._spawnTimer <= 0) {
      const spawnedNow = this.spawnOne();
      if (!spawnedNow) {
        break;
      }
      this._spawnTimer += this._level.spawn.intervalSec;
    }
  }

  private spawnOne(): boolean {
    const p: Int2 = this._level.spawn.position;
    const blocked = !this.canOccupyFootprintAt(p.x, p.y) || this.hasAgentInRect(p.x, p.y, this.agentWidth, this.agentHeight);
    if (blocked) {
      // 出生点堵塞时延后重试，避免丢人。
      this._spawnTimer = this._rules.spawnRetryDelaySec;
      return false;
    }

    this._agents.push({
      id: this._nextId,
      pos: { x: p.x, y: p.y },
      direction: this._level.spawn.direction,
      ageSec: 0,
      fallCells: 0,
      reachedGoal: false,
      dead: false,
    });

    this._nextId += 1;
    this._spawned += 1;
    return true;
  }

  private canFall(pos: Int2): boolean {
    return !this.hasSupportAt(pos.x, pos.y);
  }

  private tryHorizontalStep(agent: AgentState): boolean {
    const nextX = agent.pos.x + agent.direction;
    const blocked = !this.canOccupyFootprintAt(nextX, agent.pos.y);
    if (!blocked) {
      agent.pos = { x: nextX, y: agent.pos.y };
      return true;
    }

    const maxUp = Math.max(0, Math.floor(this._rules.maxStepUpCells));
    for (let step = 1; step <= maxUp; step += 1) {
      const targetY = agent.pos.y + step;
      if (!this.canOccupyFootprintAt(nextX, targetY)) {
        continue;
      }
      if (!this.hasSupportAt(nextX, targetY)) {
        continue;
      }

      agent.pos = { x: nextX, y: targetY };
      return true;
    }

    const maxDown = Math.max(0, Math.floor(this._rules.maxStepDownCells));
    for (let step = 1; step <= maxDown; step += 1) {
      const targetY = agent.pos.y - step;
      if (!this.canOccupyFootprintAt(nextX, targetY)) {
        continue;
      }
      if (!this.hasSupportAt(nextX, targetY)) {
        continue;
      }

      agent.pos = { x: nextX, y: targetY };
      return true;
    }

    if (this._rules.reverseWhenBlocked) {
      agent.direction = (agent.direction * -1) as -1 | 1;
    }
    return false;
  }

  private tryGravityStep(agent: AgentState): boolean {
    if (!this.canFall(agent.pos)) {
      return false;
    }

    agent.pos = { x: agent.pos.x, y: agent.pos.y - 1 };
    agent.fallCells += 1;

    if (agent.pos.y <= this._rules.outOfBoundsKillY) {
      agent.dead = true;
      this._dead += 1;
    }

    return true;
  }

  private resolveLanding(agent: AgentState): boolean {
    if (agent.fallCells <= 0) {
      return false;
    }

    const fallTooFar = this._rules.maxSafeFallCells >= 0 && agent.fallCells > this._rules.maxSafeFallCells;
    agent.fallCells = 0;
    if (!fallTooFar) {
      return false;
    }

    agent.dead = true;
    this._dead += 1;
    return true;
  }

  private tryReachGoal(agent: AgentState): boolean {
    if (agent.dead || agent.reachedGoal) {
      return false;
    }

    if (!this.intersectsGoal(agent)) {
      return false;
    }

    agent.reachedGoal = true;
    this._saved += 1;
    return true;
  }

  private get agentWidth(): number {
    return Math.max(1, Math.floor(this._rules.agentCollisionWidthCells));
  }

  private get agentHeight(): number {
    return Math.max(1, Math.floor(this._rules.agentCollisionHeightCells));
  }

  private canOccupyCell(x: number, y: number): boolean {
    return this._terrain.inBounds(x, y) && !this._terrain.isSolid(x, y);
  }

  private canOccupyFootprintAt(baseX: number, baseY: number): boolean {
    for (let dy = 0; dy < this.agentHeight; dy += 1) {
      for (let dx = 0; dx < this.agentWidth; dx += 1) {
        if (!this.canOccupyCell(baseX + dx, baseY + dy)) {
          return false;
        }
      }
    }
    return true;
  }

  private hasSupportAt(baseX: number, baseY: number): boolean {
    const belowY = baseY - 1;
    if (belowY < 0) {
      return false;
    }

    for (let dx = 0; dx < this.agentWidth; dx += 1) {
      if (this._terrain.isSolid(baseX + dx, belowY)) {
        return true;
      }
    }
    return false;
  }

  private isCellInsideAgent(agent: AgentState, x: number, y: number): boolean {
    return (
      x >= agent.pos.x &&
      x < agent.pos.x + this.agentWidth &&
      y >= agent.pos.y &&
      y < agent.pos.y + this.agentHeight
    );
  }

  private hasAgentInRect(x: number, y: number, width: number, height: number): boolean {
    return this._agents.some((a) => {
      if (a.dead || a.reachedGoal) {
        return false;
      }
      const ax0 = a.pos.x;
      const ay0 = a.pos.y;
      const ax1 = ax0 + this.agentWidth;
      const ay1 = ay0 + this.agentHeight;
      const bx0 = x;
      const by0 = y;
      const bx1 = x + width;
      const by1 = y + height;
      return ax0 < bx1 && ax1 > bx0 && ay0 < by1 && ay1 > by0;
    });
  }

  private intersectsGoal(agent: AgentState): boolean {
    const ax0 = agent.pos.x;
    const ay0 = agent.pos.y;
    const ax1 = ax0 + this.agentWidth;
    const ay1 = ay0 + this.agentHeight;

    const gx0 = this._level.goal.x;
    const gy0 = this._level.goal.y;
    const gx1 = gx0 + this._level.goal.width;
    const gy1 = gy0 + this._level.goal.height;

    // 只要与终点区域发生接触（含贴边）即可判定成功。
    return ax0 <= gx1 && ax1 >= gx0 && ay0 <= gy1 && ay1 >= gy0;
  }
}
