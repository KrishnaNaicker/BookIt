import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import experiencesRouter from './routes/experiences';
import bookingsRouter from './routes/bookings';
import promoRouter from './routes/promo';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware - UPDATED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5176',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'BookIt API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to BookIt API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      experiences: '/api/experiences',
      experienceDetails: '/api/experiences/:id',
      categories: '/api/experiences/categories',
      search: '/api/experiences/search?q=term',
      bookings: '/api/bookings',
      promo: '/api/promo/validate'
    }
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'BookIt API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      api: '/api',
      experiences: '/api/experiences',
      bookings: '/api/bookings',
      promo: '/api/promo'
    }
  });
});

// Mount routers
app.use('/api/experiences', experiencesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/promo', promoRouter);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with database connection test
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API documentation: http://localhost:${PORT}/api`);
      console.log(`🎯 Experiences: http://localhost:${PORT}/api/experiences`);
      console.log(`📦 Bookings: http://localhost:${PORT}/api/bookings`);
      console.log(`🎟️  Promo codes: http://localhost:${PORT}/api/promo`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;