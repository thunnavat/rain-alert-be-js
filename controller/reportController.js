const Report = require ('../models/report')


const getReports = async () => {
  try {
      const result = await Report.find().populate({
          path: 'reportDistrict',
          options: { sort: { districtName: 1 } },
      });

      // Sort the result array by rainStatus
      result.sort((a, b) => {
          const statusOrder = { 'heavy rain': 0, 'moderate rain': 1, 'light rain': 2, 'no rain': 3 };
          return statusOrder[a.rainStatus] - statusOrder[b.rainStatus];
      });

      return result;
  } catch (error) {
      console.error(error.message);
      throw error;
  }
};

// Example usage
const reports = await getReports();
