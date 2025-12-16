import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { PartySettings } from './components/PartySettings';
import { MenuPlanner } from './components/MenuPlanner';
import { ShoppingList } from './components/ShoppingList';
import { ChatBot } from './components/ChatBot';

const TABS = ['settings', 'menu', 'shopping'] as const;
type Tab = typeof TABS[number];

const STORAGE_KEY = 'holiday_table_app_v1';

const INITIAL_STATE: AppState = {
  peopleCount: 4,
  eventDays: 1,
  drinks: [],
  menu: [],
  prices: {}
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Святковий Стіл AI
          </h1>
          <div className="text-xs text-slate-400 hidden sm:block">
            Автозбереження увімкнено
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-2 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Налаштування
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Меню страв
          </button>
          <button 
            onClick={() => setActiveTab('shopping')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'shopping' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Список та Бюджет
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'settings' && <PartySettings state={state} setState={setState} />}
          {activeTab === 'menu' && <MenuPlanner state={state} setState={setState} />}
          {activeTab === 'shopping' && <ShoppingList state={state} setState={setState} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-medium">Опції</span>
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'menu' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="text-xl">🍽️</span>
          <span className="text-[10px] font-medium">Меню</span>
        </button>
        <button 
          onClick={() => setActiveTab('shopping')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'shopping' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="text-xl">🛒</span>
          <span className="text-[10px] font-medium">Бюджет</span>
        </button>
      </div>

      <ChatBot state={state} />
    </div>
  );
}

export default App;