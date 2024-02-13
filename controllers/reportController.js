const RainReport = require('../models/report')

const getReports = async (req, res) => {
  try {
    const { specificTime, sort, rainStatus } = req.query
    let reports

    if (specificTime) {
      reports = await getReportsBySpecificTime(specificTime)
    } else {
      reports = await RainReport.find().populate({
        path: 'reportDistrict',
        options: { sort: { districtName: 1 } },
      })
    }

    if (rainStatus) {
      if (rainStatus.toLowerCase() !== 'all') {
        const rainStatusArray = rainStatus.split(',')
        let filteredReports = reports
        filteredReports = reports.filter((report) =>
          rainStatusArray.includes(report.rainStatus)
        )
        reports = filteredReports
      }
    }

    if (sort) {
      const [sortBy, sortOrder] = sort.split(',')
      if (sortBy === 'distinctname' && sortOrder === 'asc') {
        reports.sort((a, b) =>
          a.reportDistrict.districtName.localeCompare(
            b.reportDistrict.districtName
          )
        )
      } else if (sortBy === 'distinctname' && sortOrder === 'desc') {
        reports.sort((a, b) =>
          b.reportDistrict.districtName.localeCompare(
            a.reportDistrict.districtName
          )
        )
      }
    }

    // ถ้าไม่มีรายงานที่พบ
    if (!reports || reports.length === 0) {
      res.status(404).json({ message: 'ไม่พบรายงาน' })
      return
    }

    res.status(200).json(reports)
  } catch (error) {
    // จัดการข้อผิดพลาดและส่งคำตอบกลับ
    console.error(error.message)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน' })
    throw error
  }
}

const getUniqueTimeFromReports = async (req, res) => {
  try {
    const result = await RainReport.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$reportTime' },
            month: { $month: '$reportTime' },
            day: { $dayOfMonth: '$reportTime' },
            hour: { $hour: '$reportTime' },
            minute: { $minute: '$reportTime' },
          },
          doc: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$doc' },
      },
      { $sort: { reportTime: -1 } }, // เรียงลำดับล่าสุดขึ้นก่อน
    ])
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (result.length === 0) {
      res.status(404).json({ message: 'ไม่พบข้อมูลรายงาน' })
      return
    }
    res.status(200).json(
      result.map((report) => ({
        reportTime: report.reportTime,
      }))
    )
  } catch (error) {
    res.status(500).json({ message: error.message })
    throw error
  }
}

const getReportsBySpecificTime = async (specificTime) => {
  try {
    // Validate the specificTime format
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(\.\d{1,3})?Z?$/.test(specificTime)) {
      throw new Error('Invalid date format for specificTime')
    }
    // Add seconds to the specificTime if it doesn't exist
    const formattedTime = specificTime.includes(':')
      ? specificTime
      : specificTime + ':00'
    // Convert the specificTime to Date object
    const time = new Date(formattedTime)
    // Validate if the conversion is successful
    if (isNaN(time.getTime())) {
      throw new Error('Invalid date for specificTime')
    }
    // Use the time to fetch data
    const result = await RainReport.find({
      reportTime: {
        $gte: new Date(
          time.getFullYear(),
          time.getMonth(),
          time.getDate(),
          time.getHours(),
          time.getMinutes()
        ),
        $lt: new Date(
          time.getFullYear(),
          time.getMonth(),
          time.getDate(),
          time.getHours(),
          time.getMinutes() + 1
        ),
      },
    }).populate({
      path: 'reportDistrict',
      options: { sort: { districtName: 1 } },
    })
    // Sort the result array by rainStatus
    result.sort((a, b) => {
      const statusOrder = {
        'heavy rain': 0,
        'moderate rain': 1,
        'light rain': 2,
        'no rain': 3,
      }
      return (
        statusOrder[a.rainStatus] - statusOrder[b.rainStatus] ||
        a.reportDistrict.districtName.localeCompare(
          b.reportDistrict.districtName
        )
      )
    })
    return result
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

module.exports = { getReports, getUniqueTimeFromReports, getReportsBySpecificTime }
