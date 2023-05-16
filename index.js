var socketIO = require('socket.io');

var io = new socketIO(9000, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

var users = [];

var addUser = function(userData, socketId) {
    if (!users.some(function(user) { return user.sub === userData.sub; })) {
        users.push(Object.assign({}, userData, { socketId: socketId }));
    }
};

var removeUser = function(socketId) {
    users = users.filter(function(user) { return user.socketId !== socketId; });
};

var getUser = function(userId) {
    return users.find(function(user) { return user.sub === userId; });
};

io.on('connection', function(socket) {
    console.log('user connected');

    socket.on("addUser", function(userData) {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
    });

    socket.on('sendMessage', function(data) {
        var user = getUser(data.receiverId);
        io.to(user.socketId).emit('getMessage', data);
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

module.exports = io;
