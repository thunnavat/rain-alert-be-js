const BugReport = require('../models/bugReport');
const Report = require('../models/report');
const { getStorage, ref, deleteObject } = require('firebase/storage');

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
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะฝน' });
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
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัค' });
  }
};

const deleteBugReport = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเข้าถึง' });
    }

    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: 'โปรดระบุ _id' });
    }


    const bugReport = await BugReport.findByIdAndDelete(_id);
    if (!bugReport) {
      return res.status(404).json({ message: 'ไม่เจอบัครายงาน' });
    }

    if(bugReport.picture) {
      const storage = getStorage();
      const pictureRef = ref(storage, bugReport.picture);
      await deleteObject(pictureRef);
    }

    res.status(200).json({ message: 'ลบบัครายงานสำเร็จ' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบบัครายงาน' });
  }
}

module.exports = {
  updateRainStatus,
  getBugReports,
  deleteBugReport,
};