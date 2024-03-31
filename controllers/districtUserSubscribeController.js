const DistrictUserSubscribe = require('../models/districtUserSubscribe')

const getDistrictSubscribeByUserId = async (req, res) => {
  try {
    const userId = req.params.userId
    const districtUserSubscribe = await DistrictUserSubscribe.findOne({
      userId: userId,
    })
    res.status(200).json(districtUserSubscribe.districtSubscribe)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการสมัครสมาชิกเขต' })
    throw error
  }
}

const updateDistrictUserSubscribe = async (req, res) => {
  try {
    const userId = req.params.userId
    const districtSubscribeData = req.body
    const districtUserSubscribe = await DistrictUserSubscribe.findOne({
      userId: userId,
    })
    districtUserSubscribe.districtSubscribe = districtSubscribeData
    await districtUserSubscribe.save()
    res.status(200).json(districtUserSubscribe.districtSubscribe)
  } catch (error) {
    console.error(error.message)
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัพเดตการสมัครสมาชิกเขต' })
    throw error
  }
}

module.exports = {
  getDistrictSubscribeByUserId,
  updateDistrictUserSubscribe,
}
