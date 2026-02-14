
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateJournalPrompt = async (name: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, deeply reflective journaling prompt for ${name}. Focus on mindfulness or personal growth.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 60,
      }
    });
    return response.text?.trim() || "What's one thing that felt meaningful today?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Reflect on a moment today that made you feel present.";
  }
};

export const analyzeEntry = async (content: string): Promise<{ mood: string; insight: string }> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this journal entry. Provide a 1-word mood and a one-sentence mindful insight.\n\nEntry: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING, description: "A single word representing the primary emotion." },
            insight: { type: Type.STRING, description: "A brief, encouraging mindful reflection." }
          },
          required: ["mood", "insight"]
        }
      }
    });
    
    return JSON.parse(response.text || '{"mood": "Reflective", "insight": "Your thoughts are a bridge to your inner peace."}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { mood: "Thoughtful", insight: "Every word you write helps clarify your path." };
  }
};

// --- Live API Helpers for Voice Transcription ---

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function createAudioBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeAudio(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const connectTranscriptionSession = (callbacks: {
  onTranscription: (text: string) => void;
  onClose: () => void;
  onError: (err: any) => void;
}) => {
  const ai = getAIClient();
  
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onmessage: async (message) => {
        if (message.serverContent?.inputTranscription) {
          callbacks.onTranscription(message.serverContent.inputTranscription.text);
        }
        // Handle audio output if necessary, though we just want transcription here
      },
      onclose: callbacks.onClose,
      onerror: callbacks.onError,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      systemInstruction: "You are a silent transcription assistant. Transcribe the user's spoken journal entry exactly as said. Do not respond to them or provide any spoken output. Only provide the transcription in the metadata.",
    }
  });
};
