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

    if (!reports || reports.length === 0) {
      res.status(404).json({ message: 'ไม่พบรายงาน' })
      return
    }

    res.status(200).json(reports)
  } catch (error) {
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
      { $sort: { reportTime: -1 } },
    ])

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
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในดึงเวลาที่เป็นยูนีค' })
    throw error
  }
}

const getReportsBySpecificTime = async (specificTime) => {
  try {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(\.\d{1,3})?Z?$/.test(specificTime)) {
      throw new Error('Invalid date format for specificTime')
    }
    const formattedTime = specificTime.includes(':')
      ? specificTime
      : specificTime + ':00'
    const time = new Date(formattedTime)
    if (isNaN(time.getTime())) {
      throw new Error('Invalid date for specificTime')
    }
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
    result.sort((a, b) => {
      const statusOrder = {
        'HEAVY RAIN': 0,
        'MODERATE RAIN': 1,
        'LIGHT RAIN': 2,
        'NO RAIN': 3,
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
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในดึงข้อมูลเขตตามเวลา' })
    throw error
  }
}

module.exports = {
  getReports,
  getUniqueTimeFromReports,
  getReportsBySpecificTime,
}
