const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String }, 
  email:    { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, 
  tickets:  { type: Array, default: [] }
});

module.exports = mongoose.model('User', UserSchema);