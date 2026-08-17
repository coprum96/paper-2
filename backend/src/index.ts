/**
 * Backend API для сбора данных игры "Золотой Детектор"
 * Принимает игровые сессии и сохраняет их в PostgreSQL
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sessionRouter } from './routes/sessions';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';

// Загрузка переменных окружения
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API routes
app.use('/api/sessions', sessionRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend API запущен на порту ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/sessions`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM получен, graceful shutdown...');
  server.close(() => {
    console.log('HTTP server закрыт');
  });
  
  await prisma.$disconnect();
  console.log('Database connection закрыт');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT получен, graceful shutdown...');
  server.close(() => {
    console.log('HTTP server закрыт');
  });
  
  await prisma.$disconnect();
  console.log('Database connection закрыт');
  process.exit(0);
});

export default app;


