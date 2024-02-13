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
  type: {
    type: String,
    enum: ['LINE', 'WEB'], // กำหนดให้ type เป็นค่าเฉพาะ 'line' หรือ 'web'
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
