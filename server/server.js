const express      = require('express');
const http         = require('http');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { helmetConfig, apiLimiter, sanitize, jsonParser, errorHandler } = require('./middleware/securityMiddleware');

const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const jobRoutes          = require('./routes/jobRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');
const promotionRoutes    = require('./routes/promotionRoutes');
const orgRoutes          = require('./routes/orgRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const scoringRoutes      = require('./routes/scoringRoutes');
const searchRoutes       = require('./routes/searchRoutes');

const socketService = require('./services/socketService');

const app    = express();
const server = http.createServer(app);

// Security headers
app.use(helmetConfig);

// CORS
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  if (origin.endsWith('.vercel.app') || origin === 'https://vactrix.vercel.app') return true;
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  return false;
};

app.use(cors({
  origin: (origin, cb) => {
    if (isOriginAllowed(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(jsonParser);          // express.json({ limit: '10kb' })
app.use(sanitize);            // body-only mongo sanitize (Express 5 safe)
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/promotions',    promotionRoutes);
app.use('/api/org',           orgRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/scoring',       scoringRoutes);
app.use('/api/search',        searchRoutes);

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  message: 'Vactrix API running',
  timestamp: new Date().toISOString(),
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vactrix';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected →', MONGO_URI);
    socketService.init(server);
    console.log('Socket.IO initialized');
    server.listen(PORT, () => {
      console.log(`\nVactrix API  →  http://localhost:${PORT}`);
      console.log(`   Health       →  http://localhost:${PORT}/health\n`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
