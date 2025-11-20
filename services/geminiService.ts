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
    Act as an expert Path of Exile player focused on the current league mechanics.
    Analyze the following list of items (Best candidates for Dust/Cost considering 20% Quality):
    ${promptContext}

    Provide brief strategic advice (max 3 sentences) in English on which item to buy to maximize Thaumaturgic Dust gain. Mention if it's worth using Whetstones/Scraps for 20% quality.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "There was an error consulting the Oracle of Kalguur (Gemini API).";
  }
};