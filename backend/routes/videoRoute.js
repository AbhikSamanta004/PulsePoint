import express from 'express'
import { createSession, endSession } from '../controllers/videoController.js'
import authUser from '../middlewares/authUser.js'
import authDoctor from '../middlewares/authDoctor.js'

const videoRouter = express.Router()

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

videoRouter.post('/create-session', authAny, createSession)
videoRouter.post('/end-session', authDoctor, endSession)

export default videoRouter
