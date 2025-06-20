require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const { graphqlHTTP } = require('express-graphql');
const { dbConnection } = require('./config/database');
const schema = require('./graphql/schema');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bandRoutes = require('./routes/bands');
const songRoutes = require('./routes/songs');
const setlistRoutes = require('./routes/setlists');
const performanceRoutes = require('./routes/performances');
const { authenticateToken } = require('./middleware/auth');
const { setupSocketHandlers } = require('./socket/handlers');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to database
dbConnection()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/bands', authenticateToken, bandRoutes);
app.use('/api/songs', authenticateToken, songRoutes);
app.use('/api/setlists', authenticateToken, setlistRoutes);
app.use('/api/performances', authenticateToken, performanceRoutes);

// GraphQL endpoint
app.use('/graphql', authenticateToken, graphqlHTTP({
  schema,
  graphiql: process.env.NODE_ENV !== 'production'
}));

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };