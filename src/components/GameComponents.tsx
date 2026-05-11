import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { calculateComputedStats } from '../utils/gameLogic';
import { Play, Pause, RotateCcw, Zap, Shield, Heart, Sword, X, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { BaseStats, ComputedStats, Entity } from '../types/game';

export const GameHeader: React.FC = () => {
  const { tower, player, isPaused, togglePause, isGameOver, respawnPlayer, autoAdvanceFloor, setAutoAdvanceFloor, manualAdvanceFloor } = useGameStore();

  return (
    <div className="bg-gradient-to-b from-purple-900/50 to-transparent p-3 border-b border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            第 {tower.currentFloor} 层
          </div>
          <div className="text-xs text-gray-400">
            历史: {tower.maxFloor}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoAdvanceFloor(!autoAdvanceFloor)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              autoAdvanceFloor ? 'bg-green-600/50 text-green-400' : 'bg-gray-700/50 text-gray-400'
            }`}
          >
            {autoAdvanceFloor ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            自动
          </button>
          <button
            onClick={manualAdvanceFloor}
            disabled={autoAdvanceFloor}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-600/50 hover:bg-blue-600 disabled:bg-gray-700/50 disabled:text-gray-500 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            升层
          </button>
          <button
            onClick={togglePause}
            className="p-2 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          {isGameOver && (
            <button
              onClick={respawnPlayer}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-sm"
            >
              <RotateCcw className="w-3 h-3" />
              重生
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs mt-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">金币:</span>
          <span className="text-yellow-400 font-bold">{player.gold.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">等级:</span>
          <span className="text-blue-400 font-bold">{player.level}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">属性点:</span>
          <span className="text-green-400 font-bold">{player.attributePoints}</span>
        </div>
      </div>
    </div>
  );
};

interface EntityDetailModalProps {
  entity: Entity | null;
  isPlayer: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAddPoint?: (stat: keyof BaseStats) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({ entity, isPlayer, isOpen, onClose, onAddPoint }) => {
  if (!isOpen || !entity) return null;

  const computedStats = calculateComputedStats(entity.baseStats, entity.isPlayer ? (entity as any).bonusStats : undefined);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl p-4 w-full max-w-md mx-4 border border-gray-600" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              isPlayer ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-red-600 to-red-800'
            }`}>
              {isPlayer ? '⚔️' : '👹'}
            </div>
            <div>
              <div className="text-lg font-bold text-white">{entity.name}</div>
              <div className="text-xs text-gray-400">Lv.{entity.level} {isPlayer ? '玩家' : '怪物'}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">HP</span>
            <span className="text-white">{entity.hp}/{entity.maxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
              style={{ width: `${(entity.hp / entity.maxHp) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2">基础属性</h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-red-500/20 rounded-lg p-2 text-center">
              <div className="text-red-400 text-xs">力量</div>
              <div className="text-white font-bold text-sm">{entity.baseStats.str}</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-2 text-center">
              <div className="text-blue-400 text-xs">灵气</div>
              <div className="text-white font-bold text-sm">{entity.baseStats.int}</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-2 text-center">
              <div className="text-green-400 text-xs">体力</div>
              <div className="text-white font-bold text-sm">{entity.baseStats.vit}</div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-2 text-center">
              <div className="text-purple-400 text-xs">定力</div>
              <div className="text-white font-bold text-sm">{entity.baseStats.def}</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-2 text-center">
              <div className="text-yellow-400 text-xs">身法</div>
              <div className="text-white font-bold text-sm">{entity.baseStats.agi}</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2">战斗属性</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">外功攻击</span>
              <span className="text-white font-bold">{computedStats.physicalAttack}</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">内功攻击</span>
              <span className="text-white font-bold">{computedStats.magicalAttack}</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">外功防御</span>
              <span className="text-white font-bold">{computedStats.physicalDefense}</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">内功防御</span>
              <span className="text-white font-bold">{computedStats.magicalDefense}</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">命中</span>
              <span className="text-white font-bold">{computedStats.hitRate}</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">闪避</span>
              <span className="text-white font-bold">{computedStats.dodgeRate}</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">会心率</span>
              <span className="text-white font-bold">{computedStats.critRate}%</span>
            </div>
            <div className="flex justify-between bg-gray-800/50 rounded px-2 py-1">
              <span className="text-gray-400">会心防御</span>
              <span className="text-white font-bold">{computedStats.critDefense}</span>
            </div>
          </div>
        </div>

        {isPlayer && onAddPoint && (
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">分配属性点 (可用: {useGameStore.getState().player.attributePoints})</h3>
            <div className="grid grid-cols-5 gap-2">
              {(['str', 'int', 'vit', 'def', 'agi'] as const).map(stat => (
                <button
                  key={stat}
                  onClick={() => onAddPoint(stat)}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded py-2 text-xs font-bold transition-colors"
                >
                  +1
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PlayerCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { player } = useGameStore();
  const computedStats = calculateComputedStats(player.baseStats, player.bonusStats);

  const hpPercent = (player.hp / computedStats.maxHp) * 100;
  const expPercent = (player.exp / player.expToNextLevel) * 100;

  useEffect(() => {
    if (!player.hp) {
      useGameStore.setState({
        player: {
          ...player,
          hp: computedStats.maxHp,
          maxHp: computedStats.maxHp,
          mp: computedStats.maxMp,
          maxMp: computedStats.maxMp,
        },
      });
    }
  }, []);

  return (
    <div 
      className="w-full max-w-xs mx-auto cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <div className="bg-gray-900/80 rounded-lg p-3 border border-blue-500/30 hover:border-blue-400/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
            ⚔️
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{player.name}</div>
            <div className="text-xs text-gray-400">Lv.{player.level}</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-400">HP</span>
            <span className="text-white">{player.hp}/{computedStats.maxHp}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                hpPercent > 25 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-400">EXP</span>
            <span className="text-white">{player.exp}/{player.expToNextLevel}</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MonsterCard: React.FC<{ monster: any; index: number; onClick: () => void }> = ({ monster, onClick }) => {
  const hpPercent = (monster.hp / monster.maxHp) * 100;
  const isBoss = monster.name.startsWith('BOSS');
  const isElite = monster.name.startsWith('精英');

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
        isBoss ? 'bg-red-900/40 border border-red-500/50' :
        isElite ? 'bg-orange-900/40 border border-orange-500/50' :
        'bg-gray-900/60 border border-gray-700/50'
      } ${monster.isDead ? 'opacity-30 grayscale' : ''}`}
      onClick={onClick}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
        isBoss ? 'bg-red-600' : isElite ? 'bg-orange-600' : 'bg-gray-600'
      }`}>
        {isBoss ? 'B' : isElite ? 'E' : 'M'}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold truncate ${
          isBoss ? 'text-red-400' : isElite ? 'text-orange-400' : 'text-gray-300'
        }`}>
          {monster.name}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              hpPercent > 50 ? 'bg-green-500' :
              hpPercent > 25 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-16 text-right">
          {monster.hp}/{monster.maxHp}
        </span>
      </div>
    </div>
  );
};

export const MonsterArea: React.FC<{ onMonsterClick: (monster: any) => void }> = ({ onMonsterClick }) => {
  const { monsters } = useGameStore();

  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4].map(index => (
        <MonsterCard
          key={monsters[index]?.id || index}
          monster={monsters[index] || { isDead: true, name: '空位', hp: 0, maxHp: 1, level: 0 }}
          index={index}
          onClick={() => monsters[index] && onMonsterClick(monsters[index])}
        />
      ))}
    </div>
  );
};

export const SkillBar: React.FC = () => {
  const { player, useSkill } = useGameStore();

  const getSkillIcon = (type: string) => {
    switch (type) {
      case 'damage': return <Sword className="w-4 h-4" />;
      case 'defense': return <Shield className="w-4 h-4" />;
      case 'heal': return <Heart className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getSkillColor = (type: string) => {
    switch (type) {
      case 'damage': return 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500';
      case 'defense': return 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500';
      case 'heal': return 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500';
      default: return 'from-purple-500 to-purple-600';
    }
  };

  return (
    <div className="bg-gray-900/50 p-3 border-t border-gray-700/50">
      <div className="flex gap-2">
        {player.skills.map(skill => (
          <button
            key={skill.id}
            onClick={() => useSkill(skill.id)}
            disabled={skill.currentCooldown > 0}
            className={`flex-1 relative bg-gradient-to-b ${getSkillColor(skill.type)} rounded-lg p-2 transition-all duration-200 ${
              skill.currentCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              {getSkillIcon(skill.type)}
              <span className="font-bold text-white text-xs">{skill.name}</span>
            </div>
            <div className="text-xs text-white/80">{skill.description}</div>

            {skill.currentCooldown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <span className="text-white font-bold text-sm">{skill.currentCooldown}s</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const CombatLog: React.FC = () => {
  const { combatLogs } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combatLogs]);

  return (
    <div className="bg-gray-900/80 px-3 py-2 border-t border-gray-700/50 w-full">
      <div className="text-xs text-gray-400 mb-1">战斗日志</div>
      <div
        ref={scrollRef}
        className="h-40 overflow-y-auto text-xs space-y-0.5 scrollbar-thin scrollbar-thumb-gray-600"
      >
        {combatLogs.map(log => (
          <div
            key={log.id}
            className={`${
              log.type === 'player' ? 'text-blue-400' :
              log.type === 'monster' ? 'text-red-400' :
              'text-yellow-400'
            }`}
          >
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DamageNumbers: React.FC = () => {
  const { damageNumbers } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {damageNumbers.map(dmg => (
        <div
          key={dmg.id}
          className={`absolute animate-float-up ${
            dmg.isCrit ? 'text-2xl font-bold text-yellow-400 animate-shake' : 'text-lg font-bold text-white'
          }`}
          style={{
            left: dmg.x,
            top: dmg.y,
          }}
        >
          {dmg.isCrit && <span className="mr-1">暴击!</span>}
          {dmg.value}
        </div>
      ))}
    </div>
  );
};

export const GameOverOverlay: React.FC = () => {
  const { isGameOver, tower, respawnPlayer } = useGameStore();

  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="text-center bg-gray-900/90 rounded-xl p-6 border border-red-500/50">
        <div className="text-4xl mb-2">💀</div>
        <h2 className="text-2xl font-bold text-red-500 mb-2">阵亡</h2>
        <p className="text-gray-400 text-sm mb-3">第 {tower.currentFloor} 层</p>
        <button
          onClick={respawnPlayer}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold transition-all"
        >
          满血复活
        </button>
      </div>
    </div>
  );
};
