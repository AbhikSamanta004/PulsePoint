import checkSymptomsService from "../services/symptomCheckerService.js";
import aiModel from "../models/aiModel.js";
import doctorModel from "../models/doctorModel.js";

const checkSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body;
        const { userId } = req.body; // userId is attached by authUser middleware

        if (!symptoms) {
            return res.json({ success: false, message: "Symptoms are required" });
        }

        const aiResponse = await checkSymptomsService(symptoms);

        // Suggest available doctors matching the recommended specialist
        const suggestedDoctors = await doctorModel.find({
            speciality: aiResponse.recommendedSpecialist,
            available: true
        }).select('-password -email').limit(3);

        // Save entry to database
        const newRecord = new aiModel({
            userId,
            symptoms,
            aiResponse
        });
        await newRecord.save();

        res.json({ success: true, aiResponse, suggestedDoctors });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const history = await aiModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, history });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { checkSymptoms, getHistory };
