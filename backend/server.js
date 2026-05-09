const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const routesRoutes = require('./routes/routes');
const schedulesRoutes = require('./routes/schedules');
const reportsRoutes = require('./routes/reports');
const monitoringRoutes = require('./routes/monitoring');

// Import database
const pool = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room for specific route updates
  socket.on('subscribe:route', (route_id) => {
    socket.join(`route-${route_id}`);
    console.log(`User ${socket.id} subscribed to route ${route_id}`);
  });

  // Leave room
  socket.on('unsubscribe:route', (route_id) => {
    socket.leave(`route-${route_id}`);
    console.log(`User ${socket.id} unsubscribed from route ${route_id}`);
  });

  // Broadcast vehicle update
  socket.on('vehicle:update', (data) => {
    const { route_id, vehicle_id, current_location, latitude, longitude, passenger_count, status } = data;
    io.to(`route-${route_id}`).emit('vehicle:updated', {
      vehicle_id,
      current_location,
      latitude,
      longitude,
      passenger_count,
      status,
      timestamp: new Date().toISOString()
    });
  });

  // Broadcast new report
  socket.on('report:created', (data) => {
    io.emit('new:report', {
      id: data.id,
      type: data.type,
      location: data.location,
      description: data.description,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
  });

  // Broadcast schedule change
  socket.on('schedule:changed', (data) => {
    const { route_id } = data;
    io.to(`route-${route_id}`).emit('schedule:updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

module.exports = app;
