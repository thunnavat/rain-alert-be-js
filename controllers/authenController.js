const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const User = require('../models/user.js')
const config = require('../config/config.js')
const sendEmail = require('../middleware/sendEmail.js')
const emailVerificationModel = require('../models/emailVerification.js');
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

      const profileData = {
        email: user.email,
        displayName: user.displayName,
        picture: user.picture,
        districtSubscribe: user.districtSubscribe,
        notifyToken: user.notifyToken,
        notificationByLine: user.notificationByLine,
        notificationByEmail: user.notificationByEmail,
      }

      return res.json({ accessToken, refreshToken, profileData })
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

      const profileData = {
        email: user.email,
        displayName: user.displayName,
        picture: user.picture,
        districtSubscribe: user.districtSubscribe,
        notifyToken: user.notifyToken,
        notificationByLine: user.notificationByLine,
        notificationByEmail: user.notificationByEmail,
      }

      return res.json({ accessToken, refreshToken, profileData })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
}

const getProfile = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'กรุณาใส่ Token' })
    }

    const accessToken = authorizationHeader.split(' ')[1]
    if (!accessToken) {
      return res.status(401).json({ message: 'Token ไม่ถูกต้อง' })
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(accessToken, config.accessSecretKey)
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token หมดอายุ' })
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token ไม่ถูกต้อง' })
      }
      throw error
    }

    const userId = decodedToken.userId

    const user = await User.findById(userId)

    return res.json({
      email: user.email,
      displayName: user.displayName,
      picture: user.picture,
      districtSubscribe: user.districtSubscribe,
      notifyToken: user.notifyToken,
      notificationByLine: user.notificationByLine,
      notificationByEmail: user.notificationByEmail,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' })
  }
}

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

const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'ไม่มีอีเมลอยู่ในระบบ' })
    }

    const token = jwt.sign({ userId: user._id }, config.accessSecretKey)
    await user.updateOne({ resetLink: token })

    const resetPasswordUrl = `${process.env.URL_FE}/auth/forget-password/${token}`
    await sendEmail(email, 'Reset Password', resetPasswordUrl)

    return res.status(200).json({ message: 'ส่งอีเมลไปยังบัญชีคุณแล้ว' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

const resetPassword = async (req, res) => {
  const { resetLink, newPass } = req.body
  if (resetLink) {
    try {
      const decoded = jwt.verify(resetLink, config.accessSecretKey)
      const user = await User.findOne({ resetLink })

      if (!user) {
        return res.status(400).json({ message: 'ไม่มีผู้ใช้ที่มีโทเคนนี้อยู่' })
      }

      const hashedPassword = await bcrypt.hash(newPass, 10)
      user.password = hashedPassword
      user.resetLink = ''
      await user.save()

      return res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' })
    } catch (error) {
      return res.status(401).json({ message: 'โทเคนผิดหรือหมดอายุ' })
    }
  } else {
    return res.status(400).json({ message: 'โทเคนไม่ถูกต้อง' })
  }
}

const requestEmailVerification = async (req, res) => {
  const { email } = req.body;
  const otp = emailVerificationModel.generateOTP();
  emailVerificationModel.setEmailOTP(email, otp);
  const subject = 'Email Verification OTP';
  const url = `Your OTP is: ${otp}`;
  
  try {
    await sendEmail(email, subject, url);
    res.status(200).json({ message: 'ส่งรหัส OTP ไปยัง Email ของคุณแล้ว' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งรหัส OTP ' });
  }
}

// const verifyEmail = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const storedOTP = emailVerificationModel.getEmailOTP(email);

//     if (!storedOTP) {
//       return res.status(400).json({ message: 'ไม่เจอรหัส OTP' });
//     }

//     if (storedOTP.otp !== otp) {
//       return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้อง' });
//     }

//     const currentTime = Date.now();
//     if (storedOTP.expiryTime < currentTime) {
//       emailVerificationModel.deleteEmailOTP(email);
//       return res.status(400).json({ message: 'รหัส OTP หมดอายุ' });
//     }

//     await User.updateOne({ email: email }, { isEmailVerified: true });
//     emailVerificationModel.deleteEmailOTP(email);
//     res.status(200).json({ message: 'Email ได้รับการยืนยันแล้ว' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดภายใน' });
//   }
// }

module.exports = {
  login,
  verifyToken,
  getProfile,
  forgotPassword,
  resetPassword,
  requestEmailVerification,
  // verifyEmail,
}
