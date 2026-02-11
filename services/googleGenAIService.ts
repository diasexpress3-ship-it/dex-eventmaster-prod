
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEventContent = async (type: 'bride' | 'groom' | 'buffet' | 'history', details: string): Promise<string> => {
  try {
    const prompt = `Gere um texto sofisticado e emocionante em português para um site de casamento de luxo.
    Tipo: ${type === 'bride' ? 'Biografia da Noiva' : type === 'groom' ? 'Biografia do Noivo' : type === 'buffet' ? 'Descrição do Buffet' : 'Capítulo da História'}.
    Contexto: ${details}.
    O tom deve ser elegante, romântico e profissional (Elite).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um redator de eventos de luxo da Digital Excellence Studio. Escreva textos curtos, impactantes e magnéticos.",
        temperature: 0.7,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Erro na geração de IA:", error);
    return "Erro ao gerar conteúdo. Tente novamente.";
  }
};

export const analyzeImage = async (imageUrl: string): Promise<string> => {
  // Mantendo a estrutura para futuras implementações de análise visual
  return `Análise de imagem indisponível no momento.`;
};
