
import { GoogleGenAI, Type } from "@google/genai";
import { LVItem, RiskAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTenderDocument = async (fileBase64: string): Promise<{ items: LVItem[], risks: RiskAnalysis[] }> => {
  // In a real app, we'd send the PDF. Here we simulate the prompt logic.
  // The system instruction defines the strict extraction rules.
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { text: "Extract structured quantity data from this construction tender document. Identify contradictions between descriptions and quantities. Return JSON." },
          { inlineData: { mimeType: 'application/pdf', data: fileBase64 } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pos: { type: Type.STRING },
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                sourceRef: { type: Type.STRING }
              }
            }
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                justification: { type: Type.STRING },
                sourceRef: { type: Type.STRING },
                suggestedQuery: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    items: data.items.map((i: any, idx: number) => ({ ...i, id: `item-${idx}`, status: 'extracted' })),
    risks: data.risks.map((r: any, idx: number) => ({ ...r, id: `risk-${idx}` }))
  };
};

// Mock fallback for development if PDF is too large or API unavailable
export const getMockAnalysis = (): { items: LVItem[], risks: RiskAnalysis[] } => {
  return {
    items: [
      { id: '1', pos: '01.01.0010', description: 'Gipskartonständerwand, d=100mm, doppelt beplankt', quantity: 450.50, unit: 'm²', sourceRef: 'LV S. 14', status: 'extracted' },
      { id: '2', pos: '01.01.0020', description: 'Gipskartonständerwand, d=125mm, doppelt beplankt', quantity: 120.00, unit: 'm²', sourceRef: 'LV S. 16', status: 'extracted' },
      { id: '3', pos: '01.02.0010', description: 'Türzarge Stahl, für Türblatt 875/2125mm', quantity: 12, unit: 'Stk', sourceRef: 'LV S. 18', status: 'extracted' }
    ],
    risks: [
      {
        id: 'r1',
        type: 'QuantityMismatch',
        description: 'Mengenabweichung Wandflächen',
        justification: 'In Plan Grundriss OG1 sind 480m² Wandfläche gemessen, LV weist nur 450.5m² aus.',
        sourceRef: 'Plan 01-OG, LV S. 14',
        suggestedQuery: 'Wir haben im Plan 01-OG ca. 480m² Wandfläche ermittelt. Können Sie die LV-Menge von 450,5m² bestätigen?'
      }
    ]
  };
};
