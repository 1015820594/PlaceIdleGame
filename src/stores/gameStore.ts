import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GameState,
  PlayerData,
  TowerData,
  Entity,
  CombatLog,
  DamageNumber,
  BaseStats,
} from '../types/game';
import {
  calculateComputedStats,
  calculateExpToNextLevel,
  calculateMonsterStats,
  calculateFloorReward,
  getMonsterName,
  calculateDamage,
  calculateHitRate,
  generateId,
  DEFAULT_SKILLS,
} from '../utils/gameLogic';

interface GameStore extends GameState {
  initializeGame: () => void;
  loadGame: () => void;
  saveGame: () => void;
  addAttributePoint: (stat: keyof BaseStats) => void;
  addExp: (exp: number) => void;
  addGold: (gold: number) => void;
  spawnMonsters: () => void;
  playerAttack: () => void;
  monsterAttack: (monster: Entity) => void;
  processDamage: (target: Entity, damage: number, attacker: Entity) => void;
  addDamageNumber: (damage: DamageNumber) => void;
  addCombatLog: (message: string, type: 'player' | 'monster' | 'system') => void;
  clearDeadMonsters: () => void;
  advanceFloor: () => void;
  manualAdvanceFloor: () => void;
  respawnMonsters: () => void;
  setAutoAdvanceFloor: (value: boolean) => void;
  respawnPlayer: () => void;
  updateSkillCooldowns: () => void;
  useSkill: (skillId: string) => void;
  nextTurn: () => void;
  togglePause: () => void;
}

const createInitialPlayer = (): PlayerData => {
  const baseStats: BaseStats = { str: 100, int: 100, vit: 100, def: 100, agi: 50 };
  const computedStats = calculateComputedStats(baseStats);
  
  return {
    name: '江湖侠士',
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    gold: 0,
    hp: computedStats.maxHp,
    maxHp: computedStats.maxHp,
    mp: computedStats.maxMp,
    maxMp: computedStats.maxMp,
    attributePoints: 0,
    baseStats,
    bonusStats: { str: 0, int: 0, vit: 0, def: 0, agi: 0 },
    skills: DEFAULT_SKILLS.map(s => ({ ...s, currentCooldown: 0 })),
  };
};

const createInitialTower = (): TowerData => ({
  currentFloor: 1,
  maxFloor: 1,
  lastSaveTime: Date.now(),
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      player: createInitialPlayer(),
      tower: createInitialTower(),
      monsters: [],
      combatLogs: [],
      damageNumbers: [],
      isPaused: false,
      isGameOver: false,
      autoAdvanceFloor: true,

      initializeGame: () => {
        const player = createInitialPlayer();
        set({ player, combatLogs: [] });
        get().spawnMonsters();
        get().addCombatLog('欢迎来到江湖！开始你的爬塔之旅吧！', 'system');
      },

      loadGame: () => {
        const state = get();
        if (state.player.hp && state.player.maxHp) return;
        const player = state.player;
        const computedStats = calculateComputedStats(player.baseStats, player.bonusStats);
        set({
          player: {
            ...player,
            hp: computedStats.maxHp,
            maxHp: computedStats.maxHp,
            mp: computedStats.maxMp,
            maxMp: computedStats.maxMp,
          },
        });
      },

      saveGame: () => {
        set({
          tower: {
            ...get().tower,
            lastSaveTime: Date.now(),
          },
        });
      },

      addAttributePoint: (stat: keyof BaseStats) => {
        const { player } = get();
        if (player.attributePoints <= 0) return;

        const newBaseStats = {
          ...player.baseStats,
          [stat]: player.baseStats[stat] + 1,
        };
        const computedStats = calculateComputedStats(newBaseStats, player.bonusStats);

        set({
          player: {
            ...player,
            attributePoints: player.attributePoints - 1,
            baseStats: newBaseStats,
            maxHp: computedStats.maxHp,
            maxMp: computedStats.maxMp,
            hp: Math.min(player.hp, computedStats.maxHp),
            mp: Math.min(player.mp, computedStats.maxMp),
          },
        });
      },

      addExp: (exp: number) => {
        const { player } = get();
        let newExp = player.exp + exp;
        let newLevel = player.level;
        let newAttributePoints = player.attributePoints;
        let newExpToNextLevel = player.expToNextLevel;

        while (newExp >= newExpToNextLevel) {
          newExp -= newExpToNextLevel;
          newLevel++;
          newAttributePoints += 5;
          newExpToNextLevel = calculateExpToNextLevel(newLevel);
          get().addCombatLog(`恭喜升级！等级提升至 ${newLevel}！获得5点属性点！`, 'system');
        }

        set({
          player: {
            ...player,
            exp: newExp,
            level: newLevel,
            attributePoints: newAttributePoints,
            expToNextLevel: newExpToNextLevel,
          },
        });
      },

      addGold: (gold: number) => {
        set({
          player: {
            ...get().player,
            gold: get().player.gold + gold,
          },
        });
      },

      spawnMonsters: () => {
        const { tower } = get();
        const monsters: Entity[] = [];
        const isBoss = tower.currentFloor % 100 === 0;

        const monsterCount = isBoss ? 1 : 5;

        for (let i = 0; i < monsterCount; i++) {
          const baseStats = calculateMonsterStats(tower.currentFloor);
          const computedStats = calculateComputedStats(baseStats);

          monsters.push({
            id: generateId(),
            name: isBoss ? getMonsterName(tower.currentFloor) : `${getMonsterName(tower.currentFloor)}_${i + 1}`,
            level: tower.currentFloor,
            hp: computedStats.maxHp,
            maxHp: computedStats.maxHp,
            mp: computedStats.maxMp,
            maxMp: computedStats.maxMp,
            baseStats,
            computedStats,
            skills: [],
            isPlayer: false,
            isDead: false,
          });
        }

        set({ monsters });
      },

      playerAttack: () => {
        const { player, monsters } = get();
        const aliveMonsters = monsters.filter(m => !m.isDead);
        if (aliveMonsters.length === 0) return;

        const target = aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
        const playerComputedStats = calculateComputedStats(player.baseStats, player.bonusStats);

        if (!calculateHitRate(
          { id: 'player', name: player.name, level: player.level, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, baseStats: player.baseStats, computedStats: playerComputedStats, skills: player.skills, isPlayer: true, isDead: false },
          target
        )) {
          get().addCombatLog(`${player.name} 的攻击被闪避了！`, 'player');
          return;
        }

        const { damage, isCrit } = calculateDamage(
          { id: 'player', name: player.name, level: player.level, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, baseStats: player.baseStats, computedStats: playerComputedStats, skills: player.skills, isPlayer: true, isDead: false },
          target
        );

        get().processDamage(target, damage, { id: 'player', name: player.name, level: player.level, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, baseStats: player.baseStats, computedStats: playerComputedStats, skills: player.skills, isPlayer: true, isDead: false });
        get().addCombatLog(`${player.name} 对 ${target.name} 造成了 ${damage} 点伤害${isCrit ? '（暴击！）' : ''}`, 'player');
      },

      monsterAttack: (monster: Entity) => {
        const { player } = get();
        if (player.hp <= 0) return;

        const playerComputedStats = calculateComputedStats(player.baseStats, player.bonusStats);
        const playerEntity = { id: 'player', name: player.name, level: player.level, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, baseStats: player.baseStats, computedStats: playerComputedStats, skills: player.skills, isPlayer: true, isDead: false };

        if (!calculateHitRate(monster, playerEntity)) {
          get().addCombatLog(`${monster.name} 的攻击被闪避了！`, 'monster');
          return;
        }

        const { damage, isCrit } = calculateDamage(monster, playerEntity);

        const newHp = Math.max(0, player.hp - damage);
        set({
          player: {
            ...player,
            hp: newHp,
          },
        });

        get().addDamageNumber({
          id: generateId(),
          value: damage,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          type: 'physical',
          isCrit,
        });

        get().addCombatLog(`${monster.name} 对 ${player.name} 造成了 ${damage} 点伤害${isCrit ? '（暴击！）' : ''}`, 'monster');

        if (newHp <= 0) {
          set({ isGameOver: true });
          get().addCombatLog(`${player.name} 倒下了！重新生成怪物...`, 'system');
          setTimeout(() => {
            get().respawnMonsters();
          }, 500);
        }
      },

      processDamage: (target: Entity, damage: number, attacker: Entity) => {
        const { monsters } = get();
        const updatedMonsters = monsters.map(m => {
          if (m.id === target.id) {
            return {
              ...m,
              hp: Math.max(0, m.hp - damage),
              isDead: m.hp - damage <= 0,
            };
          }
          return m;
        });

        set({ monsters: updatedMonsters });

        get().addDamageNumber({
          id: generateId(),
          value: damage,
          x: 100 + Math.random() * 200,
          y: 150 + Math.random() * 100,
          type: attacker.computedStats.physicalAttack > attacker.computedStats.magicalAttack ? 'physical' : 'magical',
          isCrit: false,
        });
      },

      addDamageNumber: (damage: DamageNumber) => {
        set({ damageNumbers: [...get().damageNumbers, damage] });
        setTimeout(() => {
          set({ damageNumbers: get().damageNumbers.filter(d => d.id !== damage.id) });
        }, 1500);
      },

      addCombatLog: (message: string, type: 'player' | 'monster' | 'system') => {
        const log: CombatLog = {
          id: generateId(),
          message,
          type,
          timestamp: Date.now(),
        };
        const logs = [...get().combatLogs, log].slice(-20);
        set({ combatLogs: logs });
      },

      clearDeadMonsters: () => {
        const { monsters, tower, autoAdvanceFloor } = get();
        const aliveMonsters = monsters.filter(m => !m.isDead);

        if (aliveMonsters.length === 0) {
          const reward = calculateFloorReward(tower.currentFloor);
          get().addGold(reward.gold);
          get().addExp(reward.exp);
          get().addCombatLog(`通关第 ${tower.currentFloor} 层！获得 ${reward.gold} 金币，${reward.exp} 经验！`, 'system');
          
          if (autoAdvanceFloor) {
            get().advanceFloor();
          } else {
            get().respawnMonsters();
          }
        }
      },

      advanceFloor: () => {
        const { tower } = get();
        const newFloor = tower.currentFloor + 1;
        set({
          tower: {
            ...tower,
            currentFloor: newFloor,
            maxFloor: Math.max(tower.maxFloor, newFloor),
          },
        });
        get().spawnMonsters();
      },

      manualAdvanceFloor: () => {
        const { tower, autoAdvanceFloor } = get();
        if (autoAdvanceFloor) return;
        
        const newFloor = tower.currentFloor + 1;
        set({
          tower: {
            ...tower,
            currentFloor: newFloor,
            maxFloor: Math.max(tower.maxFloor, newFloor),
          },
        });
        get().spawnMonsters();
        get().addCombatLog(`手动升层至第 ${newFloor} 层！`, 'system');
      },

      respawnMonsters: () => {
        set({ isGameOver: false });
        get().spawnMonsters();
        get().addCombatLog(`重新生成第 ${get().tower.currentFloor} 层怪物！`, 'system');
      },

      setAutoAdvanceFloor: (value: boolean) => {
        set({ autoAdvanceFloor: value });
        get().addCombatLog(`自动升层：${value ? '开启' : '关闭'}`, 'system');
      },

      respawnPlayer: () => {
        const { player, tower } = get();
        const computedStats = calculateComputedStats(player.baseStats, player.bonusStats);
        set({
          player: {
            ...player,
            hp: computedStats.maxHp,
            maxHp: computedStats.maxHp,
            mp: computedStats.maxMp,
            maxMp: computedStats.maxMp,
          },
          isGameOver: false,
        });
        get().respawnMonsters();
        get().addCombatLog(`恢复满血，重新挑战第 ${tower.currentFloor} 层！`, 'system');
      },

      updateSkillCooldowns: () => {
        const { player } = get();
        const updatedSkills = player.skills.map(skill => ({
          ...skill,
          currentCooldown: Math.max(0, skill.currentCooldown - 1),
        }));
        set({ player: { ...player, skills: updatedSkills } });
      },

      useSkill: (skillId: string) => {
        const { player, monsters } = get();
        const skill = player.skills.find(s => s.id === skillId);

        if (!skill || skill.currentCooldown > 0) return;

        const aliveMonsters = monsters.filter(m => !m.isDead);
        if (aliveMonsters.length === 0) return;

        const target = aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
        const computedStats = calculateComputedStats(player.baseStats, player.bonusStats);
        const playerEntity = { id: 'player', name: player.name, level: player.level, hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp, baseStats: player.baseStats, computedStats, skills: player.skills, isPlayer: true, isDead: false };

        if (skill.type === 'damage') {
          const { damage } = calculateDamage(
            playerEntity,
            target,
            true,
            skill.damageMultiplier
          );
          get().processDamage(target, damage, playerEntity);
          get().addCombatLog(`${player.name} 使用了 ${skill.name}！对 ${target.name} 造成了 ${damage} 点伤害！`, 'player');
        } else if (skill.type === 'heal') {
          const healAmount = Math.floor(computedStats.maxHp * skill.healAmount);
          const newHp = Math.min(computedStats.maxHp, player.hp + healAmount);
          set({
            player: {
              ...player,
              hp: newHp,
            },
          });
          get().addCombatLog(`${player.name} 使用了 ${skill.name}！恢复了 ${healAmount} 点生命！`, 'player');
        }

        const updatedSkills = player.skills.map(s => {
          if (s.id === skillId) {
            return { ...s, currentCooldown: s.cooldown };
          }
          return s;
        });

        set({ player: { ...player, skills: updatedSkills } });
      },

      nextTurn: () => {
        const { isPaused, isGameOver, monsters } = get();
        if (isPaused || isGameOver) return;

        const allDead = monsters.length > 0 && monsters.every(m => m.isDead);
        if (allDead) {
          get().clearDeadMonsters();
          return;
        }

        get().playerAttack();
        get().clearDeadMonsters();

        const updatedMonsters = get().monsters.filter(m => !m.isDead);
        for (const monster of updatedMonsters) {
          get().monsterAttack(monster);
          if (get().isGameOver) break;
        }

        get().updateSkillCooldowns();
      },

      togglePause: () => {
        set({ isPaused: !get().isPaused });
      },
    }),
    {
      name: 'tianlong-game-storage',
      partialize: (state) => ({
        player: state.player,
        tower: state.tower,
        autoAdvanceFloor: state.autoAdvanceFloor,
      }),
    }
  )
);
