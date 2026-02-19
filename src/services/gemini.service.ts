import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { environment } from '../environments/environment';

export interface Diagnosis {
  possibleCauses: {
    cause: string;
    likelihood: string;
    details: string;
  }[];
  recommendedSolutions: {
    solution: string;
    requiredParts: string[];
    steps: string[];
  }[];
  safetyWarnings: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly apiKey = process.env.API_KEY;

  constructor() {
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.error('API_KEY environment variable not set.');
    }
  }

  async diagnoseBoilerProblem(problemDescription: string): Promise<Diagnosis> {
    if (!this.ai) {
      throw new Error('Gemini AI client is not initialized. Check API Key.');
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert HVAC and boiler repair diagnostician.
      Your task is to analyze a user-described problem and provide a structured JSON response.
      The response must detail possible causes, recommended solutions with steps, and critical safety warnings.
      Be thorough, accurate, and prioritize safety. The user is a trained technician.`;
      
    const schema = {
      type: Type.OBJECT,
      properties: {
        possibleCauses: {
          type: Type.ARRAY,
          description: 'A list of potential causes for the described problem.',
          items: {
            type: Type.OBJECT,
            properties: {
              cause: { type: Type.STRING, description: 'The name of the potential cause (e.g., "Faulty Thermocouple").' },
              likelihood: { type: Type.STRING, description: 'Estimated likelihood (e.g., "High", "Medium", "Low").' },
              details: { type: Type.STRING, description: 'A brief explanation of why this might be the cause.'}
            },
             propertyOrdering: ["cause", "likelihood", "details"],
          },
        },
        recommendedSolutions: {
          type: Type.ARRAY,
          description: 'Step-by-step solutions to address the potential causes.',
          items: {
            type: Type.OBJECT,
            properties: {
              solution: { type: Type.STRING, description: 'The name of the solution (e.g., "Replace Thermocouple").' },
              requiredParts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of parts needed for this solution.' },
              steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A numbered list of steps to perform the repair.' },
            },
            propertyOrdering: ["solution", "requiredParts", "steps"],
          },
        },
        safetyWarnings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Critical safety warnings relevant to the diagnosis and repair process.',
        },
      },
      propertyOrdering: ["possibleCauses", "recommendedSolutions", "safetyWarnings"],
    };

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: model,
        contents: `Diagnose the following boiler problem: "${problemDescription}"`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.5,
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as Diagnosis;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get a diagnosis from the AI. Please check the console for details.');
    }
  }
}
