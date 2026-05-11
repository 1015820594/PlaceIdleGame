export interface BaseStats {
  str: number;
  int: number;
  vit: number;
  def: number;
  agi: number;
}

export interface ComputedStats {
  maxHp: number;
  maxMp: number;
  physicalAttack: number;
  magicalAttack: number;
  physicalDefense: number;
  magicalDefense: number;
  hitRate: number;
  dodgeRate: number;
  critRate: number;
  critDefense: number;
  iceAttack: number;
  fireAttack: number;
  thunderAttack: number;
  poisonAttack: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  damageMultiplier: number;
  healAmount: number;
  defenseBoost: number;
  cooldown: number;
  currentCooldown: number;
  duration: number;
  type: 'damage' | 'heal' | 'defense';
}

export interface Entity {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseStats: BaseStats;
  computedStats: ComputedStats;
  skills: Skill[];
  isPlayer: boolean;
  isDead: boolean;
}

export interface PlayerData {
  name: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attributePoints: number;
  baseStats: BaseStats;
  bonusStats: BaseStats;
  skills: Skill[];
}

export interface DamageNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  type: 'physical' | 'magical' | 'crit' | 'heal';
  element?: 'ice' | 'fire' | 'thunder' | 'poison';
  isCrit: boolean;
}

export interface CombatLog {
  id: string;
  message: string;
  type: 'player' | 'monster' | 'system';
  timestamp: number;
}

export interface TowerData {
  currentFloor: number;
  maxFloor: number;
  lastSaveTime: number;
}

export interface GameState {
  player: PlayerData;
  tower: TowerData;
  monsters: Entity[];
  combatLogs: CombatLog[];
  damageNumbers: DamageNumber[];
  isPaused: boolean;
  isGameOver: boolean;
  autoAdvanceFloor: boolean;
  gameSpeed: number;
  showSettings: boolean;
}

export interface SaveData {
  player: PlayerData;
  tower: TowerData;
  savedAt: number;
}
