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

// Parse PORT correctly - Railway provides it as a string
const PORT = parseInt(process.env.PORT || '5000', 10);

// Validate PORT
if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
  console.error(`❌ Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

console.log(`📍 Using PORT: ${PORT}`);

// Middleware - UPDATED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5176',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://bookit-frontend.vercel.app',
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
  res.status(200).json({
    status: 'OK',
    message: 'BookIt API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
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
    console.log('🔄 Testing database connection...');
    await testConnection();

    // Start listening on 0.0.0.0 (IMPORTANT FOR RAILWAY)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Host: 0.0.0.0`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`📚 API documentation: http://0.0.0.0:${PORT}/api`);
      console.log(`🎯 Experiences: http://0.0.0.0:${PORT}/api/experiences`);
      console.log(`📦 Bookings: http://0.0.0.0:${PORT}/api/bookings`);
      console.log(`🎟️  Promo codes: http://0.0.0.0:${PORT}/api/promo`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;