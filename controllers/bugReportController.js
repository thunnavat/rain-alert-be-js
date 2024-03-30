const BugReport = require('../models/bugReport.js');
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require('firebase/storage')

const createBugReport = async (req, res) => {
  const { note } = req.body;
  try {
    const userId = req.user ? req.user.userId : "defaultUserId";
    const timestamp = Date.now(); // หรือจะใช้ Date() ก็ได้

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
    const picture = pictureURL;

    const bugReport = new BugReport({
      note,
      userReport: userId,
      picture,
    });

    const savedBugReport = await bugReport.save();
    res.status(201).json(savedBugReport);
  } catch (err) {
    res.status(400).json({ message: err });
  }
}

module.exports = {
  createBugReport,
};
