require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const httpLogger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS'));
}, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(hpp());
app.use(compression());

const sanitize = (value) => {
  if (Array.isArray(value)) return value.forEach(sanitize);
  if (!value || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) delete value[key];
    else if (typeof value[key] === 'string') value[key] = value[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    else sanitize(value[key]);
  }
  return value;
};
app.use((req, res, next) => { sanitize(req.body); sanitize(req.params); next(); });
if (process.env.NODE_ENV !== 'test') app.use(httpLogger);

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many requests, please try again later.' } }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts, please try again later.' } }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

let server;
if (require.main === module) {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required. Copy server/.env.example to server/.env and configure it first.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace_this_')) {
    console.error('JWT_SECRET must be set to a random value of at least 32 characters.');
    process.exit(1);
  }
  connectDB().then(() => {
    const port = Number(process.env.PORT) || 5000;
    server = app.listen(port, '0.0.0.0', () => console.log(`API ready on port ${port}`));
  });
  process.on('unhandledRejection', (error) => {
    console.error(`Unhandled rejection: ${error.message}`);
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });
}

module.exports = app;
