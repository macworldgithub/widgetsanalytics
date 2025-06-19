const { connectDB, Visitor } = require('./db');

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

    const totalVisitors = await Visitor.countDocuments({ event: 'chat_opened' });
    const locations = await Visitor.aggregate([
      { $match: { event: 'chat_opened' } },
      {
        $group: {
          _id: {
            country: '$location.country',
            region: '$location.region',
            widgetId: '$widgetId',
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
          widgetId: '$_id.widgetId',
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({ totalVisitors, locations });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};