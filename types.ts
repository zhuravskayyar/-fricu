export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Dish {
  id: string;
  name: string;
  emoji: string;
  cuisine: 'українська' | 'німецька' | 'японська' | 'європейська' | 'інша';
  baseServings: number;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface DrinkPreference {
  id: string;
  name: string;
  category: 'alcohol' | 'soft';
  count: number; // Кількість пляшок/літрів
}

export interface PriceCache {
  [ingredientName: string]: number; // Price in Euro
}

export interface AppState {
  peopleCount: number;
  eventDays: number;
  drinks: DrinkPreference[];
  menu: Dish[];
  prices: PriceCache;
}

export const DRINK_OPTIONS = [
  { id: 'vodka', name: 'Горілка', category: 'alcohol' },
  { id: 'whiskey', name: 'Віскі', category: 'alcohol' },
  { id: 'cognac', name: 'Коньяк', category: 'alcohol' },
  { id: 'wine_red', name: 'Вино (червоне)', category: 'alcohol' },
  { id: 'wine_white', name: 'Вино (біле)', category: 'alcohol' },
  { id: 'champagne', name: 'Шампанське', category: 'alcohol' },
  { id: 'beer', name: 'Пиво', category: 'alcohol' },
  { id: 'energy', name: 'Енергетики', category: 'soft' },
  { id: 'cola', name: 'Coca-Cola', category: 'soft' },
  { id: 'pepsi', name: 'Pepsi-Cola', category: 'soft' },
  { id: 'juice', name: 'Сік', category: 'soft' },
  { id: 'water', name: 'Вода мінеральна', category: 'soft' },
] as const;

export const CUISINES = ['українська', 'німецька', 'японська', 'європейська'] as const;