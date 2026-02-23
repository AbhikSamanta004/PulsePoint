const chatSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-chat', ({ roomId, userId }) => {
            socket.join(roomId)
            console.log(`User ${userId} joined chat room ${roomId}`)
        })

        socket.on('send-message', (data) => {
            io.to(data.roomId).emit('receive-message', data)
        })

        socket.on('typing', ({ roomId, userId, isTyping }) => {
            socket.to(roomId).emit('typing', { userId, isTyping })
        })
    })
}

export default chatSocket
