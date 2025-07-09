require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const adminRoutes  = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courses');
const batchRoutes  = require('./routes/batches');

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Public & login routes
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);       // 🔓 Public GETs handled inside routes/courses.js
app.use('/api/batches', batchRoutes);        // 🔓 Same fix applied if needed inside batches.js

// Dashboard fallback for SPA
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// Start server
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);
