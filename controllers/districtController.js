const District = require('../models/district')

const addDistricts = async (req, res) => {
  try {
    const districtData = req.body
    if (!districtData || districtData.length === 0) {
      res.status(400).json({ message: 'ข้อมูลเขตไม่ถูกต้องหรือว่างเปล่า' })
      return
    }
    const districts = districtData.map((data) => ({
      _id: data._id,
      districtName: data.districtName,
      coords: data.coords,
    }))
    const result = await District.insertMany(districts)
    res.status(201).json(result)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลเขต' })
    throw error
  }
}

const getDistricts = async (req, res) => {
  try {
    const result = await District.find()
    // ถ้าไม่พบเขต
    if (!result || result.length === 0) {
      res.status(404).json({ message: 'ไม่พบเขต' })
      return
    }
    res.status(200).json(result)
  } catch (error) {
    // จัดการข้อผิดพลาดและส่งคำตอบกลับ
    console.error(error.message)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเขต' })
    throw error
  }
}

module.exports = { addDistricts, getDistricts }
