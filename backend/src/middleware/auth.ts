/**
 * API Key Authentication Middleware
 * Проверяет наличие и корректность API ключа в заголовке X-API-KEY
 */

import { Request, Response, NextFunction } from 'express';

export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  if (!expectedApiKey) {
    console.error('⚠️  API_KEY не настроен в .env файле!');
    return res.status(500).json({ 
      error: 'Server configuration error' 
    });
  }

  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'X-API-KEY header is required'
    });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  next();
}


