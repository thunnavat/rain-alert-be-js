const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const config = require('../config/config.js')
const DistrictUserSubscribe = require('../models/districtUserSubscribe')
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require('firebase/storage')
// const Token = require('../models/token.js')
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
    } = req.body
    if (registerType === 'WEB') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email || !password || !displayName || !registerType) {
        return res.status(400).json({ message: 'ข้อมูลที่ต้องการไม่ครบ' })
      }

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
      }

      const user = await User.findOne({ email: email })
      if (user) {
        return res.status(400).json({ message: 'อีเมลมีอยู่ในระบบแล้ว' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

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
      const pictureURL = await getDownloadURL(snapshot.ref)
      const picture = pictureURL

      const allowedFileExtensions = ['jpg', 'jpeg', 'png', 'gif']

      const fileExtension = req.file.originalname.split('.').pop().toLowerCase()
      if (!allowedFileExtensions.includes(fileExtension)) {
        return res
          .status(400)
          .json({ message: 'นามสกุลของไฟล์รูปภาพไม่ถูกต้อง' })
      }

      const newUser = new User({
        email,
        password: hashedPassword,
        displayName,
        picture,
        registerType,
        role,
      })
      await newUser.save()
      const insUser = await User.findOne({ email: email })
      const userId = insUser._id
      const newDistrictUserSubscribe = new DistrictUserSubscribe({
        userId: userId,
        districtSubscribe: [],
      })
      await newDistrictUserSubscribe.save()
      console.log(picture)
      return res.status(200).json({ message: 'สร้างบัญชีสำเร็จ' })

    } else if (registerType === 'LINE') {
      const existingUser = await User.findOne({ lineId: lineId })
      if (existingUser) {
        existingUser.displayName = displayName
        existingUser.picture = picture
        await existingUser.save()
        return res.status(200).json({ message: 'อัปเดทข้อมูลสำเร็จ' })
      } else {
        const newUser = new User({
          lineId,
          displayName,
          picture,
          registerType,
          role,
        })
        await newUser.save()
        const insUser = await User.findOne({ lineId: lineId })
        const userId = insUser._id
        const newDistrictUserSubscribe = new DistrictUserSubscribe({
          userId: userId,
          districtSubscribe: [],
        })
        await newDistrictUserSubscribe.save()
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
    const { userId, email } = req.user;
    const { displayName } = req.body;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้' });
    }

    if (displayName) {
      user.displayName = displayName;
    }

    const allowedFileExtensions = ['jpg', 'jpeg', 'png', 'gif']

    const fileExtension = req.file.originalname.split('.').pop().toLowerCase()
    if (!allowedFileExtensions.includes(fileExtension)) {
      return res
        .status(400)
        .json({ message: 'นามสกุลของไฟล์รูปภาพไม่ถูกต้อง' })
    }

    if (req.file) {
      const storage = getStorage();
      const storageRef = ref(storage, `profiles/${user.email}/profile`);
      const metadata = {
        contentType: req.file.mimetype,
      };

      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );

      const pictureURL = await getDownloadURL(snapshot.ref);

      user.picture = pictureURL;
    }

    await user.save();

    res.status(200).json({ message: 'อัปเดตสำเร็จ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

module.exports = { register, refreshToken, updateProfile }
