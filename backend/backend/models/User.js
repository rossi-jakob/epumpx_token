const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    tgID: { type: String, default: "1" },
    publicKey: {type: String, default: "0x00000000000000000000000000000000"},
    privateKey: {type: String, default: "0x00000000000000000000000000000000"},
}, { timestamps: true });

module.exports = User = mongoose.model('User', UserSchema);