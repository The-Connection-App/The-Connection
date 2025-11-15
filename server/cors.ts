import cors from "cors";

const DEV = process.env.NODE_ENV !== "production";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://<your-vercel-app>.vercel.app",
  "https://app.theconnection.app",
  "capacitor://localhost",
];

// Patterns for Vercel preview/production deployments
// Matches: the-connection-*.vercel.app or custom Vercel domains
// Allows dots in branch names (e.g., feature.branch-name-abc123.vercel.app)
const VERCEL_PATTERN = /^https:\/\/[a-z0-9.-]+\.vercel\.app$/i;

export function makeCors() {
  const allowlist = new Set<string | undefined>([undefined, ...DEFAULT_ALLOWED_ORIGINS]);
  const extraOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const origin of extraOrigins) {
    allowlist.add(origin);
  }

  // SECURITY FIX: In development, only allow localhost origins
  const DEV_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ];

  return cors({
    origin: (origin, cb) => {
      // SECURITY: Development mode still enforces origin checking
      if (DEV) {
        // Allow undefined origin (same-origin requests, Postman, curl)
        if (!origin) return cb(null, true);

        // Check if origin is in development allowlist
        if (DEV_ALLOWED_ORIGINS.includes(origin)) {
          return cb(null, true);
        }

        // Deny other origins even in development
        console.warn(`[CORS] Blocked origin in development: ${origin}`);
        return cb(null, false);
      }

      // Production mode: check against allowlist and patterns
      if (origin && VERCEL_PATTERN.test(origin)) {
        return cb(null, true);
      }

      return cb(null, allowlist.has(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });
}
