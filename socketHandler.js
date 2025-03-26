const { Server } = require("socket.io");

module.exports = function setupSocket(server) {
    const io = new Server(server);
    global.io = io;
    io.on('connection', (socket) => {   
        console.log('New user connected');

        socket.on('join-room', (roomName) => {
            socket.join(roomName);
            console.log(`User joined room: ${roomName}`);
        });

        socket.on('user-message', ({ room, message }) => {
            
            if (room && message) {
                console.log(`Message in ${room}: ${message}`);
                io.to(room).emit('message', message); 
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};
