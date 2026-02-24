import { GoogleGenerativeAI } from "@google/generative-ai";

const checkSymptomsService = async (symptoms) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an AI medical assistant.
Analyze the patient's symptoms and respond ONLY in the following JSON format:

{
"possibleIssue": "",
"recommendedDepartment": "",
"recommendedSpecialist": "",
"urgencyLevel": "",
"suggestedAction": ""
}

Symptoms: ${symptoms}

Do not provide explanation outside JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean the response in case Gemini includes markdown code blocks
        const cleanedText = responseText.replace(/```json|```/gi, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze symptoms through AI component.");
    }
};

export default checkSymptomsService;
