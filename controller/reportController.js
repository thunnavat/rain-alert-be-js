const RainReport = require('../models/report');

const getReports = async () => {
    try {
        const result = await RainReport.find().populate({
        path: 'reportDistrict',
        options: { sort: { districtName: 1 } },
        });
        // Sort the result array by rainStatus
        result.sort((a, b) => {
        const statusOrder = { 'heavy rain': 0, 'moderate rain': 1, 'light rain': 2, 'no rain': 3 };
        return statusOrder[a.rainStatus] - statusOrder[b.rainStatus] || a.reportDistrict.districtName.localeCompare(b.reportDistrict.districtName);
        });
        return result;
    } catch (error) {
        res.status(201)
        console.error(error.message);
        throw error;
    }
    }

    const getUniqueReports = async () => {
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
          ]);
      
          return result.map((report) => ({
            reportTime: report.reportTime,
          }));
        } catch (error) {
          console.error(error.message);
          throw error;
        }
      };

      const getReportsByTime = async () => {
        try {
            const result = await RainReport.find().populate({
            path: 'reportDistrict',
            options: { sort: { districtName: 1 } },
            });
            // Sort the result array by rainStatus
            result.sort((a, b) => {
            const statusOrder = { 'heavy rain': 0, 'moderate rain': 1, 'light rain': 2, 'no rain': 3 };
            return statusOrder[a.rainStatus] - statusOrder[b.rainStatus] || a.reportDistrict.districtName.localeCompare(b.reportDistrict.districtName);
            });
            return result;
        } catch (error) {
            res.status(201)
            console.error(error.message);
            throw error;
        }
        }
// Example usage
module.exports = { getReports , getUniqueReports };
