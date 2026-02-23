import React, { useEffect, useState, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ChatPanel = () => {
    const { appointmentId } = useParams()
    const { backendUrl, dToken, profileData, getProfileData } = useContext(DoctorContext)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [receiverId, setReceiverId] = useState('')
    const [otherTyping, setOtherTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const socket = useRef()
    const scrollRef = useRef()

    useEffect(() => {
        if (!profileData) {
            getProfileData()
        }
    }, [])

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch appointment details to get userId
                const appRes = await axios.post(`${backendUrl}/api/doctor/get-appointment`, { appointmentId }, { headers: { dtoken: dToken } })
                if (appRes.data.success) {
                    setReceiverId(appRes.data.appointment.userId)
                }

                const { data } = await axios.get(`${backendUrl}/api/chat/history/${appointmentId}`, { headers: { dtoken: dToken } })
                if (data.success) {
                    setMessages(data.history)
                }
            } catch (error) {
                console.error(error)
            }
        }

        if (profileData) {
            socket.current = io(backendUrl)
            socket.current.emit('join-chat', { roomId: appointmentId, userId: profileData?._id })

            socket.current.on('receive-message', (msg) => {
                setMessages((prev) => [...prev, msg])
            })

            socket.current.on('typing', ({ userId, isTyping }) => {
                if (userId !== profileData?._id) {
                    setOtherTyping(isTyping)
                }
            })

            fetchHistory()
        }

        return () => socket.current?.disconnect()
    }, [appointmentId, profileData])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            const { data } = await axios.post(`${backendUrl}/api/chat/send`, {
                appointmentId,
                message: newMessage,
                receiverId
            }, { headers: { dtoken: dToken } })

            if (data.success) {
                socket.current.emit('send-message', {
                    roomId: appointmentId,
                    message: newMessage,
                    senderId: profileData?._id,
                    senderName: profileData?.name,
                    receiverId
                })
                setNewMessage('')
                socket.current.emit('typing', { roomId: appointmentId, userId: profileData?._id, isTyping: false })
            }
        } catch (error) {
            toast.error('Failed to send message')
        }
    }

    const handleTyping = (e) => {
        setNewMessage(e.target.value)
        if (!isTyping) {
            setIsTyping(true)
            socket.current.emit('typing', { roomId: appointmentId, userId: profileData?._id, isTyping: true })
            setTimeout(() => {
                setIsTyping(false)
                socket.current.emit('typing', { roomId: appointmentId, userId: profileData?._id, isTyping: false })
            }, 3000)
        }
    }

    return (
        <div className="flex flex-col h-[85vh] bg-white border rounded-lg overflow-hidden m-5 w-full shadow-lg">
            <div className="p-4 bg-primary text-white font-bold flex justify-between items-center">
                <span>Chat with Patient</span>
                {otherTyping && <span className="text-xs italic animate-pulse">Patient is typing...</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.senderId === profileData?._id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm shadow-sm ${msg.senderId === profileData?._id ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                            {msg.message}
                            <div className={`text-[10px] mt-1 opacity-60 ${msg.senderId === profileData?._id ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                />
                <button type="submit" className="bg-primary text-white p-3 px-8 rounded-full hover:bg-opacity-90 transition-all font-medium">
                    Send
                </button>
            </form>
        </div>
    )
}

export default ChatPanel
