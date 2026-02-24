import React, { useEffect, useRef, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const VideoCall = () => {
    const { appointmentId } = useParams()
    const { backendUrl, dToken, profileData, getProfileData } = useContext(DoctorContext)
    const navigate = useNavigate()

    const [stream, setStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [receivingCall, setReceivingCall] = useState(false)
    const [callerSignal, setCallerSignal] = useState(null)
    const [callAccepted, setCallAccepted] = useState(false)
    const [callEnded, setCallEnded] = useState(false)
    const [status, setStatus] = useState('Connecting...')
    const [timer, setTimer] = useState(0)
    const [roomId, setRoomId] = useState('')
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)

    const myVideo = useRef()
    const userVideo = useRef()
    const connectionRef = useRef()
    const socket = useRef()
    const streamRef = useRef(null)
    const statusRef = useRef('Connecting...')
    const signalBuffer = useRef([])

    useEffect(() => {
        if (!profileData) {
            getProfileData()
        }
    }, [])

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data } = await axios.post(`${backendUrl}/api/video/create-session`, { appointmentId }, { headers: { dtoken: dToken } })
                if (data.success) {
                    setRoomId(data.session.roomId)
                } else {
                    toast.error(data.message)
                    navigate('/doctor-appointments')
                }
            } catch (error) {
                console.error(error)
                toast.error('Failed to load session')
            }
        }

        const getMedia = async () => {
            try {
                const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setStream(currentStream)
                streamRef.current = currentStream
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream
                }
            } catch (err) {
                console.error("Camera access denied:", err)
                setStatus('Camera Error')
                statusRef.current = 'Camera Error'
                toast.error("Please allow camera/mic access to start consultation")
            }
        }

        fetchSession()
        getMedia()

        return () => {
            if (socket.current) socket.current.disconnect()
        }
    }, [])

    useEffect(() => {
        if (!roomId || !profileData) return

        socket.current = io(backendUrl)

        socket.current.on('connect', () => {
            console.log('Admin socket connected, joining room:', roomId)
            setStatus('Ready for Session')
            socket.current.emit('join-video', { roomId, userId: profileData._id })
        })

        socket.current.on('user-joined', () => {
            console.log('Patient joined the room')
            setStatus('Patient Online')
            callUser(roomId)
        })

        socket.current.on('signal', ({ signal }) => {
            console.log('Received signal:', signal.type || 'candidate')

            if (connectionRef.current && !connectionRef.current.destroyed) {
                connectionRef.current.signal(signal)
            } else {
                console.log('Buffering signal...')
                signalBuffer.current.push(signal)
            }
        })

        socket.current.on('user-left', () => {
            console.log('Patient left the room')
            toast.info("Patient has left the call")
            leaveCall()
        })

        return () => {
            if (socket.current) socket.current.disconnect()
        }
    }, [roomId, profileData])

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop()
                    track.enabled = false
                })
            }
        }
    }, [stream])

    const callUser = (rId) => {
        if (!streamRef.current) {
            if (statusRef.current === 'Camera Error') {
                console.log("Stopping retries: Camera access denied.")
                return
            }
            console.log("Stream not ready for callUser, retrying in 1s...")
            setTimeout(() => callUser(rId), 1000)
            return
        }
        if (connectionRef.current) return // Already initiated

        console.log('Doctor initiating peer connection...')
        setStatus('Negotiating Secure Channel...')

        try {
            const peer = new Peer({
                initiator: true,
                trickle: true,
                stream: streamRef.current,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        { urls: 'stun:stun3.l.google.com:19302' },
                        { urls: 'stun:stun4.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ],
                    iceTransportPolicy: 'all'
                }
            })

            peer.on('signal', (data) => {
                console.log('Sending signal to patient:', data.type || 'candidate')
                socket.current.emit('signal', { roomId: rId, signal: data })
            })

            peer.on('stream', (remoteStream) => {
                console.log('Doctor received remote stream')
                setRemoteStream(remoteStream)
                setStatus('Secure Connection Established')
                setCallAccepted(true)
            })

            peer.on('connect', () => {
                console.log('WebRTC Peer connected!')
                setStatus('In Call')
            })

            peer.on('error', (err) => {
                console.error('Peer connection error:', err)
                setStatus('Connection Failed')
            })

            connectionRef.current = peer

            // Vital: Process Buffered Signals
            while (signalBuffer.current.length > 0) {
                const signal = signalBuffer.current.shift()
                console.log('Applying buffered signal:', signal.type || 'candidate')
                peer.signal(signal)
            }
        } catch (err) {
            console.error("Peer creation failed:", err)
        }
    }

    useEffect(() => {
        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream
        }
    }, [stream])

    useEffect(() => {
        if (remoteStream && userVideo.current) {
            userVideo.current.srcObject = remoteStream
        }
    }, [remoteStream])

    useEffect(() => {
        let interval
        if (callAccepted && !callEnded) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [callAccepted, callEnded])

    const leaveCall = async () => {
        setCallEnded(true)
        if (connectionRef.current) connectionRef.current.destroy()
        await axios.post(`${backendUrl}/api/video/end-session`, { appointmentId }, { headers: { dtoken: dToken } })
        navigate('/doctor-appointments')
    }

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = isMuted
            setIsMuted(!isMuted)
        }
    }

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = isVideoOff
            setIsVideoOff(!isVideoOff)
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="flex flex-col h-[85vh] bg-black rounded-lg overflow-hidden m-5 w-full relative">
            <div className="flex-1 flex items-center justify-center">
                {remoteStream ? (
                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-contain" />
                ) : (
                    <div className="text-white text-center">
                        <p className="text-xl font-semibold">{status}</p>
                        {status === 'Camera Error' ? (
                            <p className="text-sm text-red-400 mt-2">Could not access camera. Is it being used by another tab?</p>
                        ) : (
                            <p className="text-sm opacity-60 mt-2">Waiting for patient to join...</p>
                        )}
                    </div>
                )}
            </div>

            <div className="absolute bottom-10 right-10 w-48 h-36 bg-zinc-800 rounded-lg overflow-hidden border-2 border-primary">
                {stream && <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />}
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-4">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition-all`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? "🔇" : "🎙️"}
                </button>
                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition-all`}
                    title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                    {isVideoOff ? "📵" : "📷"}
                </button>
                <button onClick={leaveCall} className="bg-red-600 text-white px-8 py-2 rounded-full font-medium hover:bg-red-700 transition-all">
                    End Consultation
                </button>
            </div>

            {(callAccepted && !callEnded) && (
                <div className="absolute top-5 right-5 bg-black/50 text-white px-4 py-1 rounded-full font-mono text-sm">
                    {formatTime(timer)}
                </div>
            )}
        </div>
    )
}

export default VideoCall
