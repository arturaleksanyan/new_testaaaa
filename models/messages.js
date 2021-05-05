const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    from: {type: Schema.Types.ObjectId, ref: 'Users'},
    to: {type: Schema.Types.ObjectId, ref: 'Users'},
    value: String
}, {timestamps: true, versionKey: false});

module.exports = mongoose.model('Messages', messagesSchema);
