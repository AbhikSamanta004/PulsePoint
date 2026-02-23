const videoSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-video', ({ roomId, userId }) => {
            socket.join(roomId)
            console.log(`User ${userId} joined video room ${roomId}`)
            socket.to(roomId).emit('user-joined', { userId })
        })

        socket.on('offer', (data) => {
            const { roomId } = data
            socket.to(roomId).emit('offer', data)
        })

        socket.on('answer', (data) => {
            const { roomId } = data
            socket.to(roomId).emit('answer', data)
        })

        socket.on('request-offer', ({ roomId }) => {
            socket.to(roomId).emit('request-offer')
        })

        socket.on('ice-candidate', (data) => {
            const { roomId } = data
            socket.to(roomId).emit('ice-candidate', data)
        })
    })
}

export default videoSocket
