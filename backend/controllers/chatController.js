import chatModel from "../models/chatModel.js"
import appointmentModel from "../models/appointmentModel.js"

const sendMessage = async (req, res) => {
    try {
        const { appointmentId, message, receiverId } = req.body
        const { userId, docId } = req.body // One of these will be sender

        const senderId = userId || docId

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        if (!appointment.payment) {
            return res.json({ success: false, message: 'Chat is locked until payment is successful' })
        }

        const newChatMessage = new chatModel({
            appointmentId,
            senderId,
            receiverId,
            message
        })

        await newChatMessage.save()
        res.json({ success: true, message: 'Message sent' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getChatHistory = async (req, res) => {
    try {
        const { appointmentId } = req.params
        const { userId, docId } = req.body

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Security check
        if (appointment.userId !== userId && appointment.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized access to chat' })
        }

        const history = await chatModel.find({ appointmentId }).sort({ timestamp: 1 })
        res.json({ success: true, history })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { sendMessage, getChatHistory }
