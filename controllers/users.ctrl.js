const User = require('../models/users');
const FriendRequest = require('../models/friend-request');
const Bcrypt = require('../managers/bcrypt');
const AppError = require('../managers/app-error');
const TokenManager = require('../managers/token-manager');
const fs = require('fs');
const path = require('path');

class UsersCtrl {
    getById(id) {
        return User.findById(id);
    }

    findOne(options) {
        return User.findOne(options);
    }

    async getAll(data) {
        const options = {
            $and: []
        };
        options.$and.push({_id: {$ne: data.userId}});
        const limit = {};
        if (data.name) {
            options.$and.push({name: new RegExp(data.name, 'i')});
        }

        if (data.limit) {
            limit.limit = Number(data.limit);
        }

        return User.find(options, null, limit);
    }

    async add(data) {
        if (await User.exists({username: data.username})) {
            throw new Error('USER exists');
        } else {
            const hash = await Bcrypt.hash(data.password);

            const user = new User({
                email: data.email,
                name: data.name,
                image: data.file ? data.file.path : undefined,
                password: hash
            });
            user.username = data.username;

            return user.save();
        }
    }

    async update(data) {
        const {userId, name, image, email} = data;
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not exists', 404);
        }
        if (image) {
            if (user.image) {
                await fs.promises.unlink(path.join(__homedir, 'uploads', user.image));
            }
            user.image = image;
        }
        user.email = email;
        user.name = name;
        return user.save();
    }

    delete() {

    }

    async friendRequest(data) {
        const {from, to} = data;
        const [user, toUser] = await Promise.all([
            User.findById(from),
            User.findById(to)
        ]);

        if (!toUser || !user || from === to) {
            throw new AppError('User not found', 404);
        }
        if (user.sentFriendRequests.includes(to) ||
            user.friends.includes(to) ||
            user.friendRequests.includes(to)) {
            throw new AppError('Bad request', 403);
        }
        user.sentFriendRequests.push(to);
        toUser.friendRequests.push(from);

        return Promise.all([user.save(), toUser.save()]);
    }

    async getFriendRequests(data) {
        const {userId} = data;
        const user = await User.findById(userId).populate('friendRequests', '_id name').lean();

        return user.friendRequests;
    }

    async acceptFriendRequest(data) {
        const {userId, to} = data;
        const [user, toUser] = await Promise.all([
            User.findById(userId),
            User.findById(to)
        ]);

        if (!toUser || !user) {
            throw new AppError('User not found', 404);
        }
        if (user.friendRequests.includes(to) &&
            !user.friends.includes(to)) {

            user.friends.push(to);
            toUser.friends.push(userId);

            user.friendRequests.pull(to);
            toUser.sentFriendRequests.pull(userId);

            return Promise.all([user.save(), toUser.save()]);
        }
        throw new AppError('Bad request', 403);
    }

    async declineFriendRequest(data) {
        const {userId, to} = data;
        const [user, toUser] = await Promise.all([
            User.findById(userId),
            User.findById(to)
        ]);

        if (!toUser || !user) {
            throw new AppError('User not found', 404);
        }
        if (user.friendRequests.includes(to) &&
            !user.friends.includes(to)) {

            user.friendRequests.pull(to);
            toUser.sentFriendRequests.pull(userId);

            return Promise.all([user.save(), toUser.save()]);
        }
        throw new AppError('Bad request', 403);
    }

    async getFriends(data) {
        const {userId} = data;
        const user = await User.findById(userId).populate('friends', '_id name image').lean();
        if (!user) {
            throw new AppError('User Not Found', 404);
        }

        return user.friends;
    }
}

module.exports = new UsersCtrl();
