const videoSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-video', ({ roomId, userId }) => {
            socket.join(roomId)
            console.log(`User ${userId} joined video room ${roomId}`)
            socket.to(roomId).emit('user-joined', { userId })
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

        socket.on('disconnecting', () => {
            const rooms = Array.from(socket.rooms)
            rooms.forEach(room => {
                if (room.startsWith('room_')) {
                    socket.to(room).emit('user-left')
                }
            })
        })
    })
}

export default videoSocket
