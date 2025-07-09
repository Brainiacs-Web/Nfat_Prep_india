require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');

const adminRoutes  = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courses');
const batchRoutes  = require('./routes/batches');

const app = express();
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'https://nfat-prep-india.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Health check route (important for Render)
app.get('/health', (req, res) => res.send('OK'));

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);

// Dashboard fallback for SPA
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
