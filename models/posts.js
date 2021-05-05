const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectId} = Schema.Types;

const Posts = new Schema({
    title: String,
    desc: String,
    author: {type: ObjectId, ref: 'Users'}
}, {versionKey: false, timestamps: true});

module.exports = mongoose.model('Posts', Posts);
