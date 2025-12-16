import React from 'react';
import { AppState, DRINK_OPTIONS, DrinkPreference } from '../types';
import { Input } from './Input';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const PartySettings: React.FC<Props> = ({ state, setState }) => {
  const handleDrinkChange = (id: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setState(prev => {
      const existing = prev.drinks.find(d => d.id === id);
      const otherDrinks = prev.drinks.filter(d => d.id !== id);
      
      const option = DRINK_OPTIONS.find(o => o.id === id);
      if (!option) return prev;

      if (numValue === 0) {
        return { ...prev, drinks: otherDrinks };
      }

      const newDrink: DrinkPreference = {
        ...option,
        count: numValue,
        category: option.category as 'alcohol' | 'soft'
      };

      return { ...prev, drinks: [...otherDrinks, newDrink] };
    });
  };

  const getDrinkCount = (id: string) => {
    return state.drinks.find(d => d.id === id)?.count || 0;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>🎉</span> Параметри вечірки
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Кількість гостей" 
            type="number" 
            min="1"
            value={state.peopleCount}
            onChange={(e) => setState(prev => ({ ...prev, peopleCount: parseInt(e.target.value) || 1 }))}
          />
          <Input 
            label="Тривалість (днів)" 
            type="number" 
            min="1"
            value={state.eventDays}
            onChange={(e) => setState(prev => ({ ...prev, eventDays: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>🍾</span> Напої
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Алкогольні напої</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DRINK_OPTIONS.filter(d => d.category === 'alcohol').map(drink => (
                <div key={drink.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-700">{drink.name}</span>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      min="0"
                      value={getDrinkCount(drink.id)}
                      onChange={(e) => handleDrinkChange(drink.id, e.target.value)}
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Безалкогольні напої</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DRINK_OPTIONS.filter(d => d.category === 'soft').map(drink => (
                <div key={drink.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-700">{drink.name}</span>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      min="0"
                      value={getDrinkCount(drink.id)}
                      onChange={(e) => handleDrinkChange(drink.id, e.target.value)}
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};