const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')

const register = async (req, res) => {
  try {
    const { username, password, displayName, picture, registerType, role } =
      req.body
    if (registerType === 'WEB') {
      // Check if username already exists
      const user = await User.findOne
      if (user) {
        return res.status(400).json({ message: 'Username already exists' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create new user
      const newUser = new User({
        username,
        password: hashedPassword,
        registerType,
        role,
      })

      // Save user to database
      await newUser.save()

      return res.status(201).json({ message: 'User created' })
    } else if (registerType === 'LINE') {
      const user = await User.findOne({ username: username })
      if (user) {
        user.displayName = displayName
        user.picture = picture

        await user.save()
      } else {
        const newUser = new User({
          username,
          displayName,
          picture,
          registerType,
          role,
        })

        await newUser.save()
        return res.status(200).json({ message: 'User updated' })
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.refreshSecretKey)

    // Create new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      config.accessSecretKey,
      { expiresIn: '15m' }
    )

    // Send new access token
    res.json({ accessToken })
  } catch (error) {
    console.error(error)
    return res.status(403).json({ message: 'Invalid refresh token' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { displayName, picture, districtSubscribe } = req.body
    const userId = req.query.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    user.displayName = displayName
    user.picture = picture
    user.districtSubscribe = districtSubscribe
    await user.save()
    return res.status(200).json({ message: 'User updated' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { register, refreshToken, updateProfile }
