import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  // Logging détaillé
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    code,
    message,
    userId: (req as any).userId || 'anonymous',
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  console.error('Error:', JSON.stringify(logData, null, 2));

  // Réponse structurée
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        path: req.path,
        method: req.method,
      }),
    },
  });
};

// Helper pour créer des erreurs personnalisées
export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

