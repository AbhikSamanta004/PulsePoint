const videoSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-video', ({ roomId, userId }) => {
            socket.join(roomId)
            console.log(`User ${userId} joined video room ${roomId}`)

            // Get all current users in the room
            const clients = io.sockets.adapter.rooms.get(roomId);

            // Notify others that a new user joined
            socket.to(roomId).emit('user-joined', { userId })

            // If there's already another user, notify the newcomer as well
            if (clients && clients.size > 1) {
                console.log(`Room ${roomId} is ready for call`)
                socket.emit('user-joined', { userId: 'existing_user' })
            }
        })

        socket.on('signal', (data) => {
            const { roomId, signal } = data
            console.log(`Relaying signal for room ${roomId}`)
            socket.to(roomId).emit('signal', { signal })
        })

        socket.on('disconnecting', () => {
            const rooms = Array.from(socket.rooms)
            rooms.forEach(room => {
                if (room.startsWith('room_')) {
                    console.log(`User left room: ${room}`)
                    socket.to(room).emit('user-left')
                }
            })
        })
    })
}

export default videoSocket
