const express = require('express');
const fs = require('fs');
const path = require('path');
const responseHandler = require('../middlewares/response-handler');
const validationResult = require('../middlewares/validation-result');
const AuthCtrl = require('../controllers/auth.ctrl');
const upload = require('../middlewares/upload');
const {query} = require('express-validator');
const {body} = require('express-validator');
const router = express.Router();


router.post('/login',
    body('username').exists(),
    body('password').exists(),
    responseHandler,
    validationResult,
    async (req, res) => {
        try {
            const token = await AuthCtrl.login({
                ...req.body
            });
            res.onSuccess(token);
        } catch (e) {
            res.onError(e);
        }
    }
);

router.post('/forgot-password',
    body('email').isEmail(),
    responseHandler,
    validationResult,
    async (req, res) => {
        try {
            await AuthCtrl.forgotPassword({
                email: req.body.email
            });
            res.onSuccess({}, 'Email sent');
        } catch (e) {
            res.onError(e);
        }
    }
);

router.get('/activate',
    query('code').exists(),
    responseHandler,
    validationResult,
    async (req, res) => {
        try {
            await AuthCtrl.activate(req.query.code);
            res.onSuccess();
        } catch (e) {
            res.onError(e);
        }
    }
);

router.post('/reset-password',
    query('code').exists(),
    body('password').exists(),
    responseHandler,
    validationResult,
    async (req, res) => {
        try {
            await AuthCtrl.resetPassword({
                code: req.query.code,
                password: req.body.password
            });
            res.onSuccess({}, 'Password have been changed');
        } catch (e) {
            res.onError(e);
        }
    }
);

router.post('/register',
    upload.single('image'),
    body('name').exists().bail().isLength({min: 6}),
    body('password').exists().bail().isLength({min: 6}).custom(value => {
        return new RegExp("^[A-Z0-9.,/ $@()]+$").test(value);
    }),
    responseHandler,
    validationResult,
    async (req, res) => {
        try {
            let userdata = await AuthCtrl.register({
                email: req.body.email,
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

module.exports = router;
