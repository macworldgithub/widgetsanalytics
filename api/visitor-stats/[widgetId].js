const { connectDB, Visitor } = require('../db');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { widgetId } = req.query;
    const { startDate, endDate } = req.query;
    const matchQuery = { event: 'chat_opened', widgetId };

    if (startDate && endDate) {
      matchQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalVisitors = await Visitor.countDocuments(matchQuery);
    const locations = await Visitor.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            country: '$location.country',
            region: '$location.region',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          location: {
            country: '$_id.country',
            region: '$_id.region',
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({ totalVisitors, locations });
  } catch (error) {
    console.error('Error fetching widget stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch widget stats', details: error.message });
  }
};