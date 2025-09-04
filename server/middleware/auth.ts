import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth";
import { storage } from "../storage";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        fullName: string;
        lgp360Data?: any;
        lgp360UploadedAt?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate users via JWT token
 * Sets req.user with authenticated user data
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify token using existing auth utility
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

/**
 * Middleware to require admin role
 * Must be used after authenticateUser middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

/**
 * Middleware to require user role (regular user or admin)
 * Must be used after authenticateUser middleware
 */
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!['user', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: "User access required" });
  }

  next();
};