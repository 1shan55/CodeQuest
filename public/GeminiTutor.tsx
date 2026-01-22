
import React, { useState, useRef, useEffect } from 'react';
import { askTutor } from '../services/geminiService';

const GeminiTutor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'tutor', text: string}[]>([
    { role: 'tutor', text: "Hi! I'm Sparky! 🐾 Need help with your mission?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await askTutor(userMsg, "The user is in a coding/math mission for children. They are learning Scratch-style motion and simple math riddles.");
    setMessages(prev => [...prev, { role: 'tutor', text: response || "" }]);
    setLoading(false);
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[70] flex items-center">
      {isOpen ? (
        <div className="mr-2 bg-white w-[85vw] lg:w-80 h-[60vh] lg:h-[480px] rounded-3xl shadow-2xl flex flex-col border-4 border-yellow-400 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-yellow-400 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-yellow-900 text-sm lg:text-base">
              <span className="text-xl lg:text-2xl">⚡</span> Sparky Tutor
            </div>
            <button onClick={() => setIsOpen(false)} className="text-yellow-900 hover:bg-yellow-500 p-1.5 rounded-full transition-colors">
              ✕
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-yellow-50/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] lg:text-sm shadow-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-yellow-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm animate-pulse text-[10px] text-slate-400">
                  Sparky is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-white flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Sparky!"
              className="flex-1 border rounded-full px-4 py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-slate-50"
            />
            <button 
              onClick={handleSend}
              className="bg-yellow-400 text-yellow-900 p-2.5 rounded-full hover:bg-yellow-500 active:scale-90 transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex flex-col items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black py-4 px-2 lg:px-3 rounded-l-3xl shadow-xl transition-all hover:pr-4 border-l-2 border-y-2 border-yellow-300 active:translate-x-1"
        >
          <span className="text-xl lg:text-3xl animate-bounce-subtle">🐾</span>
          <span className="text-[10px] lg:text-xs uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">Help Centre</span>
        </button>
      )}
    </div>
  );
};

export default GeminiTutor;
