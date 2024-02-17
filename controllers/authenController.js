const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')

const login = async (req, res) => {
  try {
    const { username, password, registerType, channelId } = req.body
    if (registerType === 'WEB') {
      // Check if username exists
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' })
      }

      // Check if password is correct
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' })
      }

      // Generate access token
      const accessToken = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          displayName: user.displayName,
          picture: user.picture,
          role: user.role,
        },
        config.accessSecretKey,
        {
          expiresIn: '15m',
        }
      )

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user._id },
        config.refreshSecretKey,
        { expiresIn: '7d' }
      )

      return res.json({ accessToken, refreshToken })
    } else if (registerType === 'LINE') {
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' })
      }
      if (channelId !== '2003424448') {
        return res.status(401).json({ message: 'Invalid channelId' })
      }
      // Generate access token
      const accessToken = jwt.sign(
        { userId: user._id },
        config.accessSecretKey,
        {
          expiresIn: '15m',
        }
      )

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user._id },
        config.refreshSecretKey,
        { expiresIn: '7d' }
      )

      return res.json({ accessToken, refreshToken })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { login }
