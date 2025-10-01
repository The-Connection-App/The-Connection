import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import cors from 'cors';
import { setupVite, serveStatic, log } from "./vite.js";
// Seed imports removed for production
import { initializeEmailTemplates } from "./email";
import { runAllMigrations } from "./run-migrations";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { User } from "@shared/schema";
import { APP_DOMAIN, BASE_URL } from "./config/domain";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

// Load environment variables from .env file
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Session store: use Postgres-backed store only when USE_DB=true; otherwise
// fall back to the default in-memory store for a lightweight MVP run.
const USE_DB = process.env.USE_DB === 'true';
let sessionOptions: any = {
  secret: process.env.SESSION_SECRET || "theconnection-session-secret",
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Explicit session name
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: false, // Disable secure for development
    httpOnly: true,
    sameSite: 'lax' // Allow cross-origin requests in development
  }
};

if (USE_DB) {
  // Set up PostgreSQL session store
  const PgSessionStore = connectPgSimple(session);
  const sessionStore = new PgSessionStore({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true
  });

  sessionOptions.store = sessionStore;
}

app.use(session(sessionOptions));

// Initialize passport with proper serialization
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user: Express.User, done) => {
  // If running without DB, store the whole user object in session (best-effort)
  try {
    const uid = (user as any).id ?? user;
    done(null, uid);
  } catch (e) {
    done(null, user as any);
  }
});

passport.deserializeUser(async (id: number, done) => {
  if (!USE_DB) {
    // In DB-less mode we can't look up users; return null so req.user won't be set.
    return done(null, null);
  }

  try {
    const { storage } = await import("./storage");
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable minimal CORS for the mobile wrapper and local dev
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost',
    'capacitor://localhost',
    process.env.BASE_URL || ''
  ].filter(Boolean),
  credentials: true
}));

  // Development auto-login middleware (optional)
  // If DEV_AUTHS=true and DEV_USER_ID is set, automatically set req.session.userId
  // This is intentionally guarded to only run in non-production to avoid security risks.
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTHS === 'true') {
    app.use(async (req, _res, next) => {
      try {
        const devUserId = Number(process.env.DEV_USER_ID || 0);
        if (devUserId && !req.session?.userId) {
          req.session.userId = devUserId;
        }
      } catch (e) {
        // ignore
      }
      next();
    });
  }

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
  // Run migrations for locality and interest features
  try {
    if (USE_DB) {
      await runAllMigrations();

      // Run organization migrations
      const { runOrganizationMigrations } = await import("./run-migrations-organizations");
      await runOrganizationMigrations();

      console.log("✅ Database migrations completed");
    } else {
      console.log("⚠️ Skipping database migrations because USE_DB != 'true'");
    }
  } catch (error) {
    console.error("❌ Error running database migrations:", error);
  }
  
  // Initialize email templates
  try {
    await initializeEmailTemplates();
  } catch (error) {
    console.error("Error initializing email templates:", error);
    // Continue with server startup even if email template initialization fails
  }
  
  const server = await registerRoutes(app, httpServer);

  // If SENTRY_DSN is provided, dynamically import Sentry and initialize it
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import("@sentry/node");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "production",
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.0),
      });

      // Request handler should be the first middleware for Sentry
      app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
    } catch (err) {
      console.warn("Sentry failed to initialize:", err);
    }
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Re-throw so Sentry error handler (if present) can capture
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Read port from environment (DigitalOcean App Platform sets $PORT)
  const port = Number(process.env.PORT) || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
