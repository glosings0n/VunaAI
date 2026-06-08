import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../constants/translations";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export interface AnalysisResult {
  isPlant?: boolean;
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

export async function analyzeCropPhoto(base64Image: string, mimeType: string, language: Language = 'fr'): Promise<AnalysisResult> {
  const model = "gemini-3.5-flash";

  const languageInstructions = {
    fr: `
      Tu DOIS rédiger absolument TOUTES tes réponses, analyses et recommandations (champs: commonName, description, biologicalTreatment, chemicalTreatment, preventionTips et tous les sous-champs de spacingAdvice) exclusivement en FRANÇAIS.
      Le champ 'commonName' doit contenir le nom de la plante et de la maladie/stress en français (avec son nom vernaculaire local si applicable).
    `,
    en: `
      You MUST write absolutely ALL your replies, analyses, and recommendations (fields: commonName, description, biologicalTreatment, chemicalTreatment, preventionTips, and all sub-fields of spacingAdvice) exclusively in ENGLISH.
      The field 'commonName' should contain the name of the plant and the disease/stress in English (with any local vernacular name if applicable).
    `,
    sw: `
      LAZIMA uandike kabisa majibu yako yote, uchambuzi, na mapendekezo (nyanja za: commonName, description, biologicalTreatment, chemicalTreatment, preventionTips, na nyanja zote ndogo za spacingAdvice) pekee kwa lugha ya KISWAHILI.
      Uwanja wa 'commonName' unapaswa kuwa na jina la mmea na ugonjwa/shida kwa Kiswahili (pamoja na jina la kienyeji ikiwa linafaa).
    `
  }[language] || `
      Tu DOIS rédiger en français.
  `;

  const prompt = `
    Tu es un expert agronome de référence panafricaine (Afrique de l'Ouest, Centrale, Est, Sud et Maghreb).
    
    LANGUE DU RAPPORT :
    ${languageInstructions}

    Tu as une tâche critique avant toute chose : détermine si la photo fournie montre RÉELLEMENT une plante, une feuille, un fruit, une culture ou un élément d'agriculture végétale.
    
    RÈGLES DE VALIDATION DE L'IMAGE :
    - Si l'image ne montre pas de plante, de culture, de feuille ou de fruit (par exemple, si elle montre des humains, des animaux sans plante, des voitures, des bâtiments, des assiettes de nourriture préparée ou d'autres objets du quotidien qui ne sont pas des plantes ou cultures sur pied/récoltées), tu DOIS ABSOLUMENT définir "isPlant" à false.
    - Si l'image montre une plante, une feuille, un fruit ou une culture agricole, définis "isPlant" à true.
    
    Si "isPlant" est faux :
    Tu ne dois pas inventer ni halluciner de maladie. Définis simplement "isPlant" à false et remplis les autres champs requis avec des valeurs vides ou minimales facultatives (ex: "commonName" : "Non applicable", "description" : "L'image ne contient pas de plante.", etc.).
    
    Si "isPlant" est vrai :
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
    - isPlant: boolean (true si c'est une plante/culture/feuille/fruit, false sinon).
    - commonName: Nom de la plante + maladie/stress.
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
            isPlant: { type: Type.BOOLEAN },
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
          required: ["isPlant", "commonName", "description", "severity", "biologicalTreatment", "chemicalTreatment", "preventionTips", "spacingAdvice"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as AnalysisResult;
    
    if (result.isPlant === false) {
      if (language === 'sw') {
        throw new Error("Picha iliyopakiwa haionekani kuwa mmea, jani, au tunda. VunaAI imeundwa maalum kwa ajili ya kuchambua mazao na magonjwa yao pekee.");
      } else if (language === 'en') {
        throw new Error("The uploaded image does not appear to be a plant, leaf, or fruit. VunaAI is exclusively designed for analyzing crops and their diseases.");
      } else {
        throw new Error("L'image fournie ne semble pas être une plante, une feuille ou un fruit. VunaAI est uniquement destiné à l'analyse des cultures et de leurs maladies.");
      }
    }

    return result;
  } catch (error: any) {
    console.log("Info: Handled analysis message:", error.message || error);
    if (error.message && (
      error.message.includes("VunaAI") || 
      error.message.includes("exclusively designed") || 
      error.message.includes("imeundwa maalum")
    )) {
      throw error;
    }
    throw new Error(
      language === 'sw' 
        ? "Imeshindikana kuchambua picha. Tafadhali jaribu tena kwa picha iliyo wazi."
        : language === 'en'
        ? "Impossible to analyze current image. Please try again with a clearer photo."
        : "Impossible d'analyser l'image. Veuillez réessayer avec une photo plus claire."
    );
  }
}
