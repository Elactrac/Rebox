const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * Analyzes an image of packaging using Google Gemini 2.0 Flash.
 * @param {string} base64Image - The base64 encoded image string (including data URI prefix).
 * @returns {Promise<Object>} - The analysis result.
 */
async function analyzePackagingImage(base64Image) {
    try {
        // Check if API key is configured
        if (!genAI) {
            throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.");
        }

        // Gemini 2.0 Flash is currently experimental or falls back to 1.5-flash if 2.0 is not available.
        // Using 'gemini-2.0-flash-exp' as requested, with fallback mental model that user might need 'gemini-1.5-flash'
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // Clean base64 string if it has prefix
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

        // Convert to format Gemini accepts (inline data)
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg", // Assuming JPEG, but Gemini is flexible. Could parse from prefix if needed.
            },
        };

        const prompt = "Analyze this image of packaging material. Return a JSON object with the following fields: 'type' (e.g., Box, Bottle, Can), 'material' (e.g., Cardboard, Plastic, Metal), 'condition' (e.g., New, Good, Fair), 'estimatedSize' (e.g., Small, Medium, Large), and 'estimatedWeightInKg' (number, e.g., 0.5). Do not include markdown formatting, just the raw JSON.";

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Response:", text);

        // Attempt to parse JSON from the response
        try {
            // Remove any potential markdown code blocks
            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return { error: "Could not parse analysis results" };
        }

    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw new Error("Failed to analyze image with Gemini");
    }
}

module.exports = { analyzePackagingImage };
