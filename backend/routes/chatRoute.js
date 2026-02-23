import express from 'express'
import { sendMessage, getChatHistory } from '../controllers/chatController.js'
import authUser from '../middlewares/authUser.js'
import authDoctor from '../middlewares/authDoctor.js'

const chatRouter = express.Router()

const authAny = async (req, res, next) => {
    const { token, dtoken } = req.headers
    if (token) {
        return authUser(req, res, next)
    } else if (dtoken) {
        return authDoctor(req, res, next)
    } else {
        return res.json({ success: false, message: 'Not Authorized' })
    }
}

chatRouter.post('/send', authAny, sendMessage)
chatRouter.get('/history/:appointmentId', authAny, getChatHistory)

export default chatRouter
