const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')

const register = async (req, res) => {
  try {
    const { username, password, type, role } = req.body

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
      type,
      role,
    })

    // Save user to database
    await newUser.save()

    return res.status(201).json({ message: 'User created' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

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
    const accessToken = jwt.sign({ userId: user._id }, config.accessSecretKey, {
      expiresIn: '15m',
    })

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.refreshSecretKey,
      { expiresIn: '7d' }
    )

    return res.json({ accessToken, refreshToken })
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

module.exports = { register, login, refreshToken }
