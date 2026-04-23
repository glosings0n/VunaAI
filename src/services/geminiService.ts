import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AnalysisResult {
  commonName: string;
  scientificName?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  biologicalTreatment: string;
  chemicalTreatment: string;
  preventionTips: string[];
  spacingAdvice?: {
    optimalSpacing: string;
    description: string;
    climateFactors: string;
    soilTypeFactors: string;
  };
}

export async function analyzeCropPhoto(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Tu es un expert agronome de référence panafricaine (Afrique de l'Ouest, Centrale, Est, Sud et Maghreb).
    Analyse cette photo de culture et identifie toute maladie, ravageur ou stress.
    
    Ton expertise couvre tous les climats du continent (sahéliens, tropicaux, équatoriaux, méditerranéens).
    Bien que tu sois un expert panafricain, ton focus principal reste l'appui aux petits exploitants d'Afrique de l'Ouest.
    Prends en compte les cultures majeures du continent (Mil, Sorgho, Manioc, Maïs, Cacao, Café, Banane Plantain, Palmier à huile, Maraîchage, Thé, Canne à sucre).
    
    Propose des solutions concrètes :
    1. Méthodes agroécologiques et biopesticides à base de flore locale (Neem, Papaye, Piment, Ail, Tabac).
    2. Conseils de gestion de l'eau adaptés au climat (paillage, zaï, demi-lunes si zone aride).
    3. Traitements chimiques homologués en dernier recours.
    4. Conseils d'espacement des plants (spacingAdvice) pour la culture identifiée.
    
    Réponds en JSON avec :
    - commonName: Nom (Français + nom vernaculaire courant).
    - scientificName: Nom latin.
    - description: Analyse adaptée aux conditions climatiques locales.
    - severity: low/medium/high/critical.
    - biologicalTreatment: Protocole bio détaillé.
    - chemicalTreatment: Protocole chimique sécurisé.
    - preventionTips: 3 conseils de résilience climatique.
    - spacingAdvice: Objet contenant :
        - optimalSpacing: Distance recommandée (ex: 30cm x 50cm).
        - description: Pourquoi cet espacement est important pour cette culture.
        - climateFactors: Impact du climat (pluie, humidité) sur l'espacement.
        - soilTypeFactors: Impact du type de sol sur l'espacement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commonName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
            biologicalTreatment: { type: Type.STRING },
            chemicalTreatment: { type: Type.STRING },
            preventionTips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            spacingAdvice: {
              type: Type.OBJECT,
              properties: {
                optimalSpacing: { type: Type.STRING },
                description: { type: Type.STRING },
                climateFactors: { type: Type.STRING },
                soilTypeFactors: { type: Type.STRING }
              },
              required: ["optimalSpacing", "description", "climateFactors", "soilTypeFactors"]
            }
          },
          required: ["commonName", "description", "severity", "biologicalTreatment", "chemicalTreatment", "preventionTips", "spacingAdvice"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing crop photo:", error);
    throw new Error("Impossible d'analyser l'image. Veuillez réessayer avec une photo plus claire.");
  }
}
