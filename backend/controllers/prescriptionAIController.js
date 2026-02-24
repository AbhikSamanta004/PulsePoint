import { GoogleGenerativeAI } from "@google/generative-ai";

const explainPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        // Convert the file buffer to Base64
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are a medical assistant AI.
Extract the medicine details from this PRINTED prescription image.
You MUST provide a clear "usageExplanation" for every medicine identified.

CRITICAL: Translate all medical shorthand and abbreviations into simple, human-readable plain English.
Examples:
- "Q6H" -> "Every 6 hours"
- "PRN" -> "As needed"
- "OD" -> "Once a day"
- "BID" -> "Twice a day"
- "TID" -> "Three times a day"
- "PO" / "Oral" -> "By mouth"
etc.

Respond ONLY in the following JSON format:

{
"medicines": [
{
"medicineName": "",
"dosage": "",
"timing": "",
"usageExplanation": ""
}
]
}

Rules:
- Ensure "dosage", "timing", and "usageExplanation" are written in clear, simple English that a patient can easily understand.
- Do not add explanation outside JSON.
- Do not add markdown.
- Do not add headings.
- Output valid parsable JSON only.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();

        // Clean markdown backticks if present
        const cleanedText = responseText.replace(/```json|```/gi, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("JSON Parse Error:", cleanedText);
            return res.json({ success: false, message: "Failed to parse AI response" });
        }

        res.json({ success: true, medicines: parsedData.medicines || [] });

    } catch (error) {
        console.error("Prescription AI Error:", error);
        res.json({ success: false, message: error.message || "Failed to analyze prescription" });
    }
};

export { explainPrescription };
