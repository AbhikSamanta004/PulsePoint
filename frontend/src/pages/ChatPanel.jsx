import React, { useEffect, useState, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ChatPanel = () => {
    const navigate = useNavigate()
    const { appointmentId } = useParams()
    const { backendUrl, token, userData } = useContext(AppContext)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [receiverId, setReceiverId] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [otherTyping, setOtherTyping] = useState(false)
    const socket = useRef()
    const chatContainerRef = useRef()
    const isFirstRender = useRef(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch appointment to get docId
                const appRes = await axios.post(`${backendUrl}/api/user/get-appointment`, { appointmentId }, { headers: { token } })
                if (appRes.data.success) {
                    setReceiverId(appRes.data.appointment.docId)
                }

                const { data } = await axios.get(`${backendUrl}/api/chat/history/${appointmentId}`, { headers: { token } })
                if (data.success) {
                    setMessages(data.history)
                }
            } catch (error) {
                console.error(error)
            }
        }

        socket.current = io(backendUrl)
        socket.current.emit('join-chat', { roomId: appointmentId, userId: userData?._id })

        socket.current.on('receive-message', (msg) => {
            console.log("Socket received message:", msg);
            if (!msg || !msg._id) {
                console.warn("Received malformed message:", msg);
                return;
            }
            setMessages((prev) => {
                const exists = prev.find(m => m?._id === msg._id);
                if (exists) {
                    console.log("Message already exists in state, skipping.");
                    return prev;
                }
                console.log("Adding new message to state.");
                return [...prev, msg]
            })
        })

        socket.current.on('typing', ({ userId, isTyping }) => {
            if (userId !== userData?._id) {
                setOtherTyping(isTyping)
            }
        })

        fetchHistory()

        return () => {
            if (socket.current) {
                socket.current.disconnect()
            }
        }
    }, [appointmentId, userData?._id])

    useEffect(() => {
        if (messages.length > 0 && chatContainerRef.current) {
            const container = chatContainerRef.current
            if (isFirstRender.current) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'instant' })
                isFirstRender.current = false
            } else {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
            }
        }
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            // We need docId as receiverId. In a real app, you'd get this from the appointment object.
            // For now, let's assume we fetch it or it's provided.
            const { data } = await axios.post(`${backendUrl}/api/chat/send`, {
                appointmentId,
                message: newMessage,
                receiverId: receiverId // Should be handled better
            }, { headers: { token } })

            if (data.success) {
                const sentMsg = data.chatMessage
                if (sentMsg) {
                    console.log("API Sent message:", sentMsg);
                    setMessages((prev) => [...prev, sentMsg])
                    if (socket.current) {
                        socket.current.emit('send-message', {
                            roomId: appointmentId,
                            ...sentMsg
                        })
                    }
                }
                setNewMessage('')
                if (socket.current) {
                    socket.current.emit('typing', { roomId: appointmentId, userId: userData?._id, isTyping: false })
                }
            }
        } catch (error) {
            toast.error('Failed to send message')
        }
    }

    const handleTyping = (e) => {
        setNewMessage(e.target.value)
        if (!isTyping) {
            setIsTyping(true)
            socket.current.emit('typing', { roomId: appointmentId, userId: userData?._id, isTyping: true })
            setTimeout(() => {
                setIsTyping(false)
                socket.current.emit('typing', { roomId: appointmentId, userId: userData?._id, isTyping: false })
            }, 3000)
        }
    }

    return (
        <div className="flex flex-col h-[80vh] bg-white border rounded-lg overflow-hidden mt-5 max-w-2xl mx-auto shadow-lg">
            <div className="p-4 bg-primary text-white font-bold flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="hover:bg-black/10 p-1.5 rounded-full transition-all flex items-center justify-center -ml-1"
                        title="Go Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <span>Chat with Doctor</span>
                </div>
                {otherTyping && <span className="text-xs italic opacity-80">Doctor is typing...</span>}
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => {
                    if (!msg) return null;
                    return (
                        <div key={idx} className={`flex ${msg.senderId === userData?._id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === userData?._id ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                {msg.message}
                                <div className={`text-[10px] mt-1 opacity-60 ${msg.senderId === userData?._id ? 'text-right' : 'text-left'}`}>
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <button type="submit" className="bg-primary text-white p-2 px-5 rounded-full hover:bg-primary-dark transition-all">
                    Send
                </button>
            </form>
        </div>
    )
}

export default ChatPanel
