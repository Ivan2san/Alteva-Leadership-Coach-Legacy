import type { Express } from "express";
import { signupSchema, loginSchema } from "@shared/schema";
import { storage } from "./storage";
import { generateToken, hashPassword } from "./auth";
import { z } from "zod";

export function registerAuthRoutes(app: Express) {
  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validationResult = signupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid signup data", 
          details: validationResult.error.errors 
        });
      }

      const { email, password, fullName, role } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      // Create user (omit confirmPassword for storage)
      const user = await storage.createUser({
        email,
        password,
        fullName,
        role: role || 'user'
      });

      // Generate token
      const token = generateToken(user.id);

      // Set cookie with development-friendly settings
      console.log("Setting cookie for signup:", { userId: user.id, token: token.slice(0, 20) + "..." });
      
      // Try multiple cookie approaches for development
      res.cookie('authToken', token, {
        httpOnly: false, // Allow JS access for debugging
        secure: false,
        sameSite: 'none',
        path: '/',
        domain: undefined, // Don't specify domain for localhost
        maxAge: 24 * 60 * 60 * 1000
      });
      
      // Also set a backup non-httpOnly cookie for testing
      res.cookie('authToken_backup', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid login data", 
          details: validationResult.error.errors 
        });
      }

      const { email, password } = validationResult.data;

      // Validate credentials
      const user = await storage.validateLogin(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate token
      const token = generateToken(user.id);

      // Set cookie with development-friendly settings
      console.log("Setting cookie for login:", { userId: user.id, token: token.slice(0, 20) + "..." });
      
      // Try multiple cookie approaches for development
      res.cookie('authToken', token, {
        httpOnly: false, // Allow JS access for debugging
        secure: false,
        sameSite: 'none',
        path: '/',
        domain: undefined, // Don't specify domain for localhost
        maxAge: 24 * 60 * 60 * 1000
      });
      
      // Also set a backup non-httpOnly cookie for testing
      res.cookie('authToken_backup', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log("Auth check - all cookies:", req.cookies);
      console.log("Auth check - headers:", req.headers.cookie);
      const token = req.cookies?.authToken || req.cookies?.authToken_backup;
      console.log("Auth check - token found:", !!token);
      if (token) {
        console.log("Auth check - token preview:", token.slice(0, 20) + "...");
      }
      
      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { verifyToken } = await import("./auth");
      const decoded = verifyToken(token);
      console.log("Auth check - token decoded:", !!decoded);
      
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const user = await storage.getUser(decoded.userId);
      console.log("Auth check - user found:", !!user);
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      console.log("Auth check - success for user:", user.email);
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin-only: Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const { requireAdmin } = await import("./auth");
      await new Promise<void>((resolve, reject) => {
        requireAdmin(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const users = await storage.getAllUsers();
      // Remove passwords from all users
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}