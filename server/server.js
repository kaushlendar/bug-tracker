
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Middleware
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

// Home Route
app.get('/', (req, res) => {
  res.send('Bug Tracker Backend is Running!');
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bug Tracker API is running'
  });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

app.use('/api/issues', issueRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
