
import React, { useState } from 'react';

interface BlockLibraryProps {
  onAddBlock: (type: any, params?: any) => void;
}

const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock }) => {
  const [inputs, setInputs] = useState({
    move: 30,
    turn: 90,
    changeX: 50,
    changeY: 50,
  });

  const handleChange = (name: string, value: string) => {
    let numValue = parseInt(value) || 0;
    
    if (name === 'move' || name === 'changeX' || name === 'changeY') {
      numValue = Math.max(-240, Math.min(240, numValue));
    }
    
    if (name.includes('turn')) {
      numValue = Math.max(-360, Math.min(360, numValue));
    }

    setInputs(prev => ({ ...prev, [name]: numValue }));
  };

  return (
    <div className="space-y-4">
      {/* Motion Section */}
      <div>
        <p className="text-[9px] uppercase font-black text-blue-500 mb-2 tracking-[0.2em] px-1">Motion</p>
        <div className="grid grid-cols-1 gap-2">
          {/* WALK BLOCK */}
          <div className="flex gap-1 h-11 lg:h-10">
             <button 
              onClick={() => onAddBlock('move', { value: inputs.move })}
              className="flex-1 bg-blue-500 text-white text-[11px] px-3 py-2 rounded-xl font-black border-b-4 border-blue-800 active:translate-y-0.5 active:border-b-0 transition-all flex justify-between items-center"
            >
              Walk <span>{inputs.move}</span>
            </button>
            <input 
              type="number" 
              value={inputs.move} 
              onChange={(e) => handleChange('move', e.target.value)}
              className="w-12 bg-blue-50 border border-blue-100 rounded-xl text-center font-black text-blue-700 text-[11px]"
            />
          </div>

          <div className="flex gap-1 h-11 lg:h-10">
            <button 
              onClick={() => onAddBlock('changex', { value: inputs.changeX })}
              className="flex-1 bg-blue-500 text-white text-[11px] px-3 py-2 rounded-xl font-black border-b-4 border-blue-800 active:translate-y-0.5 active:border-b-0 transition-all flex justify-between items-center"
            >
              Slide X <span>{inputs.changeX}</span>
            </button>
            <input 
              type="number" 
              value={inputs.changeX} 
              onChange={(e) => handleChange('changeX', e.target.value)}
              className="w-12 bg-blue-50 border border-blue-100 rounded-xl text-center font-black text-blue-700 text-[11px]"
            />
          </div>

          <div className="flex gap-1 h-11 lg:h-10">
            <button 
              onClick={() => onAddBlock('changey', { value: inputs.changeY })}
              className="flex-1 bg-blue-500 text-white text-[11px] px-3 py-2 rounded-xl font-black border-b-4 border-blue-800 active:translate-y-0.5 active:border-b-0 transition-all flex justify-between items-center"
            >
              Slide Y <span>{inputs.changeY}</span>
            </button>
            <input 
              type="number" 
              value={inputs.changeY} 
              onChange={(e) => handleChange('changeY', e.target.value)}
              className="w-12 bg-blue-50 border border-blue-100 rounded-xl text-center font-black text-blue-700 text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Looks Section */}
      <div>
        <p className="text-[9px] uppercase font-black text-purple-500 mb-2 tracking-[0.2em] px-1">Looks</p>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onAddBlock('costume', { value: 'next' })}
            className="h-11 lg:h-10 bg-purple-500 text-white text-[10px] py-2 rounded-xl font-black border-b-4 border-purple-800 active:translate-y-0.5 active:border-b-0 transition-all"
          >
            🎭 Persona
          </button>
          <button 
            onClick={() => onAddBlock('background', { value: 'random' })}
            className="h-11 lg:h-10 bg-purple-500 text-white text-[10px] py-2 rounded-xl font-black border-b-4 border-purple-800 active:translate-y-0.5 active:border-b-0 transition-all"
          >
            ☁️ World
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockLibrary;
