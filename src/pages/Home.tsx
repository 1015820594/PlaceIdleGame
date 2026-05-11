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
    player,
    monsters,
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-red-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col min-h-screen">
        <GameHeader />

        <div className="flex-1 flex flex-col overflow-hidden">
          <MonsterArea />

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full">
              {activeTab === 'combat' ? (
                <PlayerCard />
              ) : (
                <AttributePanel />
              )}
            </div>
          </div>

          <CombatLog />

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
      </div>

      <DamageNumbers />
      <GameOverOverlay />
    </div>
  );
}
