const express = require('express');
const router = express.Router();
const Posts = require('../models/posts');
const Users = require('../models/users');
const {body, check} = require('express-validator');
const {ObjectId} = require('mongoose').Types;
const ResponseManager = require('../managers/response-manager');
const AppError = require('../managers/app-error');
const validationResult = require('../middlewares/validation-result');
const responseHandler = require('../middlewares/response-handler');
const validateToken = require('../middlewares/validate-token');

router.route('/').get(async (req, res) => {
    const posts = await Posts.find().populate({
        path: 'author',
        select: '-_id name username'
    });
    res.json(posts);
}).post(
    responseHandler,
    validateToken,
    check('title', 'titley chka').exists(),
    validationResult,
    async (req, res) => {
        try {
            console.log(req.decoded);
            res.onSuccess({}, 'Post created');
        } catch (e) {
            res.onError(e);
        }
    });

router.route('/:id').get((req, res) => {
    console.log(req.params);
    res.end('Method GET');
}).delete((req, res) => {
    //deleteFromDataBase(req.params.id);
    res.end('Method Delete');
});

module.exports = router;
