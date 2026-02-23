import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    messageType: { type: String, default: 'text' },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

const chatModel = mongoose.models.chat || mongoose.model('chat', chatSchema)
export default chatModel
