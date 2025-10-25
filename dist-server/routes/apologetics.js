import { Router } from "express";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
const router = Router();

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.get("/apologetics", rateLimiter, (_req, res) => {
  try {
    const env = process.env.NODE_ENV || "development";
    const candidates = [
      path.resolve(process.cwd(), "web", "public", "apologetics.json"),
      path.resolve(process.cwd(), "public", "apologetics.json"),
      path.resolve(process.cwd(), "dist", "public", "apologetics.json")
    ];
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, "utf-8");
        return res.json(JSON.parse(data));
      }
    }
    return res.json([]);
  } catch (err) {
    console.error("Error serving apologetics:", err);
    return res.json([]);
  }
});
var apologetics_default = router;
export {
  apologetics_default as default
};
