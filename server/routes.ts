import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import apiRoutes from './api';

export async function registerRoutes(app: Express): Promise<Server> {
  // Use API routes
  app.use('/api', apiRoutes);
  
  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("API Error:", err);
    res.status(500).json({ 
      error: "An unexpected error occurred", 
      message: err.message 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
