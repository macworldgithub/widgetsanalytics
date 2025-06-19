const mongoose = require('mongoose');

let conn = null;

const uri = 'mongodb+srv://macworldgithub:SirBilal1234@cluster0.kaqy2pl.mongodb.net/chatbot';

const connectDB = async () => {
  if (conn) {
    console.log('Reusing existing MongoDB connection');
    return conn;
  }

  try {
    conn = await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Schemas
const visitorSchema = new mongoose.Schema({
  event: String,
  timestamp: Date,
  ip: String,
  widgetId: { type: String, required: true, index: true },
  location: {
    country: String,
    region: String,
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});
const Visitor = mongoose.model('Visitor', visitorSchema);

const widgetSchema = new mongoose.Schema({
  widgetId: { type: String, required: true, unique: true },
  name: String,
  createdAt: Date,
});
const Widget = mongoose.model('Widget', widgetSchema);

module.exports = { connectDB, Visitor, Widget };