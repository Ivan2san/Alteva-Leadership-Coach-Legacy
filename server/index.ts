import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAdminUser, migrateExistingData } from "./seed-admin";

const app = express();
// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Add cookie parser middleware

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Add health check endpoints
    app.get("/health", (req, res) => {
      res.status(200).json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Smart root endpoint: health check for Cloud Run, React app for browsers
    app.get("/", (req, res, next) => {
      // Cloud Run and other automated health checks typically don't send Accept: text/html
      const userAgent = req.get('User-Agent') || '';
      const acceptsHtml = req.accepts('html');
      
      // If this looks like an automated health check request
      if (!acceptsHtml || userAgent.includes('GoogleHC') || userAgent.includes('kube-probe') || userAgent.includes('curl')) {
        return res.status(200).json({ 
          status: "healthy", 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      }
      
      // For browser requests, continue to serve React app
      next();
    });

    // Register routes after health checks
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Server error:", err);
      res.status(status).json({ message });
      // Don't throw error - log and continue to keep server alive
    });

    // Fix environment detection for production deployment
    const isProduction = process.env.NODE_ENV === "production";
    
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (!isProduction) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    await new Promise<void>((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        
        log(`serving on port ${port}`);
        resolve();
        
        // Initialize database seeding after server is ready
        // Run in background to not block server startup
        if (process.env.NODE_ENV !== 'test') {
          // Use setImmediate to ensure this doesn't block the event loop
          setImmediate(async () => {
            try {
              console.log("Starting background database initialization...");
              const adminUser = await seedAdminUser();
              if (adminUser) {
                await migrateExistingData(adminUser.id);
              }
              console.log("Background database initialization completed");
            } catch (error) {
              console.error("Background database initialization failed:", error);
              // Don't crash the server - log and continue
            }
          });
        }
      });
    });
    
  } catch (error) {
    console.error("Fatal server startup error:", error);
    process.exit(1);
  }
})().catch((error) => {
  console.error("Unhandled server error:", error);
  process.exit(1);
});
