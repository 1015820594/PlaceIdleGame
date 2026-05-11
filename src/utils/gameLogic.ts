import { BaseStats, ComputedStats, Entity, Skill } from '../types/game';

const STAT_GROWTH = {
  str: { physicalAttack: 1 },
  int: { magicalAttack: 1 },
  vit: { maxHp: 10, physicalDefense: 0.5 },
  def: { maxMp: 5, magicalDefense: 0.5 },
  agi: { hitRate: 2, dodgeRate: 1, critRate: 0.2, critDefense: 0.1 },
};

export function calculateComputedStats(baseStats: BaseStats, bonusStats: BaseStats = { str: 0, int: 0, vit: 0, def: 0, agi: 0 }): ComputedStats {
  const totalStats: BaseStats = {
    str: baseStats.str + bonusStats.str,
    int: baseStats.int + bonusStats.int,
    vit: baseStats.vit + bonusStats.vit,
    def: baseStats.def + bonusStats.def,
    agi: baseStats.agi + bonusStats.agi,
  };

  return {
    maxHp: Math.floor(totalStats.vit * STAT_GROWTH.vit.maxHp),
    maxMp: Math.floor(totalStats.def * STAT_GROWTH.def.maxMp),
    physicalAttack: Math.floor(totalStats.str * STAT_GROWTH.str.physicalAttack),
    magicalAttack: Math.floor(totalStats.int * STAT_GROWTH.int.magicalAttack),
    physicalDefense: Math.floor(totalStats.vit * STAT_GROWTH.vit.physicalDefense),
    magicalDefense: Math.floor(totalStats.def * STAT_GROWTH.def.magicalDefense),
    hitRate: Math.floor(totalStats.agi * STAT_GROWTH.agi.hitRate),
    dodgeRate: Math.floor(totalStats.agi * STAT_GROWTH.agi.dodgeRate),
    critRate: Math.floor(totalStats.agi * STAT_GROWTH.agi.critRate),
    critDefense: Math.floor(totalStats.agi * STAT_GROWTH.agi.critDefense),
    iceAttack: 0,
    fireAttack: 0,
    thunderAttack: 0,
    poisonAttack: 0,
  };
}

export function calculateExpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function calculateMonsterStats(floor: number): BaseStats {
  const baseValue = 10;
  const growthRate = 1 + floor * 0.02;
  const difficultyMultiplier = 1 + Math.floor(floor / 5) * 0.1;

  const isElite = floor % 50 === 0;
  const isBoss = floor % 100 === 0;

  let multiplier = growthRate * difficultyMultiplier;
  if (isElite) multiplier *= 1.5;
  if (isBoss) multiplier *= 2;

  const distribution = Math.random();
  let stats: BaseStats;

  if (distribution < 0.4) {
    stats = {
      str: Math.floor(baseValue * multiplier * (1.2 + Math.random() * 0.3)),
      int: Math.floor(baseValue * multiplier * 0.5),
      vit: Math.floor(baseValue * multiplier * (0.8 + Math.random() * 0.2)),
      def: Math.floor(baseValue * multiplier * 0.5),
      agi: Math.floor(baseValue * multiplier * (0.6 + Math.random() * 0.2)),
    };
  } else if (distribution < 0.7) {
    stats = {
      str: Math.floor(baseValue * multiplier * 0.5),
      int: Math.floor(baseValue * multiplier * (1.2 + Math.random() * 0.3)),
      vit: Math.floor(baseValue * multiplier * (0.8 + Math.random() * 0.2)),
      def: Math.floor(baseValue * multiplier * (1.2 + Math.random() * 0.3)),
      agi: Math.floor(baseValue * multiplier * 0.5),
    };
  } else {
    stats = {
      str: Math.floor(baseValue * multiplier * 0.8),
      int: Math.floor(baseValue * multiplier * 0.8),
      vit: Math.floor(baseValue * multiplier * (1.5 + Math.random() * 0.5)),
      def: Math.floor(baseValue * multiplier * 1.5),
      agi: Math.floor(baseValue * multiplier * 1.2),
    };
  }

  return stats;
}

export function calculateElementalResistance(floor: number): { ice: number; fire: number; thunder: number; poison: number } {
  const baseResistance = Math.floor(floor / 20) * 5;
  return {
    ice: baseResistance,
    fire: baseResistance,
    thunder: baseResistance,
    poison: baseResistance,
  };
}

export function calculateHitRate(attacker: Entity, defender: Entity): boolean {
  const hitRate = attacker.computedStats.hitRate / (attacker.computedStats.hitRate + defender.computedStats.dodgeRate);
  return Math.random() < hitRate;
}

export function calculateCritRate(attacker: Entity, defender: Entity): boolean {
  const critChance = (attacker.computedStats.critRate * 2 - defender.computedStats.critDefense) / 1000;
  return Math.random() < Math.max(0, Math.min(1, critChance));
}

export function calculateDamage(attacker: Entity, defender: Entity, isSkill: boolean = false, skillMultiplier: number = 1): { damage: number; isCrit: boolean; damageType: 'physical' | 'magical' | 'elemental' } {
  const physicalDamage = attacker.computedStats.physicalAttack / 20 - defender.computedStats.physicalDefense / 50;
  const magicalDamage = attacker.computedStats.magicalAttack / 15 - defender.computedStats.magicalDefense / 50;

  let baseDamage = Math.max(physicalDamage, magicalDamage);
  let damageType: 'physical' | 'magical' | 'elemental' = physicalDamage >= magicalDamage ? 'physical' : 'magical';

  if (isSkill) {
    baseDamage *= skillMultiplier;
  }

  const monsterMultiplier = defender.isPlayer ? 1 : 5;
  let finalDamage = Math.max(1, Math.floor(baseDamage * monsterMultiplier));

  const isCrit = calculateCritRate(attacker, defender);
  if (isCrit) {
    finalDamage *= 2;
  }

  return { damage: finalDamage, isCrit, damageType };
}

export function calculateFloorReward(floor: number): { gold: number; exp: number } {
  return {
    gold: Math.floor(100 * floor),
    exp: Math.floor(50 * floor),
  };
}

export function getMonsterName(floor: number): string {
  const names = [
    '山贼喽啰', '江湖散人', '门派弟子', '武林高手', '江湖大侠',
    '门派长老', '江湖名人', '隐世高手', '一代宗师', '武林盟主',
  ];

  const isElite = floor % 50 === 0;
  const isBoss = floor % 100 === 0;

  if (isBoss) {
    return `BOSS·${names[Math.min(Math.floor(floor / 100), names.length - 1)]}`;
  }
  if (isElite) {
    return `精英·${names[Math.floor((floor % 50) / 5)]}`;
  }
  return names[Math.floor((floor - 1) % names.length)];
}

export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'skill1',
    name: '雷霆一击',
    description: '造成300%伤害',
    damageMultiplier: 3,
    healAmount: 0,
    defenseBoost: 0,
    cooldown: 5,
    currentCooldown: 0,
    duration: 0,
    type: 'damage',
  },
  {
    id: 'skill2',
    name: '铁布衫',
    description: '3秒内减伤50%',
    damageMultiplier: 0,
    healAmount: 0,
    defenseBoost: 0.5,
    cooldown: 10,
    currentCooldown: 0,
    duration: 3,
    type: 'defense',
  },
  {
    id: 'skill3',
    name: '回春术',
    description: '恢复20%最大生命',
    damageMultiplier: 0,
    healAmount: 0.2,
    defenseBoost: 0,
    cooldown: 15,
    currentCooldown: 0,
    duration: 0,
    type: 'heal',
  },
];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
