import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { calculateComputedStats } from '../utils/gameLogic';
import { Play, Pause, RotateCcw, Zap, Shield, Heart, Sword } from 'lucide-react';

export const GameHeader: React.FC = () => {
  const { tower, player, isPaused, togglePause, isGameOver, respawnPlayer } = useGameStore();

  return (
    <div className="bg-gradient-to-b from-purple-900/50 to-transparent p-4 border-b border-purple-500/20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              第 {tower.currentFloor} 层
            </div>
            <div className="text-sm text-gray-400">
              历史最高: {tower.maxFloor} 层
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="p-2 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            {isGameOver && (
              <button
                onClick={respawnPlayer}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重生
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">金币:</span>
            <span className="text-yellow-400 font-bold">{player.gold.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">等级:</span>
            <span className="text-blue-400 font-bold">{player.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">属性点:</span>
            <span className="text-green-400 font-bold">{player.attributePoints}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayerCard: React.FC = () => {
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
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-gray-900/80 rounded-lg p-3 border border-blue-500/30">
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

export const MonsterCard: React.FC<{ monster: any; index: number }> = ({ monster }) => {
  const hpPercent = (monster.hp / monster.maxHp) * 100;
  const isBoss = monster.name.startsWith('BOSS');
  const isElite = monster.name.startsWith('精英');

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-300 ${
        isBoss ? 'bg-red-900/40 border border-red-500/50' :
        isElite ? 'bg-orange-900/40 border border-orange-500/50' :
        'bg-gray-900/60 border border-gray-700/50'
      } ${monster.isDead ? 'opacity-30 grayscale' : ''}`}
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

export const MonsterArea: React.FC = () => {
  const { monsters } = useGameStore();

  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4].map(index => (
        <MonsterCard
          key={monsters[index]?.id || index}
          monster={monsters[index] || { isDead: true, name: '空位', hp: 0, maxHp: 1, level: 0 }}
          index={index}
        />
      ))}
    </div>
  );
};

export const SkillBar: React.FC = () => {
  const { player, useSkill } = useGameStore();

  const getSkillIcon = (type: string) => {
    switch (type) {
      case 'damage': return <Sword className="w-5 h-5" />;
      case 'defense': return <Shield className="w-5 h-5" />;
      case 'heal': return <Heart className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
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
    <div className="bg-gray-900/50 p-4 border-t border-gray-700/50">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-3">
          {player.skills.map(skill => (
            <button
              key={skill.id}
              onClick={() => useSkill(skill.id)}
              disabled={skill.currentCooldown > 0}
              className={`flex-1 relative bg-gradient-to-b ${getSkillColor(skill.type)} rounded-xl p-3 transition-all duration-200 ${
                skill.currentCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getSkillIcon(skill.type)}
                <span className="font-bold text-white text-sm">{skill.name}</span>
              </div>
              <div className="text-xs text-white/80">{skill.description}</div>

              {skill.currentCooldown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <span className="text-white font-bold">{skill.currentCooldown}s</span>
                </div>
              )}
            </button>
          ))}
        </div>
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
    <div className="bg-gray-900/80 p-4 border-t border-gray-700/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-xs text-gray-400 mb-2">战斗日志</div>
        <div
          ref={scrollRef}
          className="h-24 overflow-y-auto text-sm space-y-1 scrollbar-thin scrollbar-thumb-gray-600"
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
    </div>
  );
};

export const AttributePanel: React.FC = () => {
  const { player, addAttributePoint } = useGameStore();
  const computedStats = calculateComputedStats(player.baseStats, player.bonusStats);

  const attributes = [
    { key: 'str' as const, name: '力量', desc: '外功攻击', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    { key: 'int' as const, name: '灵气', desc: '内功攻击', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { key: 'vit' as const, name: '体力', desc: '血量&外防', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { key: 'def' as const, name: '定力', desc: '气量&内防', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { key: 'agi' as const, name: '身法', desc: '命中/闪避', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  ];

  return (
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">属性加点</h3>
        <div className="text-sm text-green-400">
          可用点数: <span className="font-bold">{player.attributePoints}</span>
        </div>
      </div>

      <div className="space-y-3">
        {attributes.map(attr => (
          <div key={attr.key} className={`${attr.bgColor} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={`font-bold ${attr.color}`}>{attr.name}</span>
                <span className="text-gray-400 text-xs ml-2">({attr.desc})</span>
              </div>
              <span className="text-white font-bold">{player.baseStats[attr.key]}</span>
            </div>
            <button
              onClick={() => addAttributePoint(attr.key)}
              disabled={player.attributePoints <= 0}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                player.attributePoints > 0
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              +1 {attr.name}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <h4 className="text-sm text-gray-400 mb-2">战斗属性</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">外功攻击:</span>
            <span className="text-white">{computedStats.physicalAttack}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">内功攻击:</span>
            <span className="text-white">{computedStats.magicalAttack}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">外功防御:</span>
            <span className="text-white">{computedStats.physicalDefense}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">内功防御:</span>
            <span className="text-white">{computedStats.magicalDefense}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">命中:</span>
            <span className="text-white">{computedStats.hitRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">闪避:</span>
            <span className="text-white">{computedStats.dodgeRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">会心:</span>
            <span className="text-white">{computedStats.critRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">血量:</span>
            <span className="text-white">{computedStats.maxHp}</span>
          </div>
        </div>
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
            dmg.isCrit ? 'text-3xl font-bold text-yellow-400 animate-shake' : 'text-xl font-bold text-white'
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-4xl font-bold text-red-500 mb-4">你已阵亡</h2>
        <p className="text-gray-400 mb-2">挑战至第 {tower.currentFloor} 层</p>
        <p className="text-yellow-400 mb-6">历史最高: {tower.maxFloor} 层</p>
        <button
          onClick={respawnPlayer}
          className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold text-xl transition-all transform hover:scale-105"
        >
          重生挑战
        </button>
      </div>
    </div>
  );
};
