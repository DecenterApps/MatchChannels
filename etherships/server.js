const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 60000;

const userList = {};

io.on('connection', async (socket) => {

    socket.on('user-joined', async (user) => {
        userList[socket] = user;
    });

    socket.on('get-users', async () => {
        socket.broadcast.emit('user-list', userList);
    });

    socket.on('disconnect', async () => {
        delete userList[socket];
    });

});

http.listen(PORT, () => {
    console.log('listening on *:60000');
  });