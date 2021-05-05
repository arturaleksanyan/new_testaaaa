const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequest = new Schema({
    from: {type: Schema.Types.ObjectId, ref: 'Users'},
    to: {type: Schema.Types.ObjectId, ref: 'Users'}
}, {versionKey: false, timestamps: true});

module.exports = mongoose.model('FriendRequest', FriendRequest);
