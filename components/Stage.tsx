
import React, { useEffect, useState, useRef } from 'react';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../constants';
import { SpriteState } from '../types';

interface StageProps {
  sprite: SpriteState;
  background: string;
  showGrid?: boolean;
  target?: { x: number; y: number } | null;
  isSuccess?: boolean;
  onStageClick?: (x: number, y: number) => void;
}

const Stage: React.FC<StageProps> = ({ sprite, background, showGrid = true, target, isSuccess, onStageClick }) => {
  const [trail, setTrail] = useState<{x: number, y: number}[]>([]);
  const prevPos = useRef({ x: sprite.x, y: sprite.y });
  const containerRef = useRef<HTMLDivElement>(null);

  const themeMap: Record<string, { 
    goalEmoji: string; 
    goalName: string; 
    themeClass: string; 
    doodles: string[];
    isDark: boolean;
  }> = {
    '🐱': { goalEmoji: '🐟', goalName: 'Fish', themeClass: 'theme-grassland', doodles: ['🌿', '🦋', '🌳', '🌼'], isDark: false },
    '🐶': { goalEmoji: '🍖', goalName: 'Meat', themeClass: 'theme-grassland', doodles: ['🦴', '🌳', '🌱', '⚽'], isDark: false },
    '🚀': { goalEmoji: '🪐', goalName: 'Planet', themeClass: 'theme-space', doodles: ['✨', '🛸', '☄️', '🌌'], isDark: true },
    '👻': { goalEmoji: '🍬', goalName: 'Candy', themeClass: 'theme-spooky', doodles: ['🎃', '🦇', '🕯️', '🕸️'], isDark: true },
    '💃': { goalEmoji: '💎', goalName: 'Gem', themeClass: 'theme-party', doodles: ['💖', '🎵', '✨', '🎈'], isDark: false },
    '🤖': { goalEmoji: '🔋', goalName: 'Power', themeClass: 'theme-tech', doodles: ['⚙️', '⚡', '🔬', '💡'], isDark: false },
    '👽': { goalEmoji: '🛸', goalName: 'UFO', themeClass: 'theme-space', doodles: ['🛸', '🌌', '✨', '🛰️'], isDark: true },
    '🐲': { goalEmoji: '🔥', goalName: 'Fire', themeClass: 'theme-fire', doodles: ['🌋', '⛰️', '🔥', '💎'], isDark: false },
  };

  const currentTheme = themeMap[sprite.costume] || { 
    goalEmoji: '⭐', 
    goalName: 'Goal', 
    themeClass: '', 
    doodles: ['☁️', '🎨', '🧸', '📐'], 
    isDark: false 
  };

  useEffect(() => {
    if (prevPos.current.x !== sprite.x || prevPos.current.y !== sprite.y) {
      setTrail(prev => [...prev.slice(-30), { x: sprite.x, y: sprite.y }]);
      prevPos.current = { x: sprite.x, y: sprite.y };
    }
  }, [sprite.x, sprite.y]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onStageClick || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const stageX = Math.round(((px / rect.width) * STAGE_WIDTH) - 240);
    const stageY = Math.round(180 - ((py / rect.height) * STAGE_HEIGHT));
    onStageClick(stageX, stageY);
  };

  const left = ((sprite.x + 240) / STAGE_WIDTH) * 100;
  const bottom = ((sprite.y + 180) / STAGE_HEIGHT) * 100;
  const targetLeft = target ? ((target.x + 240) / STAGE_WIDTH) * 100 : 0;
  const targetBottom = target ? ((target.y + 180) / STAGE_HEIGHT) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`relative overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] border-[4px] lg:border-[10px] border-white shadow-xl transition-all duration-700 ease-in-out cursor-crosshair bg-math-graph ${currentTheme.themeClass}`}
      style={{ width: '100%', aspectRatio: '4/3' }}
    >
      {/* Decorative Doodles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <span className="doodle-sun text-2xl lg:text-4xl">{currentTheme.isDark ? '🌙' : '☀️'}</span>
        <span className="absolute top-[20%] left-[10%] text-2xl lg:text-3xl">{currentTheme.doodles[0]}</span>
        <span className="absolute bottom-[10%] right-[15%] text-2xl lg:text-3xl">{currentTheme.doodles[1]}</span>
      </div>

      {/* Math Grid */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`w-full h-[1px] absolute top-1/2 -translate-y-1/2 z-10 ${currentTheme.isDark ? 'bg-blue-400/30' : 'bg-red-600/30'}`}></div>
          <div className={`h-full w-[1px] absolute left-1/2 -translate-x-1/2 z-10 ${currentTheme.isDark ? 'bg-blue-400/30' : 'bg-red-600/30'}`}></div>
        </div>
      )}

      {/* Trail */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
        <polyline points={trail.map(p => `${((p.x + 240) / STAGE_WIDTH) * 100},${100 - ((p.y + 180) / STAGE_HEIGHT) * 100}`).join(' ')} fill="none" stroke={currentTheme.isDark ? '#fbbf24' : '#3b82f6'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ vectorEffect: 'non-scaling-stroke' }} />
      </svg>

      {/* Goal Item */}
      {target && !isSuccess && (
        <div className="absolute magic-star text-3xl lg:text-5xl select-none z-20 pointer-events-none opacity-90" style={{ left: `${targetLeft}%`, bottom: `${targetBottom}%`, transform: `translate(-50%, 50%)` }}>
          {currentTheme.goalEmoji}
        </div>
      )}

      {/* Hero Sprite - Adjusted font sizes for mobile */}
      <div 
        className="absolute transition-all duration-300 ease-out flex items-center justify-center select-none z-30 pointer-events-none" 
        style={{ 
          left: `${left}%`, 
          bottom: `${bottom}%`, 
          transform: `translate(-50%, 50%) rotate(${sprite.rotation}deg) scale(${isSuccess ? 1.4 : 1})`, 
          fontSize: 'clamp(2.5rem, 15vw, 4.5rem)', 
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' 
        }}
      >
        <span className={`inline-block ${isSuccess ? 'animate-bounce' : 'animate-float'}`}>{sprite.costume}</span>
      </div>

      {/* HUD Coordinates - Compacted for mobile */}
      <div className="absolute top-2 left-2 z-40 pointer-events-none flex flex-col gap-1">
        <div className={`bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border flex items-center gap-2 ${currentTheme.isDark ? 'border-slate-700 bg-slate-900/80 text-white' : 'border-slate-200'}`}>
           <p className="font-black text-[8px] lg:text-[10px]">X:{Math.round(sprite.x)} Y:{Math.round(sprite.y)}</p>
        </div>
        {target && !isSuccess && (
          <div className={`backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border flex items-center gap-1 animate-pulse ${currentTheme.isDark ? 'bg-yellow-500/90 border-yellow-400' : 'bg-yellow-400/90 border-yellow-600'}`}>
            <p className="font-black text-yellow-900 text-[8px] lg:text-[10px]">GOAL X:{target.x} Y:{target.y}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage;
