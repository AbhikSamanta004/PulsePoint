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
                    initSocket(data.session.roomId)
                } else {
                    toast.error(data.message)
                    navigate('/doctor-appointments')
                }
            } catch (error) {
                console.error(error)
                toast.error('Failed to load session')
            }
        }

        const initSocket = (rId) => {
            socket.current = io(backendUrl)

            socket.current.on('connect', () => {
                setStatus('Connected')
                socket.current.emit('join-video', { roomId: rId, userId: profileData?._id })
            })

            socket.current.on('user-joined', () => {
                setStatus('Patient Joined')
                // Doctor initiates the call
                callUser(rId)
            })

            socket.current.on('request-offer', () => {
                console.log('Patient requested offer, starting call...')
                setStatus('Patient Ready')
                callUser(rId)
            })

            socket.current.on('answer', ({ sdp }) => {
                console.log('Received answer')
                setCallAccepted(true)
                connectionRef.current.signal(sdp)
            })
        }

        const callUser = (rId) => {
            if (!stream) {
                console.log("Stream not ready for callUser, retrying in 1s...")
                setTimeout(() => callUser(rId), 1000)
                return
            }
            console.log('Doctor initiating call to patient...')
            try {
                const peer = new Peer({
                    initiator: true,
                    trickle: false,
                    stream: stream,
                    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] }
                })

                peer.on('signal', (data) => {
                    console.log('Doctor sending offer', data)
                    socket.current.emit('offer', { roomId: rId, sdp: data })
                })

                peer.on('stream', (remoteStream) => {
                    console.log('Doctor received remote stream')
                    setRemoteStream(remoteStream)
                })

                peer.on('connect', () => {
                    console.log('Peer connected!')
                    setCallAccepted(true)
                })

                peer.on('error', (err) => {
                    console.error('Peer error:', err)
                    toast.error("Video connection error")
                })

                connectionRef.current = peer
            } catch (err) {
                console.error("Peer creation failed:", err)
            }
        }

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream)
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream
            }
        }).catch(err => {
            console.error("Camera access denied:", err)
            setStatus('Camera Error')
            if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                toast.error("Camera is already in use by another tab or app. Please close other tabs.")
            } else {
                toast.error("Please allow camera access to start video consultation")
            }
        })

        fetchSession()

        return () => {
            if (socket.current) socket.current.disconnect()
            if (stream) stream.getTracks().forEach(track => track.stop())
        }
    }, [profileData])

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
