const nodemailer = require('nodemailer');
const config = require('../configs/email');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.user,
        pass: config.pass
    },
});

const email = async (to, subject, html) => {
    await transporter.sendMail({
        from: '"Sunny School" <'+config.user+'>',
        to: to,
        subject: subject,
        html: html
    });
};

module.exports = email;
