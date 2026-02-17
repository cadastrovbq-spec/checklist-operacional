
import { GoogleGenAI } from "@google/genai";
import { ChecklistRecord, Sector, Task } from "./types";

export const getManagerInsight = async (record: ChecklistRecord, sector: Sector, tasks: Task[]) => {
  // Initialize GoogleGenAI right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const completedCount = record.completedTasks.length;
  const totalCount = tasks.length;
  const prompt = `
    Analise o seguinte checklist de ${record.type} para o setor ${sector.name}:
    - Tarefas concluídas: ${completedCount}/${totalCount}
    - Observações: ${record.notes || 'Nenhuma'}
    - Problemas relatados: ${record.problemReport || 'Nenhum'}
    
    Como um gerente sênior de operações, forneça uma análise rápida (máximo 100 palavras) sobre a conformidade operacional deste turno e se há alguma ação urgente necessária.
    Responda em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Use the .text property directly as per @google/genai guidelines
    return response.text || "Sem insights disponíveis no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar insights no momento.";
  }
};
