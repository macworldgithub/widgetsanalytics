const axios = require('axios');
const { connectDB, Visitor, Widget } = require('./db');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { event, timestamp, widgetId } = req.body;
    if (!widgetId) {
      return res.status(400).json({ error: 'widgetId is required' });
    }

    // Validate widgetId
    const widget = await Widget.findOne({ widgetId });
    if (!widget) {
      return res.status(400).json({ error: 'Invalid widgetId' });
    }

    const ip = req.body.ip || req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for'] || 'unknown';

    // Fetch geolocation data from ipwhois.io
    const geoResponse = await axios.get(`https://ipwhois.app/json/${ip}`);
    if (!geoResponse.data.success) {
      throw new Error('Geolocation failed');
    }
    const { country, region } = geoResponse.data;

    const visitor = new Visitor({
      event,
      timestamp: new Date(timestamp),
      ip,
      widgetId,
      location: { country, region },
      metadata: {},
    });

    await visitor.save();
    res.status(200).json({ message: 'Visitor tracked' });
  } catch (error) {
    console.error('Error tracking visitor:', error.message);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
};