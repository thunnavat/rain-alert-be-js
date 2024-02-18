const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
  registerType: {
    type: String,
    enum: ['LINE', 'WEB'], 
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER'], 
    default:'USER',
    required: true
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
