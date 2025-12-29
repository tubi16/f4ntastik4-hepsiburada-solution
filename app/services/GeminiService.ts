import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API Key from environment variables (Expo public env)
// Access API Key from environment variables (Expo public env)
// If EXPO_PUBLIC_GEMINI_API_KEY is missing at build time (common in Docker without args),
// we fall back to a specific placeholder that we will replace at runtime via entrypoint.
const ENV_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_KEY = (ENV_KEY && ENV_KEY.length > 0) ? ENV_KEY : "GEMINI_API_KEY_PLACEHOLDER";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeDeliveryPhoto(base64Image: string): Promise<{ valid: boolean; reason: string }> {
    try {
        if (API_KEY === "GEMINI_API_KEY_PLACEHOLDER") {
            console.warn("Gemini API Key is still PLACEHOLDER.");
            return { valid: false, reason: "Sistem Hatası: API Anahtarı değiştirilemedi (PLACEHOLDER)." };
        }
        if (!API_KEY) {
            console.warn("Gemini API Key is empty.");
            return { valid: false, reason: "Sistem Hatası: API Anahtarı boş (Environment Variable eksik)." };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
      You are a delivery verification assistant. 
      Analyze this image. 
      Strict Rules for Validity:
      1. visible_package: The image MUST contain a cardboard box, shipping bag, or parcel.
      2. visible_address_number: The image MUST contain a visible door number, apartment number, or building number plate.
      
      Return a JSON object with this structure:
      {
        "valid": boolean,
        "reason": "Short explanation in Turkish."
      }
      
      If valid is false, the reason should explain what is missing (e.g., "Paket görünüyor ancak kapı numarası okunmuyor" or "Görüntüde kargo paketi yok").
      Response must be ONLY valid JSON.
    `;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const json = JSON.parse(cleanText);
            return {
                valid: json.valid,
                reason: json.reason || "Bilinmeyen bir hata oluştu."
            };
        } catch (e) {
            console.error("JSON Parse Error", e);
            console.error("Raw Text:", text);
            return { valid: false, reason: "Yapay zeka yanıtı anlaşılamadı." };
        }

    } catch (error) {
        console.error("Gemini Analysis Error Full Details:", JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error("Error Message:", error.message);
        }
        return { valid: false, reason: "Analiz sırasında teknik bir hata oluştu. Konsol loglarını kontrol edin." };
    }
}
