import { GoogleGenAI } from "@google/genai";
import { TradeItem } from '../types';

export const analyzeMarket = async (items: TradeItem[]): Promise<string> => {
  // Initialize Gemini with the API key from environment variables.
  // Assumes process.env.API_KEY is pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a summarized context for the AI
  // We use Q20 ratio as the benchmark for efficiency
  const sortedByEfficiency = [...items].sort((a, b) => b.dustRatio84Q20 - a.dustRatio84Q20);
  const top5 = sortedByEfficiency.slice(0, 5);
  
  const promptContext = JSON.stringify(top5.map(i => ({
    item: i.name,
    cost: `${i.priceAmount} ${i.priceCurrency}`,
    dustQ20: i.dustValIlvl84Q20,
    ratio: i.dustRatio84Q20
  })));

  const prompt = `
    Actúa como un experto jugador de Path of Exile enfocado en la mecánica de "Keepers".
    Analiza la siguiente lista de objetos (Mejores candidatos por Dust/Costo considerando 20% Quality):
    ${promptContext}

    Proporciona un consejo breve y estratégico (máximo 3 oraciones) en Español sobre cuál objeto compraría para maximizar la obtención de Thaumaturgic Dust. Menciona si vale la pena usar Whetstones/Scraps para el 20% de calidad.
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