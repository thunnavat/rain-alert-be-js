const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')

const login = async (req, res) => {
  try {
    const { username, password, registerType, channelId } = req.body
    if (registerType === 'WEB') {
      const user = await User.findOne({ username })
      if (!user) {
        return res
          .status(401)
          .json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      }

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

      const refreshToken = jwt.sign(
        { userId: user._id },
        config.refreshSecretKey,
        { expiresIn: '7d' }
      )

      return res.json({ accessToken, refreshToken })
    } else if (registerType === 'LINE') {
      const user = await User.findOne({ username })
      if (!user) {
        return res
          .status(401)
          .json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      }
      if (channelId !== '2003424448') {
        return res.status(401).json({ message: 'channelId ไม่ถูกต้อง' })
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        config.accessSecretKey,
        {
          expiresIn: '15m',
        }
      )

      const refreshToken = jwt.sign(
        { userId: user._id },
        config.refreshSecretKey,
        { expiresIn: '7d' }
      )

      return res.json({ accessToken, refreshToken })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' })
  }
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = req.body.token || req.query.token || req.header['x-access-token'] ||  authHeader && authHeader.split(' ')[1] 

  if (!token) {
    return res.status(403).send('จำเป็นต้องมีโทเค็น')
  }

  try {
    const decoded = jwt.verify(token, config.accessSecretKey)
    req.user = decoded
  } catch (err) {
    return res.status(401).send('โทเค็นไม่ถูกต้อง')
  }
  return next()
}

module.exports = { login, verifyToken }
