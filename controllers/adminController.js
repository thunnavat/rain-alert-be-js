const BugReport = require('../models/bugReport');
const Report = require('../models/report');

const isAdmin = (user) => {
  return user.role === 'ADMIN';
}

const updateRainStatus = async (req, res) => {
  try {
    const { rainStatus, _id } = req.body; 

    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเข้าถึง' });
    }

    if (!_id) {
      return res.status(400).json({ message: 'โปรดระบุ _id' });
    }
    if (!rainStatus) {
      return res.status(400).json({ message: 'โปรดระบุ rain status' });
    }
  
    const report = await Report.findByIdAndUpdate(
      _id, 
      { rainStatus }, 
      { new: true } 
    );

    if (!report) {
      return res.status(404).json({ message: 'ไม่เจอรายงานฝน' });
    }

    res.status(200).json({ message: 'อัพเดตสำเร็จ', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' });
  }
};

const getBugReports = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเข้าถึง' });
    }
   
    const bugReports = await BugReport.find();
    res.status(200).json(bugReports);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'ข้อผิดพลาดเซิร์ฟเวอร์ภายใน' });
  }
};

module.exports = {
  updateRainStatus,
  getBugReports,
};