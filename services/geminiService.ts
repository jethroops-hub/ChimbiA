import { GoogleGenAI, Type } from "@google/genai";
import { VerificationReport } from '../types';

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

const verificationSchema = {
    type: Type.OBJECT,
    properties: {
        invimaRegistration: {
            type: Type.OBJECT,
            properties: {
                number: { type: Type.STRING, description: "Número de registro INVIMA extraído." },
                status: { type: Type.STRING, description: "Estado de la verificación: VERIFIED, NOT_FOUND, SUSPICIOUS." },
                notes: { type: Type.STRING, description: "Observaciones sobre el registro INVIMA." }
            },
             required: ["number", "status", "notes"]
        },
        barcode: {
            type: Type.OBJECT,
            properties: {
                number: { type: Type.STRING, description: "Número del código de barras extraído." },
                status: { type: Type.STRING, description: "Estado de la verificación: VERIFIED, NOT_FOUND, SUSPICIOUS." },
                notes: { type: Type.STRING, description: "Observaciones sobre el código de barras y su comercialización en Colombia." }
            },
            required: ["number", "status", "notes"]
        },
        visualAuthenticity: {
            type: Type.OBJECT,
            properties: {
                colors: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, description: "Estado de los colores: AUTHENTIC, SUSPICIOUS, UNABLE_TO_VERIFY." },
                        notes: { type: Type.STRING, description: "Análisis de los colores del empaque." }
                    },
                    required: ["status", "notes"]
                },
                typography: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, description: "Estado de la tipografía: AUTHENTIC, SUSPICIOUS, UNABLE_TO_VERIFY." },
                        notes: { type: Type.STRING, description: "Análisis de las fuentes y letras del empaque." }
                    },
                     required: ["status", "notes"]
                },
                printQuality: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING, description: "Estado de la calidad de impresión: AUTHENTIC, SUSPICIOUS, UNABLE_TO_VERIFY." },
                        notes: { type: Type.STRING, description: "Análisis de la tinta y calidad de impresión." }
                    },
                     required: ["status", "notes"]
                }
            },
             required: ["colors", "typography", "printQuality"]
        },
        overallAssessment: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, description: "Evaluación general: AUTHENTIC, POTENTIALLY_COUNTERFEIT, INCONCLUSIVE." },
                summary: { type: Type.STRING, description: "Resumen ejecutivo del análisis completo." }
            },
            required: ["status", "summary"]
        }
    },
    required: ["invimaRegistration", "barcode", "visualAuthenticity", "overallAssessment"]
};


export const verifyMedicinePackage = async (imageFiles: File[]): Promise<VerificationReport> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

    const prompt = `Actúa como un experto en verificación farmacéutica para Colombia. Analiza las siguientes imágenes del empaque de un medicamento. He proporcionado varias fotos para mostrar todos los lados y detalles. Tu tarea es consolidar la información de todas las imágenes para generar un informe de verificación completo. Usa tu conocimiento y capacidades de búsqueda web para verificar la información contra registros públicos como el INVIMA y bases de datos de códigos de barras. Evalúa los aspectos visuales comparándolos con empaques auténticos comercializados en puntos autorizados en Colombia. Responde únicamente con el objeto JSON estructurado según el schema proporcionado. No incluyas \`\`\`json ni ningún otro texto fuera del JSON.`;
    
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
                responseMimeType: "application/json",
                responseSchema: verificationSchema,
            }
        });

        const text = response.text.trim();
        const reportData = JSON.parse(text);
        
        return reportData as VerificationReport;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get verification report from the AI model.");
    }
};