import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { pathToFileURL } from "url";
import { createRequire } from "module";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const require = createRequire(import.meta.url);
  const webRoot = path.resolve(process.cwd(), "apps/web");
  const configFile = path.resolve(webRoot, "vite.config.ts");

  // Use `any` to avoid strict ServerOptions typing mismatches across vite versions
  const serverOptions: any = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  // If not running in development, don't attempt to load vite at all.
  const isDev = app.get("env") === "development" || process.env.NODE_ENV === "development";
  if (!isDev) return;

  // Dynamically import vite and create a logger only when needed in development.
  let createViteServer: any;
  let createLogger: any;
  try {
    const viteModulePath = require.resolve("vite", { paths: [webRoot] });
    const viteModule: any = await import(pathToFileURL(viteModulePath).href);
    createViteServer = viteModule.createServer ?? viteModule.default?.createServer;
    createLogger = viteModule.createLogger ?? viteModule.default?.createLogger;
    if (!createViteServer || !createLogger) {
      throw new Error("Failed to load Vite createServer/createLogger exports");
    }
  } catch (e) {
    // If vite isn't available, log and skip Vite setup rather than crashing the process.
    console.warn("Vite not found; skipping development middleware.", e);
    return;
  }

  const viteLogger = createLogger();

  const vite = await createViteServer({
    root: webRoot,
    configFile,
    customLogger: {
      ...viteLogger,
      error: (msg: any, options: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(webRoot, "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const candidates = [
    path.resolve(process.cwd(), "apps/web/dist"),
    path.resolve(process.cwd(), "dist/public"),
  ];

  const distPath = candidates.find((p) => fs.existsSync(p));

  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Checked: ${candidates.join(", ")}. Build the client first.`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
