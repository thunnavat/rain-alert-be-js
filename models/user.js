const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true 
  },
  lineId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: false,
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
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER'],
    default: 'USER',
    required: true,
  },
  resetLink:{
    type: String,
    default: ''
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
