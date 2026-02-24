import mongoose from "mongoose";

const aiSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    symptoms: { type: String, required: true },
    aiResponse: {
        possibleIssue: { type: String, required: true },
        recommendedDepartment: { type: String, required: true },
        recommendedSpecialist: { type: String, required: true },
        urgencyLevel: { type: String, required: true },
        suggestedAction: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

const aiModel = mongoose.models.ai || mongoose.model('ai', aiSchema);

export default aiModel;
