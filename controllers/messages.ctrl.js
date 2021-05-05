const User = require('../models/users');
const Messages = require('../models/messages');
const FriendRequest = require('../models/friend-request');
const Bcrypt = require('../managers/bcrypt');
const AppError = require('../managers/app-error');
const TokenManager = require('../managers/token-manager');

class MessagesCtrl {
    async send(data) {
        const {userId, to, value} = data;

        const [sender, receiver] = await Promise.all([
            User.findById(userId),
            User.findById(to)
        ]);

        if (sender && receiver) {
            return new Messages({
                from: sender._id,
                to: receiver._id,
                value
            }).save();
        }
        throw new AppError('User not found', 404);
    }

    async getMessages(data) {
        const {userId, to} = data;
        const [sender, receiver] = await Promise.all([
            User.findById(userId),
            User.findById(to)
        ]);

        if (sender && receiver) {
            return Messages.find({
                from: {$in: [sender._id, receiver._id]},
                to: {$in: [sender._id, receiver._id]}
            }).sort({createdAt: -1});
        }
        throw new AppError('User not found', 404);
    }
}

module.exports = new MessagesCtrl();
