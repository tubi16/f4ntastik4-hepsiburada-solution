import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API Key from environment variables (Expo public env)
// If EXPO_PUBLIC_GEMINI_API_KEY is missing at build time (common in Docker without args),
// we fall back to a specific placeholder that we will replace at runtime via entrypoint.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "GEMINI_API_KEY_PLACEHOLDER";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeDeliveryPhoto(base64Image: string): Promise<{ valid: boolean; reason: string }> {
    try {
        if (!API_KEY) {
            console.warn("Gemini API Key is missing.");
            // For prototype purposes, if no key is present, we might want to fail or mock success.
            // Here we fail safely.
            return { valid: false, reason: "API Anahtarı eksik. Lütfen geliştirici ile iletişime geçin." };
        }


        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



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
            return { valid: false, reason: "Yapay zeka yanıtı anlaşılamadı." };
        }

    } catch (error) {
        console.error("Gemini Analysis Error:", JSON.stringify(error, null, 2));
        return { valid: false, reason: "Analiz sırasında teknik bir hata oluştu." };
    }
}
