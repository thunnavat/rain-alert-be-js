const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const User = require('../models/user.js')
const config = require('../config/config.js')
const sendEmail = require('../middleware/sendEmail.js')
require('dotenv').config()

const login = async (req, res) => {
  try {
    const { email, lineId, password, registerType, channelId } = req.body
    if (registerType === 'WEB') {
      const user = await User.findOne({ email: email })
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
      const user = await User.findOne({ lineId: lineId })
      if (!user) {
        return res
          .status(401)
          .json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      }
      if (channelId !== '2003424448') {
        return res.status(401).json({ message: 'channelId ไม่ถูกต้อง' })
      }

      const accessToken = jwt.sign(
        {
          userId: user._id,
          lineId: user.lineId,
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
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' })
  }
}

const getProfile = async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'ไม่พบ Token' });
    }

    const decodedToken = jwt.verify(accessToken, config.accessSecretKey);
    const userIdFromToken = decodedToken.userId;

    const userIdFromParams = req.params.userId;
    if (!userIdFromParams) {
      return res.status(400).json({ message: 'ไม่พบ userId' });
    }

    if (userIdFromToken !== userIdFromParams) {
      return res.status(401).json({ message: 'ไม่อนุญาตให้เข้าถึงข้อมูลผู้ใช้นี้' });
    }

    const user = await User.findById(userIdFromParams);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    return res.json({
      email: user.email,
      displayName: user.displayName,
      picture: user.picture,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token =
    req.body.token ||
    req.query.token ||
    req.header['x-access-token'] ||
    (authHeader && authHeader.split(' ')[1])

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

module.exports = { login, verifyToken, getProfile }
