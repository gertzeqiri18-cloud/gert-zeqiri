
import { GoogleGenAI, Type } from "@google/genai";
import { AIAdvice } from "../types";

// Always use the process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeTradeSetup(
  symbol: string,
  strategy: string,
  confluences: string[],
  entry: number,
  sl: number,
  tp: number
): Promise<AIAdvice> {
  const prompt = `
    Analyze this potential trade setup:
    Symbol: ${symbol}
    Strategy: ${strategy}
    Confluences: ${confluences.join(', ')}
    Entry: ${entry}
    Stop Loss: ${sl}
    Take Profit: ${tp}
    Risk/Reward: ${Math.abs((tp - entry) / (entry - sl)).toFixed(2)}

    Please act as a professional risk manager and technical analyst.
  `;

  try {
    // Upgraded to gemini-3-pro-preview for complex reasoning and technical analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: {
              type: Type.STRING,
              description: "One of: 'Enter', 'Avoid', 'Consider Risk'",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence level between 0 and 100",
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief professional explanation",
            },
            riskWarning: {
              type: Type.STRING,
              description: "Specific risk warnings if any",
            },
          },
          required: ["recommendation", "confidence", "reasoning"],
        },
      },
    });

    // Access the text property directly as per guidelines
    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      recommendation: 'Consider Risk',
      confidence: 50,
      reasoning: "AI analysis unavailable. Please review risk manually.",
    };
  }
}
