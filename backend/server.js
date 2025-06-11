const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const libraryRoutes = require('./routes/library');
const eventRoutes = require('./routes/event');
const skillRoutes = require('./routes/skill');

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO configuration for real-time updates
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"], // Add your frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Enhanced Socket.IO for real-time seat updates
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Join library-specific rooms for targeted updates
  socket.on('join-library', (libraryId) => {
    socket.join(`library-${libraryId}`);
    console.log(`Client ${socket.id} joined library-${libraryId}`);
  });
  
  // Leave library room
  socket.on('leave-library', (libraryId) => {
    socket.leave(`library-${libraryId}`);
    console.log(`Client ${socket.id} left library-${libraryId}`);
  });
  
  // Handle seat booking events
  socket.on('seat-booked', (data) => {
    console.log('Seat booked event:', data);
    // Broadcast to all clients in the same library except sender
    socket.to(`library-${data.libraryId}`).emit('seat-update', {
      type: 'booked',
      ...data,
      timestamp: new Date()
    });
    
    // Also broadcast to general library listeners
    socket.broadcast.emit('library-seat-update', {
      type: 'booked',
      ...data,
      timestamp: new Date()
    });
  });
  
  // Handle seat release events
  socket.on('seat-released', (data) => {
    console.log('Seat released event:', data);
    // Broadcast to all clients in the same library except sender
    socket.to(`library-${data.libraryId}`).emit('seat-update', {
      type: 'released',
      ...data,
      timestamp: new Date()
    });
    
    // Also broadcast to general library listeners
    socket.broadcast.emit('library-seat-update', {
      type: 'released',
      ...data,
      timestamp: new Date()
    });
  });
  
  // Handle event seat booking
  socket.on('event-seat-booked', (data) => {
    console.log('Event seat booked:', data);
    socket.broadcast.emit('event-seat-update', {
      type: 'booked',
      ...data,
      timestamp: new Date()
    });
  });
  
  // Handle real-time occupancy requests
  socket.on('request-library-status', (libraryId) => {
    // This could trigger a database query and emit current status
    // For now, we'll just acknowledge the request
    socket.emit('library-status-requested', { libraryId });
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Middleware to add socket context to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/skills', skillRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    connectedClients: io.engine.clientsCount 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time updates`);
  console.log(`🌐 CORS enabled for frontend connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;