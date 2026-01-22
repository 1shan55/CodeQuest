
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LESSONS, HEROES, BACKGROUNDS, BADGES, STAGE_WIDTH, STAGE_HEIGHT, CostumeDef } from './constants';
import { LessonType, SpriteState, Block } from './types';
import Stage from './components/Stage';
import BlockLibrary from './components/BlockLibrary';
import GeminiTutor from './components/GeminiTutor';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'home' | 'game'>('home');

  // Persistence Loading
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem('cq_stars');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('cq_completed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [unlockedHeroes, setUnlockedHeroes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('cq_unlocked');
    return saved ? new Set(JSON.parse(saved)) : new Set([HEROES[0].id, HEROES[1].id]);
  });

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'mission' | 'blocks' | 'shop'>('mission');
  const [sprite, setSprite] = useState<SpriteState>({
    x: 0,
    y: 0,
    rotation: 0,
    costume: HEROES[0].emoji,
    visible: true,
  });
  const [background, setBackground] = useState(BACKGROUNDS[0].color);
  const [script, setScript] = useState<Block[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [executingBlockId, setExecutingBlockId] = useState<string | null>(null);
  const [questSuccess, setQuestSuccess] = useState(false);
  const [showBadgeWin, setShowBadgeWin] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  
  const currentLesson = LESSONS[currentLessonIndex] || LESSONS[0];
  const isLastLesson = currentLessonIndex === LESSONS.length - 1;

  // Sound Engine
  const playSuccessSound = (costume: string, isFinal: boolean = false) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, slideTo?: number, endGain: number = 0.01) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + startTime + duration);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(endGain, audioCtx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(audioCtx.currentTime + startTime);
      osc.stop(audioCtx.currentTime + startTime + duration);
    };

    if (isFinal) {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => playTone(f, 'square', 0.2, i * 0.15));
    } else {
      playTone(523.25, 'sine', 0.1, 0); 
      playTone(659.25, 'sine', 0.1, 0.1); 
      playTone(783.99, 'sine', 0.4, 0.2); 
    }

    switch (costume) {
      case '🐱': playTone(600, 'triangle', 0.15, 0.4, 1100); playTone(1100, 'triangle', 0.35, 0.55, 400); break;
      case '🐶': playTone(250, 'sawtooth', 0.1, 0.4, 100); playTone(250, 'sawtooth', 0.1, 0.6, 100); break;
      case '🚀': playTone(100, 'sawtooth', 0.8, 0.4, 10); playTone(400, 'sine', 0.8, 0.4, 1600); break;
      case '🤖': playTone(880, 'square', 0.08, 0.4); playTone(440, 'square', 0.08, 0.5); playTone(1760, 'square', 0.08, 0.6); break;
      default: playTone(1200, 'sine', 0.1, 0.4); playTone(1500, 'sine', 0.1, 0.5);
    }
  };

  // Persistence Saving
  useEffect(() => { localStorage.setItem('cq_stars', stars.toString()); }, [stars]);
  useEffect(() => { localStorage.setItem('cq_completed', JSON.stringify(Array.from(completedLessons))); }, [completedLessons]);
  useEffect(() => { localStorage.setItem('cq_unlocked', JSON.stringify(Array.from(unlockedHeroes))); }, [unlockedHeroes]);

  const congratulationPhrases = [
    "Coding Magic! ✨",
    "Brilliant Logic! 🧠",
    "Sparky is jumping for joy! 🐾",
    "Math Mastermind! 👑",
    "GRAND CHAMPION! 🏆"
  ];

  const randomCongrats = useMemo(() => {
    if (isLastLesson && questSuccess) return congratulationPhrases[4];
    if (currentLesson.type === LessonType.QUIZ) return congratulationPhrases[3];
    return congratulationPhrases[Math.floor(Math.random() * 3)];
  }, [showBadgeWin, isLastLesson, questSuccess, currentLesson.type]);

  const resetSprite = useCallback(() => {
    setSprite(prev => ({ ...prev, x: 0, y: 0, rotation: 0 }));
    setExecutingBlockId(null);
    setIsPlaying(false);
    setQuestSuccess(false);
    setQuizFeedback(null);
  }, []);

  const clearScript = useCallback(() => { setScript([]); resetSprite(); }, [resetSprite]);

  const addBlock = (type: any, params: any = {}) => {
    const newBlock: Block = { id: Math.random().toString(36).substr(2, 9), type, ...params };
    setScript(prev => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => { setScript(prev => prev.filter(b => b.id !== id)); };

  const buyHero = (hero: CostumeDef) => {
    if (stars >= hero.price) {
      setStars(prev => prev - hero.price);
      setUnlockedHeroes(prev => {
        const next = new Set(prev);
        next.add(hero.id);
        return next;
      });
      setSprite(prev => ({ ...prev, costume: hero.emoji }));
    }
  };

  const handleStageClick = (x: number, y: number) => { if (isPlaying) return; addBlock('goto', { x, y }); };

  const runBlock = useCallback(async (block: Block) => {
    setExecutingBlockId(block.id);
    switch (block.type) {
      case 'move':
        setSprite(prev => {
          const rad = (prev.rotation * Math.PI) / 180;
          let nx = prev.x + (block.value as number) * Math.cos(rad);
          let ny = prev.y + (block.value as number) * Math.sin(rad);
          return { ...prev, x: Math.max(-240, Math.min(240, nx)), y: Math.max(-180, Math.min(180, ny)) };
        });
        break;
      case 'turn': setSprite(prev => ({ ...prev, rotation: prev.rotation + (block.value as number) })); break;
      case 'changex': setSprite(prev => ({ ...prev, x: Math.max(-240, Math.min(240, prev.x + (block.value as number))) })); break;
      case 'changey': setSprite(prev => ({ ...prev, y: Math.max(-180, Math.min(180, prev.y + (block.value as number))) })); break;
      case 'goto': setSprite(prev => ({ ...prev, x: block.x ?? 0, y: block.y ?? 0 })); break;
      case 'glide': await new Promise(r => setTimeout(r, 600)); setSprite(prev => ({ ...prev, x: block.x ?? 0, y: block.y ?? 0 })); break;
      case 'costume':
        setSprite(prev => {
          const unlockedList = HEROES.filter(h => unlockedHeroes.has(h.id)).map(h => h.emoji);
          const currentIdx = unlockedList.indexOf(prev.costume);
          const nextIdx = (currentIdx + 1) % unlockedList.length;
          return { ...prev, costume: unlockedList[nextIdx] };
        });
        break;
      case 'background':
        const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
        setBackground(randomBg.color);
        break;
    }
    await new Promise(r => setTimeout(r, 400));
  }, [unlockedHeroes]);

  const checkQuestSuccess = useCallback((finalPos: { x: number; y: number }) => {
    if (!currentLesson.targetPos) return false;
    const dist = Math.sqrt(Math.pow(finalPos.x - currentLesson.targetPos.x, 2) + Math.pow(finalPos.y - currentLesson.targetPos.y, 2));
    return dist < 45; 
  }, [currentLesson]);

  const runScript = async (customScript?: Block[]) => {
    const activeScript = customScript || script;
    if (isPlaying || activeScript.length === 0) return;
    setIsPlaying(true);
    setQuestSuccess(false);
    for (const block of activeScript) await runBlock(block);
    setSprite(prev => {
      if (checkQuestSuccess(prev)) {
        setQuestSuccess(true);
        playSuccessSound(prev.costume, isLastLesson);
        if (!completedLessons.has(currentLesson.id)) {
          setCompletedLessons(p => new Set([...p, currentLesson.id]));
          setStars(s => s + 1); 
          setTimeout(() => setShowBadgeWin(true), 600);
        }
      }
      return prev;
    });
    setExecutingBlockId(null);
    setIsPlaying(false);
  };

  const handleQuizAnswer = (index: number) => {
    if (currentLesson.quiz?.correctIndex === index) {
      setQuizFeedback("That's right! 🌟");
      setQuestSuccess(true);
      playSuccessSound(sprite.costume, isLastLesson);
      if (!completedLessons.has(currentLesson.id)) {
        setCompletedLessons(p => new Set([...p, currentLesson.id]));
        setStars(s => s + 2); 
        setTimeout(() => setShowBadgeWin(true), 600);
      }
    } else {
      setQuizFeedback("Oops! Try again! 🧠");
    }
  };

  const handleNextLevel = () => {
    setShowBadgeWin(false);
    if (currentLessonIndex < LESSONS.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      clearScript();
      setActiveTab('mission');
    } else {
      setView('home'); // Go back home if all done
    }
  };

  const currentBadge = useMemo(() => {
    if (isLastLesson) return BADGES.CHAMPION;
    if (currentLesson.type === LessonType.QUIZ) return BADGES.QUIZ;
    switch (currentLesson.type) {
      case LessonType.MOTION: return BADGES.MOTION;
      case LessonType.COORDINATES: return BADGES.COORDINATES;
      case LessonType.COSTUMES: return BADGES.COSTUMES;
      default: return BADGES.PROJECT;
    }
  }, [currentLesson, isLastLesson]);

  // Home Screen View
  if (view === 'home') {
    const completionPercent = Math.round((completedLessons.size / LESSONS.length) * 100);
    
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Animated Background Icons */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 text-6xl animate-float">🚀</div>
          <div className="absolute top-1/4 right-20 text-6xl animate-bounce-subtle">🤖</div>
          <div className="absolute bottom-1/4 left-20 text-6xl animate-float">🐲</div>
          <div className="absolute bottom-10 right-10 text-6xl animate-bounce-subtle">👽</div>
        </div>

        <div className="max-w-md w-full text-center z-10 space-y-8 animate-scale-up">
          <div className="space-y-2">
            <div className="w-24 h-24 bg-yellow-400 rounded-[2rem] flex items-center justify-center mx-auto border-b-8 border-yellow-600 shadow-xl animate-bounce">
              <span className="text-5xl">🌟</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter">
              CODEQUEST<br/>
              <span className="text-blue-500 text-2xl lg:text-3xl uppercase tracking-widest">Junior Animator</span>
            </h1>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-slate-100 space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stars Earned</p>
                <p className="text-3xl font-black text-yellow-500">⭐ {stars}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                <p className="text-3xl font-black text-blue-500">{completionPercent}%</p>
              </div>
            </div>

            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border shadow-inner">
               <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${completionPercent}%` }} />
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={() => setView('game')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 rounded-2xl text-xl font-black shadow-xl border-b-[8px] border-blue-800 active:translate-y-1 active:border-b-0 transition-all"
              >
                {completedLessons.size > 0 ? 'CONTINUE ADVENTURE 🚀' : 'START ADVENTURE ▶️'}
              </button>
              
              {completedLessons.size > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm("Start over? Your stars and unlocks will remain!")) {
                      setCurrentLessonIndex(0);
                      setView('game');
                    }
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 rounded-2xl text-sm font-black transition-all"
                >
                  REPLAY MISSIONS 🔄
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow border text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>👤 Persona:</span>
              <span className="text-lg">{sprite.costume}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Game View
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans">
      <header className="bg-white border-b-4 border-slate-100 px-3 lg:px-6 py-2 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-2 lg:gap-3">
          <button 
            onClick={() => setView('home')}
            className="bg-slate-100 w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center border-b-4 border-slate-200 hover:bg-slate-200 transition-all active:translate-y-0.5"
          >
            <span className="text-sm">🏠</span>
          </button>
          <div>
            <h1 className="text-base lg:text-lg font-black text-slate-800 leading-none">CodeQuest</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black text-yellow-600">⭐ {stars}</span>
            </div>
          </div>
        </div>

        {/* Level Pips */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[50%] lg:max-w-none py-1">
          {LESSONS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { setCurrentLessonIndex(i); clearScript(); }}
              className={`min-w-[28px] lg:min-w-[32px] h-[28px] lg:h-[32px] rounded-lg font-black text-[10px] lg:text-xs transition-all relative flex items-center justify-center ${
                currentLessonIndex === i 
                  ? 'bg-blue-500 text-white shadow-md border-b-2 border-blue-700' 
                  : completedLessons.has(l.id) ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i + 1}
              {completedLessons.has(l.id) && <span className="absolute -top-1 -right-1 text-[8px] bg-white rounded-full shadow-sm">✅</span>}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="lg:w-[380px] flex flex-col border-r-4 border-slate-100 bg-white overflow-hidden order-2 lg:order-1">
          <div className="lg:hidden flex border-b-2 border-slate-50">
             <button onClick={() => setActiveTab('mission')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeTab === 'mission' ? 'text-blue-600 border-b-4 border-blue-500' : 'text-slate-400'}`}>Mission</button>
             <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeTab === 'blocks' ? 'text-blue-600 border-b-4 border-blue-500' : 'text-slate-400'}`}>Blocks</button>
             <button onClick={() => setActiveTab('shop')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeTab === 'shop' ? 'text-yellow-600 border-b-4 border-yellow-500' : 'text-slate-400'}`}>Shop</button>
          </div>

          <div className={`${activeTab === 'mission' || window.innerWidth >= 1024 ? 'block' : 'hidden'} p-4 border-b-2 border-slate-50 transition-colors duration-500 ${currentLesson.type === LessonType.QUIZ ? 'bg-yellow-50' : 'bg-blue-50/30'}`}>
            <h2 className="text-base lg:text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <span className="text-blue-500">#{currentLessonIndex + 1}</span> {currentLesson.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-[8px] lg:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${currentLesson.type === LessonType.QUIZ ? 'bg-orange-400 text-white' : 'bg-blue-400 text-white'}`}>
                {currentLesson.type === LessonType.QUIZ ? 'Math Riddle' : 'Coding Mission'}
              </span>
            </div>
            <p className="text-[11px] lg:text-xs text-slate-600 leading-relaxed italic">
              {currentLesson.content}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-4 bg-white">
            {currentLesson.type !== LessonType.QUIZ ? (
              <>
                <div className={`${activeTab === 'blocks' || window.innerWidth >= 1024 ? 'block' : 'hidden'} space-y-6`}>
                   <BlockLibrary onAddBlock={addBlock} />
                </div>
                <div className={`${activeTab === 'shop' || window.innerWidth >= 1024 ? 'block' : 'hidden'} mt-6 lg:mt-0`}>
                   <div className="bg-white rounded-[1.5rem] border-2 border-slate-100 p-4 shadow-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4">Hero Shop</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {HEROES.map((hero) => (
                          <button
                            key={hero.id}
                            onClick={() => unlockedHeroes.has(hero.id) ? setSprite(s => ({...s, costume: hero.emoji})) : buyHero(hero)}
                            className={`aspect-square rounded-xl flex items-center justify-center relative transition-all border-b-[4px] ${
                              sprite.costume === hero.emoji ? 'bg-blue-500 border-blue-800' : unlockedHeroes.has(hero.id) ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-50'
                            }`}
                          >
                            <span className="text-xl">{hero.emoji}</span>
                            {!unlockedHeroes.has(hero.id) && <span className="absolute -top-1 -right-1 text-[8px] bg-yellow-400 px-1 rounded-full font-black">⭐{hero.price}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                </div>
              </>
            ) : (
              <div className="bg-white border-4 border-yellow-200 rounded-[2rem] p-4 lg:p-6 text-center animate-scale-up shadow-sm">
                <div className="text-4xl lg:text-5xl mb-4">🧩</div>
                <h3 className="text-base lg:text-xl font-black text-slate-800 mb-4">{currentLesson.quiz?.question}</h3>
                <div className="grid grid-cols-1 gap-2 lg:gap-3">
                  {currentLesson.quiz?.options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full bg-white border-b-4 border-slate-200 p-3 lg:p-4 rounded-2xl font-black text-slate-700 hover:bg-yellow-50 hover:border-yellow-200 active:translate-y-1 transition-all text-xs lg:text-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {quizFeedback && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-2xl border-2 border-yellow-100 animate-bounce">
                    <p className="font-black text-xs lg:text-sm text-yellow-700">{quizFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col overflow-hidden bg-slate-50 order-1 lg:order-2">
          <div className="flex-1 flex flex-col items-center justify-center p-3 lg:p-6 relative overflow-hidden">
            <div className="w-full max-w-[640px] shadow-2xl relative">
              <Stage 
                sprite={sprite} 
                background={background} 
                target={currentLesson.targetPos}
                isSuccess={questSuccess}
                onStageClick={handleStageClick}
              />
              {questSuccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                   <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border-4 border-green-400 animate-scale-up">
                      <h3 className="text-xl lg:text-3xl font-black text-green-600 text-center uppercase">
                        {isLastLesson ? '🎉 Ultimate Master! 🎉' : 'Well Done! 🌟'}
                      </h3>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 lg:p-6 bg-white lg:bg-transparent border-t lg:border-t-0 flex flex-col lg:flex-row gap-3 lg:gap-4 h-auto lg:h-28 z-40">
             {currentLesson.type !== LessonType.QUIZ && (
               <>
                <div className="hidden lg:flex flex-1 bg-white rounded-[1.5rem] p-4 border-b-4 border-slate-200 shadow-lg items-center gap-4 overflow-x-auto no-scrollbar">
                   <div className="min-w-[40px] h-[40px] bg-slate-100 rounded-full flex items-center justify-center text-lg shadow-inner">⚡</div>
                   <div className="flex gap-2">
                      {script.length === 0 ? (
                        <p className="text-[10px] font-black text-slate-300 italic">Drag magic blocks to start coding!</p>
                      ) : (
                        script.map((block, idx) => (
                          <div key={block.id} className={`flex-shrink-0 flex items-center gap-3 px-3 py-1.5 rounded-xl text-white text-[9px] font-black border-b-4 transition-all ${
                            executingBlockId === block.id ? 'bg-yellow-400 border-yellow-600 scale-105' : 'bg-blue-500 border-blue-800'
                          }`}>
                            <span>{idx+1}</span>
                            <button onClick={() => removeBlock(block.id)} className="hover:text-red-200 p-0.5">✕</button>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="lg:hidden flex bg-slate-100/50 rounded-xl p-2 gap-2 overflow-x-auto no-scrollbar min-h-[44px]">
                    {script.map((block, idx) => (
                      <div key={block.id} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-white text-[10px] font-black border-b-2 flex items-center gap-2 ${
                        executingBlockId === block.id ? 'bg-yellow-400 border-yellow-600' : 'bg-blue-500 border-blue-800'
                      }`}>
                         {idx+1} <button onClick={() => removeBlock(block.id)}>✕</button>
                      </div>
                    ))}
                    {script.length === 0 && <span className="text-[10px] text-slate-400 p-1 font-bold italic">No blocks yet...</span>}
                </div>

                <div className="flex gap-2 lg:gap-3 w-full lg:w-auto h-12 lg:h-full">
                   <button 
                     onClick={() => runScript()}
                     disabled={isPlaying || script.length === 0}
                     className={`flex-1 lg:px-12 rounded-[1rem] lg:rounded-[1.5rem] shadow-xl flex items-center justify-center gap-2 font-black text-white border-b-[4px] lg:border-b-[6px] transition-all active:translate-y-0.5 active:border-b-0 ${
                       isPlaying || script.length === 0 ? 'bg-slate-300 border-slate-400 grayscale' : 'bg-green-500 border-green-800'
                     }`}
                   >
                     <span className="text-xl lg:text-2xl">{isPlaying ? '⌛' : '▶️'}</span>
                     <span className="text-xs lg:text-sm tracking-widest uppercase font-black">{isPlaying ? 'Running' : 'RUN'}</span>
                   </button>
                   <button 
                     onClick={resetSprite} 
                     className="w-12 lg:w-16 bg-red-500 border-red-800 border-b-[4px] lg:border-b-[6px] rounded-[1rem] lg:rounded-[1.5rem] text-white flex items-center justify-center text-xl lg:text-2xl hover:scale-105 active:scale-95 shadow-xl"
                   >
                     🔄
                   </button>
                </div>
               </>
             )}
          </div>
        </section>
      </main>

      {showBadgeWin && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-sm p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] flex flex-col items-center text-center border-[6px] lg:border-[10px] border-blue-50 shadow-2xl animate-scale-up relative overflow-hidden">
            <div className={`w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${currentBadge.color} rounded-3xl flex items-center justify-center text-4xl lg:text-5xl shadow-xl animate-bounce mb-4 lg:mb-6 text-white border-b-8 border-slate-900/20`}>
              {currentBadge.icon}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-800 mb-1 uppercase tracking-tighter">
              {randomCongrats}
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 font-bold mb-6">You are becoming a genius!</p>
            <div className="bg-slate-50 w-full p-3 lg:p-4 rounded-2xl mb-6 lg:mb-8 border-2 border-slate-100 shadow-inner">
               <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl lg:text-3xl animate-pulse">⭐</span>
                  <span className="text-2xl lg:text-3xl font-black text-yellow-600">
                    x {currentLesson.type === LessonType.QUIZ ? '2' : '1'} Earned!
                  </span>
               </div>
            </div>
            <button 
              onClick={handleNextLevel}
              className="w-full py-3 lg:py-4 rounded-2xl text-lg lg:text-xl font-black shadow-lg border-b-[6px] lg:border-b-[8px] transition-all bg-blue-500 text-white border-blue-800 active:translate-y-1"
            >
              {isLastLesson ? 'FINISH ADVENTURE 🏁' : 'NEXT LEVEL 🚀'}
            </button>
          </div>
        </div>
      )}
      <GeminiTutor />
    </div>
  );
};

export default App;
