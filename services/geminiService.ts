import { GoogleGenAI } from "@google/genai";
import { VerificationReport, GroundingSource } from '../types';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const verifyMedicinePackage = async (imageFiles: File[]): Promise<{ report: VerificationReport, sources: GroundingSource[] }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

    const prompt = `Actúa como un experto en verificación farmacéutica para Colombia. Analiza las siguientes imágenes del empaque de un medicamento. He proporcionado varias fotos para mostrar todos los lados y detalles. Tu tarea es consolidar la información de todas las imágenes para generar un informe de verificación completo. Utiliza la herramienta de búsqueda de Google para realizar las siguientes verificaciones, y basa tus respuestas EXCLUSIVAMENTE en los resultados de la búsqueda en tiempo real:

1.  **Registro INVIMA:** Busca el número de registro sanitario que encuentres en el empaque directamente en la página de consulta pública de registros sanitarios del INVIMA. Confirma si el producto, titular, y fabricante coinciden con la información oficial.
2.  **Código de Barras:** Verifica el número del código de barras para confirmar si corresponde a un producto comercializado en Colombia y si coincide con el medicamento en cuestión.
3.  **Análisis Visual Comparativo:** Busca imágenes del mismo medicamento en las tiendas virtuales de droguerías de cadena reconocidas en Colombia (como Farmatodo, Cruz Verde, Drogas La Rebaja). Compara los colores, la tipografía, la calidad de impresión y la disposición de los elementos del empaque en las fotos proporcionadas con las imágenes de referencia encontradas.

Basado en este análisis, genera un informe de verificación completo. Responde ÚNICAMENTE con un objeto JSON. No incluyas \`\`\`json, ni ningún otro texto, explicación o introducción fuera del objeto JSON. El schema del JSON es el siguiente:
{
  "invimaRegistration": {
    "number": "string (Número de registro INVIMA extraído)",
    "status": "string (Enum: VERIFIED, NOT_FOUND, SUSPICIOUS)",
    "notes": "string (Observaciones sobre el registro INVIMA)"
  },
  "barcode": {
    "number": "string (Número del código de barras extraído)",
    "status": "string (Enum: VERIFIED, NOT_FOUND, SUSPICIOUS)",
    "notes": "string (Observaciones sobre el código de barras y su comercialización en Colombia)"
  },
  "visualAuthenticity": {
    "colors": {
      "status": "string (Enum: AUTHENTIC, SUSPICIOUS, UNABLE_TO_VERIFY)",
      "notes": "string (Análisis de los colores del empaque)"
    },
    "typography": {
      "status": "string (Enum: AUTHENTIC, SUSPICIOUS, UNABLE_TO_VERIFY)",
      "notes": "string (Análisis de las fuentes y letras del empaque)"
    },
    "printQuality": {
      "status": "string (Enum: AUTHENTIC, SUSPICIOUS, UNABLE_TO_VERIFY)",
      "notes": "string (Análisis de la tinta y calidad de impresión)"
    }
  },
  "overallAssessment": {
    "status": "string (Enum: AUTHENTIC, POTENTIALLY_COUNTERFEIT, INCONCLUSIVE)",
    "summary": "string (Resumen ejecutivo del análisis completo)"
  }
}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    ...imageParts,
                ]
            },
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        let text = response.text.trim();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            text = jsonMatch[1];
        }

        const reportData = JSON.parse(text);
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .filter((chunk: any) => chunk.web && chunk.web.uri)
            .map((chunk: any) => chunk as GroundingSource);

        return { report: reportData as VerificationReport, sources };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get verification report from the AI model.");
    }
};