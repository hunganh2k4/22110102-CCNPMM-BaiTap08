const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }] // added favorites
});

const User = mongoose.model('user', userSchema);

module.exports = User;