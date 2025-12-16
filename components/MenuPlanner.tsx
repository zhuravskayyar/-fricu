import React, { useState } from 'react';
import { AppState, Dish, CUISINES } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { generateRecipe, suggestRandomDish } from '../services/geminiService';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const MenuPlanner: React.FC<Props> = ({ state, setState }) => {
  const [newDishName, setNewDishName] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('українська');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddDish = async () => {
    if (!newDishName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const recipe = await generateRecipe(newDishName, selectedCuisine);
      setState(prev => ({
        ...prev,
        menu: [...prev.menu, recipe]
      }));
      setNewDishName('');
    } catch (e) {
      setError('Не вдалося створити рецепт. Спробуйте ще раз.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomDish = async () => {
    setLoading(true);
    try {
      const name = await suggestRandomDish(selectedCuisine);
      setNewDishName(name);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeDish = (id: string) => {
    setState(prev => ({
      ...prev,
      menu: prev.menu.filter(d => d.id !== id)
    }));
  };

  const calculateScaledAmount = (baseAmount: number, baseServings: number) => {
    // Scaling logic: Base * (Target People / Base People) * Days (roughly)
    // Assuming leftovers are okay, or days implies cooking fresh. 
    // Let's scale purely by people for the single meal context, user can add multiple instances if needed for multiple days.
    // Or simpler: User wants to scale this specific recipe to X people.
    // The prompt says: "Calculator to scale recipes... if recipe is for 4, scale for 9".
    // We will auto-scale based on global peopleCount.
    const scaleFactor = state.peopleCount / baseServings;
    return (baseAmount * scaleFactor).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Add Dish Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Додати страву</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
             <label className="text-sm font-medium text-slate-600 block mb-1">Кухня</label>
             <select 
               className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
               value={selectedCuisine}
               onChange={(e) => setSelectedCuisine(e.target.value)}
             >
               {CUISINES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
             </select>
          </div>
          <div className="flex-1 w-full">
            <Input 
              label="Назва страви"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              placeholder="Наприклад: Олів'є"
              onKeyDown={(e) => e.key === 'Enter' && handleAddDish()}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleRandomDish} variant="ghost" type="button" disabled={loading} title="Випадковий рецепт">
              🎲
            </Button>
            <Button onClick={handleAddDish} isLoading={loading} className="w-full md:w-auto">
              Додати
            </Button>
          </div>
        </div>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {/* Menu List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.menu.map((dish) => (
          <div key={dish.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl bg-slate-50 p-2 rounded-xl">{dish.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{dish.name}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                      {dish.cuisine}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => removeDish(dish.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl mb-4">
                <div className="flex justify-between items-center text-sm text-primary font-medium mb-2">
                  <span>Масштабування:</span>
                  <span>{dish.baseServings} ➔ {state.peopleCount} осіб</span>
                </div>
                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="font-semibold text-slate-700">Інгредієнти:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {dish.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                      <span>{ing.name}</span>
                      <span className="font-medium text-slate-800">
                        {calculateScaledAmount(ing.amount, dish.baseServings)} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <details className="text-sm text-slate-500 cursor-pointer">
                <summary className="hover:text-primary transition-colors">Інструкція приготування</summary>
                <ol className="list-decimal pl-5 pt-2 space-y-1">
                  {dish.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
            </div>
          </div>
        ))}
      </div>
      
      {state.menu.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400">Меню поки що порожнє. Додайте першу страву!</p>
        </div>
      )}
    </div>
  );
};