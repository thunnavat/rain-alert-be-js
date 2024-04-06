const BugReport = require('../models/bugReport');
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require('firebase/storage')

const createBugReport = async (req, res) => {
  const { note } = req.body;
  try {
    if (!note || note.trim() === '') {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูล note' });
    }

    const userId = req.user ? req.user.userId : "defaultUserId";
    const timestamp = Date.now(); 
    
    let picture = null;
    if (req.file) {
              const allowedFileExtensions = ['jpg', 'jpeg', 'png', 'gif']
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase()
        if (!allowedFileExtensions.includes(fileExtension)) {
          return res
            .status(400)
            .json({ message: 'นามสกุลของไฟล์รูปภาพไม่ถูกต้อง' })
        }

      const storage = getStorage();
      const storageRef = ref(storage, `bugReports/${userId}/bugReport_${timestamp}`);
      const metadata = {
        contentType: req.file.mimetype,
      };

      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );

      const pictureURL = await getDownloadURL(snapshot.ref);
      picture = pictureURL;
    }

    const bugReport = new BugReport({
      note,
      userReport: userId,
      picture,
    });

    const savedBugReport = await bugReport.save();
    res.status(201).json(savedBugReport);
  } catch (err) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการรายงานบัค'});
  }
};

module.exports = {
  createBugReport,
};
