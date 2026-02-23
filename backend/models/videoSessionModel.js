import mongoose from 'mongoose'

const videoSessionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
    roomId: { type: String, required: true, unique: true },
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Active', 'Ended'], default: 'Scheduled' },
    startTime: { type: Date },
    endTime: { type: Date }
}, { timestamps: true })

const videoSessionModel = mongoose.models.videoSession || mongoose.model('videoSession', videoSessionSchema)
export default videoSessionModel
