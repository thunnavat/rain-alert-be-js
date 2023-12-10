const express = require('express') 
const router = express.Router() 
const reportController = require('../controller/reportController') 

router.get('/', async (req, res) => {
  try {
    const { specificTime, sort, rainStatus } = req.query;
    let reports;
    if (specificTime) {
      reports = await reportController.getReportsBySpecificTime(specificTime);
    } else {
      reports = await reportController.getReports();
    }
    if (rainStatus) {
      const rainStatusArray = rainStatus.split(',');
      let filteredReports = reports;
      filteredReports = reports.filter(report => rainStatusArray.includes(report.rainStatus));
      reports = filteredReports;
    }
    if (sort) {
      const [sortBy, sortOrder] = sort.split(',');
      if (sortBy === 'distinctname' && sortOrder === 'asc') {
        reports.sort((a, b) =>
          a.reportDistrict.districtName.localeCompare(b.reportDistrict.districtName)
        );
      } else if (sortBy === 'distinctname' && sortOrder === 'desc') {
        reports.sort((a, b) =>
          b.reportDistrict.districtName.localeCompare(a.reportDistrict.districtName)
        );
      }
    }

    res.status(200).json(reports);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

    res.status(200).json(reports);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/time', async (req, res) => {
  try {
    const reports = await reportController.getUniqueTimeReports()
    res.status(200).json(reports)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: error.message })
  }
})

// routes.js

module.exports = router
