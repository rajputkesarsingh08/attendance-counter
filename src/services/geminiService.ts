import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface Subject {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  isMinor: boolean;
}

export async function parseTimetable(input: string | File): Promise<Subject[]> {
  const model = "gemini-3-flash-preview";
  
  let prompt = "Extract a list of unique subjects from this student timetable. Return them as a JSON array of objects with 'name' property. ";
  
  let contents: any;
  if (typeof input === 'string') {
    contents = input;
  } else {
    // Handle PDF file
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(input);
    });
    const base64 = await base64Promise;
    contents = {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "application/pdf", data: base64 } }
      ]
    };
  }

  const response = await ai.models.generateContent({
    model,
    contents: typeof input === 'string' ? prompt + input : contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING }
          },
          required: ["name"]
        }
      }
    }
  });

  try {
    const rawSubjects = JSON.parse(response.text || "[]");
    return rawSubjects.map((s: any, index: number) => ({
      id: `subject-${index}-${Date.now()}`,
      name: s.name,
      priority: 'medium',
      isMinor: false
    }));
  } catch (e) {
    console.error("Failed to parse subjects", e);
    return [];
  }
}
