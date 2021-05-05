const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const path = require('path');
const {Types} = require('mongoose');
const fs = require('fs');
const User = require('../models/users');
const responseManager = require('../middlewares/response-handler');
const validationResult = require('../middlewares/validation-result');
const validateToken = require('../middlewares/validate-token');
const UsersCtrl = require('../controllers/users.ctrl');
const {body} = require('express-validator');

const usersJsonPath = path.join(__homedir, './users.json');

router.route('/').get(
    responseManager,
    validateToken,
    async (req, res) => {
        try {
            const users = await UsersCtrl.getAll({
                name: req.query.name,
                userId: req.decoded.userId
            });
            res.onSuccess(users);
        } catch (e) {
            res.onError(e);
        }
    }
).post(
    upload.single('image'),
    body('name').exists().bail().isLength({min: 6}),
    body('password').exists().bail().isLength({min: 6}).custom(value => {
        return new RegExp("^[A-Z0-9.,/ $@()]+$").test(value);
    }),
    responseManager,
    validationResult,
    async (req, res) => {
        try {
            let userdata = await UsersCtrl.add({
                name: req.body.name,
                username: req.body.username,
                file: req.file,
                password: req.body.password
            });
            userdata = userdata.toObject();
            delete userdata.password;
            res.onSuccess(userdata);
        } catch (e) {
            await fs.unlink(path.join(__homedir, req.file.path));
            res.onError(e);
        }
    }
);

router.route('/current').get(
    responseManager,
    validateToken,
    async (req, res) => {
        try {
            const user = await UsersCtrl.getById(req.decoded.userId);
            res.onSuccess(user);
        } catch (e) {
            res.onError(e);
        }

    }
).put(
    responseManager,
    validateToken,
    body('name').exists(),
    body('email').isEmail(),
    async (req, res) => {
        try {
            const updatedData = await UsersCtrl.update({
                name: req.body.name,
                email: req.body.email,
                image: req.file ? req.file.filename : undefined,
                userId: req.decoded.userId
            });
            res.onSuccess(updatedData);
        } catch (e) {
            if (req.file && req.file.path) {
                await fs.promises.unlink(path.join(__homedir, req.file.path));
            }
            res.onError(e);
        }
    }
)


router.route('/friends').get(
    responseManager,
    validateToken,
    async (req, res) => {
        try {
            const friends = await UsersCtrl.getFriends({
                userId: req.decoded.userId
            })
            res.onSuccess(friends);
        } catch (e) {
            res.onError(e);
        }
    }
);

router.route('/friend-request').post(
    responseManager,
    body('to').exists(),
    validateToken,
    async (req, res) => {
        try {
            await UsersCtrl.friendRequest({
                from: req.decoded.userId,
                to: req.body.to
            });
            res.onSuccess();
        } catch (e) {
            res.onError(e);
        }
    }
).get(
    responseManager,
    validateToken,
    async (req, res) => {
        try {
            res.onSuccess(
                await UsersCtrl.getFriendRequests({
                    userId: req.decoded.userId
                })
            );
        } catch (e) {
            res.onError(e);
        }
    }
).put(
    responseManager,
    body('to').exists(),
    validateToken,
    async (req, res) => {
        try {
            await UsersCtrl.acceptFriendRequest({
                userId: req.decoded.userId,
                to: req.body.to
            });
            res.onSuccess();
        } catch (e) {
            res.onError(e);
        }
    }
).delete(
    responseManager,
    body('to').exists(),
    validateToken,
    async (req, res) => {
        try {
            await UsersCtrl.declineFriendRequest({
                userId: req.decoded.userId,
                to: req.body.to
            });
            res.onSuccess();
        } catch (e) {
            res.onError(e);
        }
    }
);

router.route('/:id').get(async (req, res) => {
    // Types.ObjectId.isValid(req.params.id);
    const user = await User.findOne({_id: req.params.id});

    if (user) {
        res.json({
            success: true,
            data: user
        });
    } else {
        res.json({
            success: false,
            data: null,
            message: 'User not fond'
        });
    }
}).put(upload.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // await User.findOneAndUpdate({_id: req.params.id}, {
        //     name: req.body.name,
        //     image: req.file.path
        // });
        if (user) {
            await fs.unlink(path.join(__homedir, user.image));
            user.name = req.body.name;
            user.image = req.file.path;
            await user.save();
            res.json({
                success: true,
                data: user,
                message: 'user updated'
            });
        } else {
            throw new Error('User not found');
        }
    } catch (e) {
        await fs.unlink(path.join(__homedir, req.file.path));
        res.json({
            success: false,
            data: null,
            message: e.message
        });
    }
}).delete(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.remove();
            await fs.unlink(path.join(__homedir, user.image));
            res.json({
                success: true
            });
        } else {
            throw new Error('User Not Found');
        }
    } catch (e) {
        res.json({
            success: false,
            data: null,
            message: e.message
        });
    }
});

module.exports = router;
