const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')
const Token = require('../models/token.js')
const sendEmail = require('../middleware/sendEmail.js')

const register = async (req, res) => {
  try {
    const { email, password, displayName, picture, registerType, role, lineId } =
      req.body

    if (!email || !password || !displayName || !registerType) {
      return res.status(400).json({ message: 'ข้อมูลที่ต้องการไม่ครบ' })
    }

    if (registerType === 'WEB') {
      const user = await User.findOne({ email: email })
      if (user) {
        return res.status(400).json({ message: 'อีเมลมีอยู่ในระบบแล้ว' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({
        email,
        password: hashedPassword,
        displayName,
        registerType,
        role,
      })
      await newUser.save(); 

      // const token = new Token({
      //   userId: newUser._id,
      //   token: jwt.sign({ userId: newUser._id }, config.accessSecretKey),
      // });
      // await token.save();

  
      // const url = `http://localhost:8080/api/users/verify/${newUser._id}/${token.token}`; // แก้เป็น email และใช้ http แทน localhost

      // await sendEmail(email, "โปรดยืนยัน Email ของคุณ", url)

      return res.status(200).json({ message: 'สร้างบัญชีสำเร็จ' })

    } else if (registerType === 'LINE') {
      const existingUser = await User.findOne({ lineId: lineId })
      if (existingUser) {
        return res.status(400).json({ message: 'LINE ID มีอยู่ในระบบแล้ว' });
      }

      const newUser = new User({
        lineId,
        displayName,
        picture,
        registerType,
        role,
      })
      await newUser.save()
    } else {
      return res.status(400).json({ message: 'ประเภทการลงทะเบียนไม่ถูกต้อง' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' })
  }
}

// const verifyEmail = async (req, res) => {
//   try {
//     const userId = req.params.userId; 

//     const user = await User.findById(userId);


//     if (!user) {
//       return res.status(400).json({ message: 'ไม่พบผู้ใช้หรือลิงก์ไม่ถูกต้อง' });
//     }

//     const token = req.params.token;

//     const tokenData = await Token.findOne({ userId: user._id, token }); 
//     if (!tokenData) {
//       return res.status(400).json({ message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ' });
//     }

//     user.isEmailVerified = true;
//     await user.save();

//     await Token.findOneAndDelete({ userId: user._id, token }); 

//     return res.status(200).json({ message: 'ยืนยันอีเมลเรียบร้อยแล้ว' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' });
//   }
// };

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

module.exports = { register,refreshToken, updateProfile }
