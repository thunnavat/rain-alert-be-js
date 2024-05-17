const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require('firebase/storage')
const emailVerificationModel = require('../middleware/emailVerification.js')
// const sendEmail = require('../middleware/sendEmail.js')

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      displayName,
      picture,
      registerType,
      role,
      lineId,
      otp,
    } = req.body
    if (registerType === 'WEB') {
      const storedOTP = emailVerificationModel.getEmailOTP(email)

      if (!otp) {
        return res.status(400).json({ message: 'กรุณากรอกรหัส OTP' })
      }

      if (!storedOTP) {
        return res.status(400).json({ message: 'ไม่เจอรหัส OTP' })
      }

      if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้อง' })
      }

      const currentTime = Date.now()
      if (storedOTP.expiryTime < currentTime) {
        emailVerificationModel.deleteEmailOTP(email)
        return res.status(400).json({ message: 'รหัส OTP หมดอายุ' })
      }

      emailVerificationModel.deleteEmailOTP(email)

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,30}$/

      if (!email || !password || !displayName || !registerType) {
        return res.status(400).json({ message: 'ข้อมูลที่ต้องการไม่ครบ' })
      }

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
      }

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษรและมากที่สุด 30 ตัว โดยต้องประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และอักขระพิเศษ',
        })
      }

      if (email.length > 50) {
        return res.status(400).json({
          message: 'อีเมลต้องมีความยาวไม่เกิน 50 ตัวอักษร',
        })
      }

      if (displayName.length > 50) {
        return res.status(400).json({
          message: 'DisplayName ต้องมีไม่เกิน 50 ตัวอักษร',
        })
      }

      const user = await User.findOne({ email: email })
      if (user) {
        return res.status(400).json({ message: 'อีเมลมีอยู่ในระบบแล้ว' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      let pictureURL = null
      if (req.file) {
        const allowedFileExtensions = ['jpg', 'jpeg', 'png', 'gif']
        const fileExtension = req.file.originalname
          .split('.')
          .pop()
          .toLowerCase()
        if (!allowedFileExtensions.includes(fileExtension)) {
          return res
            .status(400)
            .json({ message: 'นามสกุลของไฟล์รูปภาพไม่ถูกต้อง' })
        }

        const maxSizeInBytes = 5 * 1024 * 1024
        if (req.file.size > maxSizeInBytes) {
          return res
            .status(400)
            .json({ message: 'ขนาดของไฟล์รูปภาพต้องไม่เกิน 5 MB' })
        }

        const storage = getStorage()
        const storageRef = ref(storage, `profiles/${email}/profile`)
        const metadata = {
          contentType: req.file.mimetype,
        }
        const snapshot = await uploadBytesResumable(
          storageRef,
          req.file.buffer,
          metadata
        )
        pictureURL = await getDownloadURL(snapshot.ref)
      }

      const newUser = new User({
        email,
        password: hashedPassword,
        displayName,
        picture: pictureURL,
        registerType,
        role,
      })
      await newUser.save()

      res.status(200).json({ message: 'ลงทะเบียนเสร็จสมบูรณ์' })
    } else if (registerType === 'LINE') {
      const user = await User.findOne({ email: email })
      if (user && user.registerType === 'WEB') {
        return res.status(400).json({
          message:
            'อีเมลนี้ได้ลงทะเบียนกับระบบไว้แล้ว คุณต้องการรวมบัญชีหรือไม่',
        })
      }

      const existingUser = await User.findOne({ lineId: lineId })
      if (existingUser && existingUser.registerType === 'LINE') {
        existingUser.email = email
        existingUser.displayName = displayName
        existingUser.picture = picture
        await existingUser.save()
        return res.status(200).json({ message: 'อัปเดทข้อมูลสำเร็จ' })
      } else {
        const newUser = new User({
          lineId,
          email,
          displayName,
          picture,
          registerType,
          role,
        })
        await newUser.save()
        return res.status(200).json({ message: 'สร้างบัญชีสำเร็จ' })
      }
    } else {
      console.log(req.body)
      return res.status(400).json({ message: 'ประเภทการลงทะเบียนไม่ถูกต้อง' })
    }
  } catch (error) {
    console.log(req.body)
    console.error(error)
    return res.status(500).json({ error })
  }
}

const getDistrictSubsribeByEmail = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' })
    }
    res.status(200).json({ districtSubscribe: user.districtSubscribe })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

const userMerge = async (req, res) => {
  try {
    const { email, lineId, displayName, picture, districtSubscribe } = req.body
    const user = await User.findOne({ email: email })
    const lineUser = await User.findOne({ lineId: lineId })
    if (user && lineUser && user._id.toString() !== lineUser._id.toString()) {
      await User.delete({ lineId: lineId })
    }
    user.lineId = lineId
    user.displayName = displayName
    user.picture = picture
    user.districtSubscribe = districtSubscribe
    await user.save()
    res.status(200).json({ message: 'รวมบัญชีสำเร็จ' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
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
    const { userId } = req.user
    const {
      displayName,
      notifyToken,
      notificationByLine,
      notificationByEmail,
      districtSubscribe,
    } = req.body

    let user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้' })
    }

    if (displayName) {
      user.displayName = displayName
    }

    if (notifyToken) {
      user.notifyToken = notifyToken
    }

    if (notificationByLine !== null && notificationByLine !== undefined) {
      user.notificationByLine = notificationByLine
    }

    if (notificationByEmail !== null && notificationByEmail !== undefined) {
      user.notificationByEmail = notificationByEmail
    }

    if (districtSubscribe) {
      user.districtSubscribe = districtSubscribe
    }

    const allowedFileExtensions = ['jpg', 'jpeg', 'png', 'gif']

    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase()
      if (!allowedFileExtensions.includes(fileExtension)) {
        return res
          .status(400)
          .json({ message: 'นามสกุลของไฟล์รูปภาพไม่ถูกต้อง' })
      }
      const storage = getStorage()
      const storageRef = ref(storage, `profiles/${user.email}/profile.jpg`)
      const metadata = {
        contentType: req.file.mimetype,
      }

      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      )

      const pictureURL = await getDownloadURL(snapshot.ref)

      user.picture = pictureURL
    }

    await user.save()

    res.status(200).json({ message: 'อัปเดตสำเร็จ' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

const changePassword = async (req, res) => {
  try {
    const { userId } = req.user
    const { currentPassword, newPassword, retypePassword } = req.body
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/

    const user = await User.findById(userId)

    if (!currentPassword || !newPassword || !retypePassword) {
      return res.status(400).json({ message: 'โปรดกรอกข้อมูลให้ครบทุกช่อง' })
    }

    if (newPassword !== retypePassword) {
      return res
        .status(400)
        .json({ message: 'รหัสผ่านใหม่และรหัสผ่านยืนยันไม่ตรงกัน' })
    }

    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' })
    }

    if (user.registerType === 'LINE' && !user.password) {
      return res.status(400).json({ message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' })
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และอักขระพิเศษ',
      })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword

    await user.save()

    res.status(200).json({ message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดเซิร์ฟเวอร์ภายใน' })
  }
}

const checkEmailExist = async (req, res) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const email = req.body.email // ใช้ตัวแปร email โดยตรงจาก req.body

    if (!email) {
      return res.status(400).json({ message: 'ข้อมูลที่ต้องการไม่ครบ' })
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว' })
    }

    return res.status(200).json({ message: 'อีเมลนี้สามารถใช้งานได้' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล' })
  }
}

module.exports = {
  register,
  refreshToken,
  updateProfile,
  changePassword,
  getDistrictSubsribeByEmail,
  userMerge,
  checkEmailExist,
}
