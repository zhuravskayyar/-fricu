import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { Button } from './Button';
import { getRealTimePrices } from '../services/geminiService';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const ShoppingList: React.FC<Props> = ({ state, setState }) => {
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Aggregate ingredients
  const aggregatedIngredients = useMemo(() => {
    const map = new Map<string, { amount: number; unit: string }>();

    state.menu.forEach(dish => {
      const scale = state.peopleCount / dish.baseServings;
      dish.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}_${ing.unit}`;
        const current = map.get(key) || { amount: 0, unit: ing.unit };
        map.set(key, { amount: current.amount + (ing.amount * scale), unit: ing.unit });
      });
    });

    return Array.from(map.entries()).map(([key, val]) => {
      const name = key.split('_')[0];
      return { name, ...val };
    });
  }, [state.menu, state.peopleCount]);

  const handleFetchPrices = async () => {
    setLoadingPrices(true);
    try {
      const ingredientNames = aggregatedIngredients.map(i => i.name);
      // Also add drinks
      state.drinks.forEach(d => ingredientNames.push(d.name));

      const prices = await getRealTimePrices(ingredientNames);
      setState(prev => ({
        ...prev,
        prices: { ...prev.prices, ...prices }
      }));
    } catch (e) {
      console.error(e);
      alert('Помилка отримання цін');
    } finally {
      setLoadingPrices(false);
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    // Food
    aggregatedIngredients.forEach(ing => {
      // Very rough estimation if price is per kg but unit is g
      let price = state.prices[ing.name];
      if (!price) {
        // Try to find fuzzy match
        const key = Object.keys(state.prices).find(k => k.toLowerCase().includes(ing.name.toLowerCase()));
        if (key) price = state.prices[key];
      }
      
      if (price) {
        // Normalize units roughly for demo (assuming price is usually per standard unit 1kg/1l)
        let qty = ing.amount;
        if (ing.unit === 'g' || ing.unit === 'г' || ing.unit === 'ml' || ing.unit === 'мл') {
          qty = qty / 1000;
        }
        total += price * qty;
      }
    });

    // Drinks
    state.drinks.forEach(d => {
        let price = state.prices[d.name];
        if (!price) {
            const key = Object.keys(state.prices).find(k => k.toLowerCase().includes(d.name.toLowerCase()));
            if (key) price = state.prices[key];
        }
        if (price) {
            total += price * d.count;
        }
    });

    return total;
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-primary to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
            <div>
                <h2 className="text-2xl font-bold">Орієнтовний бюджет</h2>
                <p className="text-indigo-200">Ціни базуються на даних з інтернету (Європа)</p>
            </div>
            <div className="text-right">
                <div className="text-4xl font-bold">€{calculateTotalCost().toFixed(2)}</div>
                <Button 
                    variant="secondary" 
                    className="mt-2 bg-white text-primary hover:bg-indigo-50 shadow-none border-0"
                    onClick={handleFetchPrices}
                    isLoading={loadingPrices}
                >
                    🔍 Оновити ціни (Google)
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Продукти</h3>
                <ul className="space-y-3">
                    {aggregatedIngredients.map((item, idx) => {
                         const price = state.prices[item.name] || 0;
                         return (
                            <li key={idx} className="flex justify-between items-center text-sm">
                                <span className="capitalize">{item.name}</span>
                                <div className="flex gap-4">
                                    <span className="text-slate-500">{item.amount.toFixed(0)} {item.unit}</span>
                                    <span className={`w-16 text-right font-medium ${price ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {price ? `€${price.toFixed(2)}` : '---'}
                                    </span>
                                </div>
                            </li>
                         );
                    })}
                    {aggregatedIngredients.length === 0 && <li className="text-slate-400 italic">Створіть меню для формування списку</li>}
                </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Напої</h3>
                <ul className="space-y-3">
                    {state.drinks.map((item, idx) => {
                         const price = state.prices[item.name] || 0;
                         return (
                            <li key={idx} className="flex justify-between items-center text-sm">
                                <span className="capitalize">{item.name}</span>
                                <div className="flex gap-4">
                                    <span className="text-slate-500">{item.count} шт/л</span>
                                    <span className={`w-16 text-right font-medium ${price ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {price ? `€${price.toFixed(2)}` : '---'}
                                    </span>
                                </div>
                            </li>
                         );
                    })}
                     {state.drinks.length === 0 && <li className="text-slate-400 italic">Додайте напої в налаштуваннях</li>}
                </ul>
            </div>
        </div>
    </div>
  );
};