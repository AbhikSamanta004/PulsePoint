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
                        { urls: 'stun:global.stun.twilio.com:3478' },
                        // TURN servers for NAT traversal (Cross-device connections)
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ],
                    iceTransportPolicy: 'all',
                    iceCandidatePoolSize: 10
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
        <div className="flex-1 flex flex-col h-[85vh] m-5 bg-zinc-950 rounded-2xl overflow-hidden relative shadow-2xl border border-zinc-800">
            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center bg-[#09090b] overflow-hidden">
                {remoteStream ? (
                    <video
                        playsInline
                        ref={userVideo}
                        autoPlay
                        className="w-full h-full object-contain relative z-10 transition-opacity duration-700 shadow-2xl"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary rounded-full animate-ping" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-medium text-white">{status}</p>
                            <p className="text-sm text-zinc-400 mt-1">
                                {status === 'Camera Error'
                                    ? 'Please check your hardware and permissions'
                                    : 'Preparing your secure consultation room...'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Status & Timer Overlay */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/90 text-sm font-medium">Session Active</span>
                    </div>
                </div>
            </div>

            {/* Self Video (PIP) */}
            <div className="absolute top-6 right-6 w-48 aspect-video bg-zinc-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-10 transition-transform hover:scale-105">
                {stream ? (
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                        <span className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">My Video</span>
                    </div>
                )}
            </div>

            {/* Glass Control Bar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-5 px-6 py-3 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-20">
                <button
                    onClick={toggleMute}
                    className={`group flex flex-col items-center gap-1 transition-all ${isMuted ? 'text-red-400' : 'text-zinc-400 hover:text-white'}`}
                >
                    <div className={`p-3 rounded-xl transition-all ${isMuted ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        {isMuted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                    onClick={toggleVideo}
                    className={`group flex flex-col items-center gap-1 transition-all ${isVideoOff ? 'text-red-400' : 'text-zinc-400 hover:text-white'}`}
                >
                    <div className={`p-3 rounded-xl transition-all ${isVideoOff ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        {isVideoOff ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{isVideoOff ? 'Video On' : 'Video Off'}</span>
                </button>

                <div className="w-[1px] h-8 bg-white/10 mx-1" />

                <button
                    onClick={leaveCall}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-900/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                    <span className="text-sm">End</span>
                </button>

                {(callAccepted && !callEnded) && (
                    <div className="flex flex-col items-center ml-2 pl-4 border-l border-white/10 min-w-[60px]">
                        <span className="text-white font-mono text-sm tracking-widest leading-none">{formatTime(timer)}</span>
                        <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-tighter mt-1">Live</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VideoCall
