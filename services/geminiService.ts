import { GoogleGenAI } from "@google/genai";
import { TradeItem } from '../types';

export const analyzeMarket = async (items: TradeItem[]): Promise<string> => {
  // Initialize Gemini with the API key from environment variables.
  // Assumes process.env.API_KEY is pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a summarized context for the AI
  // We only send the top 5 and bottom 5 to save tokens and context
  const sortedByEfficiency = [...items].sort((a, b) => b.dustRatio - a.dustRatio);
  const top5 = sortedByEfficiency.slice(0, 5);
  
  const promptContext = JSON.stringify(top5.map(i => ({
    item: i.name,
    cost: `${i.priceAmount} ${i.priceCurrency}`,
    dust: i.dustValue,
    ratio: i.dustRatio
  })));

  const prompt = `
    Actúa como un experto jugador de Path of Exile enfocado en la mecánica de "Keepers".
    Analiza la siguiente lista de objetos (Mejores candidatos por Dust/Costo):
    ${promptContext}

    Proporciona un consejo breve y estratégico (máximo 3 oraciones) en Español sobre cuál objeto compraría para maximizar la obtención de Thaumaturgic Dust y por qué. Menciona si el precio parece sospechosamente barato o si es una oportunidad de arbitraje.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hubo un error consultando al oráculo de Kalguur (Gemini API).";
  }
};