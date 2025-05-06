const mongoose = require('mongoose');
const ChatSchema = new mongoose.Schema({
  timestamp: { type: String, default: Date.now() },
  address: {type: String, default: null},
  tokenAddress: {type: String, default: null},
  filePath: {type: String, default: null},
  comment: {type: String, default: null},
}, { timestamps: true });

module.exports = Chat = mongoose.model('Chat', ChatSchema);
