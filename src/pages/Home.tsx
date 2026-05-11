import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  GameHeader,
  PlayerCard,
  MonsterArea,
  SkillBar,
  CombatLog,
  AttributePanel,
  DamageNumbers,
  GameOverOverlay,
} from '@/components/GameComponents';

export default function Home() {
  const {
    initializeGame,
    loadGame,
    nextTurn,
    isPaused,
    isGameOver,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'combat' | 'attributes'>('combat');
  const [isInitialized, setIsInitialized] = useState(false);
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
          <div className="w-1/2 flex items-center justify-center p-4 border-r border-gray-800/50">
            {activeTab === 'combat' ? (
              <PlayerCard />
            ) : (
              <AttributePanel />
            )}
          </div>

          <div className="w-1/2 flex flex-col p-4">
            <div className="flex-1 overflow-y-auto">
              <MonsterArea />
            </div>
            <CombatLog />
          </div>
        </div>

        <div className="bg-gray-900/50 border-t border-gray-700/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('combat')}
              className={`flex-1 py-3 text-center font-bold transition-all ${
                activeTab === 'combat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ⚔️ 战斗
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              className={`flex-1 py-3 text-center font-bold transition-all ${
                activeTab === 'attributes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📊 属性
            </button>
          </div>
        </div>

        <SkillBar />
      </div>

      <DamageNumbers />
      <GameOverOverlay />
    </div>
  );
}
