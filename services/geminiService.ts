import { GoogleGenAI, Type } from "@google/genai";
import { Dish, Ingredient } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRecipe = async (dishName: string, cuisineContext?: string): Promise<Dish> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    Створи детальний рецепт для страви: "${dishName}".
    Кухня: ${cuisineContext || 'будь-яка'}.
    Поверни JSON об'єкт.
    Використовуй емодзі для поля "emoji", яке найкраще описує страву.
    Кількість порцій за замовчуванням (baseServings) має бути 4.
    Інгредієнти повинні мати числові значення для кількості (amount).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          emoji: { type: Type.STRING },
          cuisine: { type: Type.STRING, enum: ['українська', 'німецька', 'японська', 'європейська', 'інша'] },
          baseServings: { type: Type.NUMBER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
              }
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate recipe");
  
  const data = JSON.parse(text);
  return {
    ...data,
    id: crypto.randomUUID()
  };
};

export const suggestRandomDish = async (cuisine: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Напиши тільки одну назву популярної страви для кухні: ${cuisine}. Лише назва, без зайвих слів.`,
  });

  return response.text?.trim() || "Борщ";
};

export const getRealTimePrices = async (ingredients: string[]): Promise<Record<string, number>> => {
  if (!apiKey) throw new Error("API Key not found");

  if (ingredients.length === 0) return {};

  // Grouping to avoid too huge prompt, but for demo we take first 15 unique items
  const items = ingredients.slice(0, 15).join(", ");
  
  const prompt = `
    Знайди актуальні середні ціни в супермаркетах Європи (в Євро) для наступних продуктів: ${items}.
    Поверни JSON об'єкт, де ключ - це назва продукту, а значення - ціна за одиницю (наприклад за 1 кг або 1 шт) числом.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) return {};
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse prices JSON", e);
    return {};
  }
};

export const chatWithAI = async (message: string, context: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Ти помічник з планування святкового столу. Контекст поточного меню: ${context}. Питання користувача: ${message}`,
  });

  return response.text || "Вибачте, я не можу відповісти зараз.";
};
