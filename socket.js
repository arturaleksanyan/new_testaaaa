const TokenManager = require('./managers/token-manager');
const AppError = require('./managers/app-error');
const MessagesCtrl = require('./controllers/messages.ctrl');

module.exports = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    const users = new Map();

    io.use(async (client, next) => {
        if (client.handshake.auth.token) {
            try {
                const decoded = await TokenManager.decode(client.handshake.auth.token);
                if (decoded.userId) {
                    client.userId = decoded.userId;
                    next();
                } else {
                    new AppError('Auth error', 401);
                }
            } catch (e) {
                new AppError('Token not provided', 401);
            }
        } else {
            throw new AppError('Token not provided', 401);
        }
    }).on('connection', (client) => {
        users.set(client.userId, client);
        client.on('disconnect', () => {
            users.delete(client.userId);
        });
        client.on('messages', async (data) => {
            const message = await MessagesCtrl.getMessages({
                userId: client.userId,
                to: data.to
            });
            client.emit('messages', message);
        });
        client.on('new message', async (data) => {
            const message = await MessagesCtrl.send({
                userId: client.userId,
                to: data.to,
                value: data.value
            });
            if (users.has(data.to)) {
                const receiver = users.get(data.to);
                receiver.emit('new message', message);
            }
        });
    });
}
