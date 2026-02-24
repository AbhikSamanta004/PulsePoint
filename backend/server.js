import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import videoRouter from './routes/videoRoute.js'
import chatRouter from './routes/chatRoute.js'
import aiRouter from './routes/aiRoutes.js'
import prescriptionAIRouter from './routes/prescriptionAIRoutes.js'
import http from 'http'
import { Server } from 'socket.io'
import videoSocket from './socket/videoSocket.js'
import chatSocket from './socket/chatSocket.js'

// app config

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Initialize Sockets
videoSocket(io)
chatSocket(io)


// middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

// api endpoint

app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/video', videoRouter)
app.use('/api/chat', chatRouter)
app.use('/api/ai', aiRouter)
app.use('/api/ai', prescriptionAIRouter)


app.get('/', (req, res) => {
  res.send("Api worrkingggg")
})

server.listen(port, () => {
  console.log("Server Started", port)
})