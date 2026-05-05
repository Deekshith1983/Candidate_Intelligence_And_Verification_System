/**
 * ========================================
 * CIVS BACKEND SERVER
 * ========================================
 */

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import passport configuration
require('./config/passport');

// 🔥 CREATE APP FIRST
const app = express();
const server = http.createServer(app);

// Import routes
const authRoutes = require('./routes/auth.routes');
const candidateRoutes = require('./routes/candidate.routes');
const recruiterRoutes = require('./routes/recruiter.routes');
const projectRoutes = require('./routes/project.routes');
const scoreRoutes = require('./routes/score.routes');
const notificationRoutes = require('./routes/notification.routes');
const skillScoreRoutes = require('./routes/skillScoreRoutes');
const publicRoutes = require('./routes/public.routes');

// Notification socket setup
const { setSocketInstance } = require('./services/notificationService');

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

setSocketInstance(io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

/**
 * ========================================
 * MIDDLEWARE SETUP
 * ========================================
 */

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔍 DEBUG: Log incoming requests
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`📨 ${req.method} ${req.path}`);
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log('Body:', req.body);
  }
  next();
});

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Session setup (for Passport)
app.use(
  require('express-session')({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

/**
 * ========================================
 * DATABASE CONNECTION
 * ========================================
 */

connectDB();

/**
 * ========================================
 * ROUTES
 * ========================================
 */

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Candidate routes
app.use('/api/candidate', candidateRoutes);

// Recruiter routes
app.use('/api/recruiter', recruiterRoutes);

// Project routes
app.use('/api', projectRoutes);

// Score routes
app.use('/api', scoreRoutes);

// Notification routes
app.use('/api', notificationRoutes);

// Skill score routes
app.use('/api', skillScoreRoutes);

// Public routes (No authentication required)
app.use('/api/public', publicRoutes);

/**
 * ========================================
 * ERROR HANDLING
 * ========================================
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

/**
 * ========================================
 * SOCKET.IO SETUP FOR REAL-TIME NOTIFICATIONS
 * ========================================
 */


const socketIO = require('socket.io');





// ✅ Initialize notification service with Socket.io instance
setSocketInstance(io);

// Socket.io connection handler - Unified for notifications
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Listen for join event - frontend uses 'join' to enter user notification room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`👤 User ${userId} joined notification room`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

/**
 * ========================================
 * SERVER START
 * ========================================
 */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════╗
    ║  🚀 Server Running Successfully    ║
    ║  📍 http://localhost:${PORT}    ║
    ║  🌍 Environment: ${process.env.NODE_ENV || 'development'}     ║
    ║  🔌 Socket.io Enabled for Real-time  ║
    ╚════════════════════════════════════╝
  `);
});

module.exports = { app, io, server };