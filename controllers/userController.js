const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')

const register = async (req, res) => {
  try {
    const { username, password, displayName, picture, registerType, role } =
      req.body

    if (!username || !password || !displayName || !registerType) {
      return res.status(400).json({ message: 'ข้อมูลที่ต้องการไม่ครบ' })
    }

    if (registerType === 'WEB') {
      const user = await User.findOne({ username: username })
      if (user) {
        return res.status(400).json({ message: 'ชื่อ Username ถูกใช้ไปแล้ว' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = new User({
        username,
        password: hashedPassword,
        displayName,
        registerType,
        role,
      })

      await newUser.save()
      return res.status(201).json({ message: 'สร้างผู้ใช้สำเร็จ' })
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
        return res.status(200).json({ message: 'สร้างผู้ใช้สำเร็จ' })
      }
    } else {
      return res.status(400).json({ message: 'ประเภทการลงทะเบียนไม่ถูกต้อง' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' })
  }
}

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: 'ต้องการ Refresh token' })
    }

    const decoded = jwt.verify(refreshToken, config.refreshSecretKey)

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      config.accessSecretKey,
      { expiresIn: '15m' }
    )

    res.json({ accessToken })
  } catch (error) {
    console.error(error)
    return res.status(403).json({ message: 'โทเค็นการรีเฟรชไม่ถูกต้อง' })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { displayName, picture, districtSubscribe } = req.body
    const userId = req.query.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'ไม่เจอผู้ใช้' })
    }
    user.displayName = displayName
    user.picture = picture
    user.districtSubscribe = districtSubscribe
    await user.save()
    return res.status(200).json({ message: 'อัพเดตผู้ใช้สำเร็จ' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' })
  }
}

module.exports = { register, refreshToken, updateProfile }
