const BugReport = require('../models/bugReport');
const Report = require('../models/report');

const isAdmin = (user) => {
  return user.role === 'ADMIN';
}

const updateRainStatus = async (req, res) => {
  try {
    const { rainStatus, _id } = req.body; // เปลี่ยนจาก reportDistrict และ reportTime เป็น _id

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // ตรวจสอบว่า _id ถูกส่งมาหรือไม่
    if (!_id) {
      return res.status(400).json({ message: 'Please provide _id' });
    }
    // ค้นหาหรือสร้างรายงานสถานการณ์ฝนสำหรับเขตนี้
    const report = await Report.findByIdAndUpdate(
      _id, // ใช้ _id เป็นเงื่อนไขการค้นหา
      { rainStatus }, // อัปเดต rain status
      { new: true } // ตั้งค่าให้ส่งค่า report ที่ถูกอัปเดตกลับมา
    );

    // ตรวจสอบว่าพบรายงานหรือไม่
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ message: 'Rain status updated successfully', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update rain status' });
  }
};

const getBugReports = async (req, res) => {
  try {
    // เช็คสิทธิ์การเข้าถึง ว่าเป็น admin หรือไม่
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    // ดึงรายการรายงานข้อผิดพลาดทั้งหมด
    const bugReports = await BugReport.find();
    res.status(200).json(bugReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bug reports' });
  }
};

module.exports = {
  updateRainStatus,
  getBugReports,
};