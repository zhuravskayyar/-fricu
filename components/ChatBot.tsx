import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { chatWithAI } from '../services/geminiService';
import { AppState } from '../types';

interface Props {
  state: AppState;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBot: React.FC<Props> = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привіт! Я ваш AI помічник. Допомогти спланувати меню або порадити рецепт?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Construct context from state
      const menuContext = state.menu.map(d => d.name).join(', ');
      const context = `Гостей: ${state.peopleCount}, Меню: [${menuContext}]`;
      
      const response = await chatWithAI(userMsg, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Виникла помилка. Спробуйте пізніше." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-fade-in-up">
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">🤖 AI Асистент</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 p-3 rounded-2xl rounded-bl-none text-xs shadow-sm">
                  Думаю...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              className="flex-1 px-3 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              placeholder="Напишіть повідомлення..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={loading} className="!px-3 !py-2">➤</Button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-gradient-to-br from-primary to-indigo-600 rounded-full shadow-lg shadow-indigo-500/40 text-white flex items-center justify-center text-2xl hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};