const { get } = require('mongoose')
const RainReport = require('../models/report')

const getReports = async () => {
  try {
    const result = await RainReport.find().populate({
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
    res.status(201)
    console.error(error.message)
    throw error
  }
}

const getUniqueTimeReports = async () => {
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
      { $sort: { reportTime: -1 } }, // ถ้าคุณต้องการเรียงลำดับล่าสุดขึ้นก่อน
    ])

    return result.map((report) => ({
      reportTime: report.reportTime,
    }))
  } catch (error) {
    console.error(error.message)
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
    return result
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

module.exports = { getReports, getUniqueTimeReports, getReportsBySpecificTime }
