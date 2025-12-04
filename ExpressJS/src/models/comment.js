const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    content: { type: String, default: '' },
}, { timestamps: true });

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
