import videoSessionModel from "../models/videoSessionModel.js"
import appointmentModel from "../models/appointmentModel.js"

const createSession = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const { userId, docId } = req.body // From auth middlewares

        const appointment = await appointmentModel.findById(appointmentId)

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // Validate Online Mode
        if (appointment.appointmentMode !== 'Online') {
            return res.json({ success: false, message: 'This appointment is for Physical Visit. Video consultation not available.' })
        }

        // Validate ownership
        if (appointment.userId !== userId && appointment.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized' })
        }

        // Validate payment
        if (!appointment.payment) {
            return res.json({ success: false, message: 'Payment not completed' })
        }

        // Check if session already exists
        let session = await videoSessionModel.findOne({ appointmentId })

        if (!session) {
            // Generate a unique room ID
            const roomId = `room_${appointmentId}_${Math.random().toString(36).substr(2, 9)}`

            session = new videoSessionModel({
                appointmentId,
                roomId,
                doctorId: appointment.docId,
                patientId: appointment.userId,
                status: 'Scheduled'
            })
            await session.save()
        }

        res.json({ success: true, session })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const endSession = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const { docId } = req.body

        const session = await videoSessionModel.findOne({ appointmentId })
        if (!session) {
            return res.json({ success: false, message: 'Session not found' })
        }

        if (session.doctorId !== docId) {
            return res.json({ success: false, message: 'Unauthorized' })
        }

        session.status = 'Ended'
        session.endTime = new Date()
        await session.save()

        // Update appointment status to completed
        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

        res.json({ success: true, message: 'Session ended and appointment completed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { createSession, endSession }
