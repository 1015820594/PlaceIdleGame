import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  GameHeader,
  PlayerCard,
  MonsterArea,
  SkillBar,
  CombatLog,
  DamageNumbers,
  GameOverOverlay,
  EntityDetailModal,
} from '@/components/GameComponents';
import { Entity } from '@/types/game';
import { BaseStats } from '@/types/game';

export default function Home() {
  const {
    initializeGame,
    loadGame,
    nextTurn,
    isPaused,
    isGameOver,
    addAttributePoint,
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isPlayerModal, setIsPlayerModal] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!isInitialized) {
      loadGame();
      initializeGame();
      setIsInitialized(true);
    }
  }, [initializeGame, loadGame, isInitialized]);

  useEffect(() => {
    if (!isInitialized || isPaused || isGameOver) return;

    const tickRate = 1500;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= tickRate) {
        lastTickRef.current = timestamp;
        nextTurn();
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isInitialized, isPaused, isGameOver, nextTurn]);

  const handlePlayerClick = () => {
    const { player, tower } = useGameStore.getState();
    const playerEntity: Entity = {
      id: 'player',
      name: player.name,
      level: player.level,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
      baseStats: player.baseStats,
      computedStats: {
        maxHp: 0,
        maxMp: 0,
        physicalAttack: 0,
        magicalAttack: 0,
        physicalDefense: 0,
        magicalDefense: 0,
        hitRate: 0,
        dodgeRate: 0,
        critRate: 0,
        critDefense: 0,
        iceAttack: 0,
        fireAttack: 0,
        thunderAttack: 0,
        poisonAttack: 0,
      },
      skills: player.skills,
      isPlayer: true,
      isDead: false,
    };
    setSelectedEntity(playerEntity);
    setIsPlayerModal(true);
    setModalOpen(true);
  };

  const handleMonsterClick = (monster: any) => {
    const monsterEntity: Entity = {
      ...monster,
      computedStats: {
        maxHp: monster.maxHp,
        maxMp: monster.maxMp,
        physicalAttack: 0,
        magicalAttack: 0,
        physicalDefense: 0,
        magicalDefense: 0,
        hitRate: 0,
        dodgeRate: 0,
        critRate: 0,
        critDefense: 0,
        iceAttack: 0,
        fireAttack: 0,
        thunderAttack: 0,
        poisonAttack: 0,
      },
    };
    setSelectedEntity(monsterEntity);
    setIsPlayerModal(false);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-red-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <GameHeader />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 flex items-center justify-center p-2 border-r border-gray-800/50">
            <PlayerCard onClick={handlePlayerClick} />
          </div>

          <div className="w-2/3 flex flex-col p-2">
            <div className="flex-1 overflow-y-auto">
              <MonsterArea onMonsterClick={handleMonsterClick} />
            </div>
            <CombatLog />
          </div>
        </div>

        <SkillBar />
      </div>

      <EntityDetailModal
        entity={selectedEntity}
        isPlayer={isPlayerModal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddPoint={addAttributePoint}
      />

      <DamageNumbers />
      <GameOverOverlay />
    </div>
  );
}
