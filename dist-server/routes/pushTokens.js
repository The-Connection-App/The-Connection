import express from "express";
import { storage } from "../storage.js";
import { isAuthenticated } from "../auth.js";
const router = express.Router();
router.post("/register", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.session.userId);
    const { token, platform } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }
    const pushToken = await storage.savePushToken({
      userId,
      token,
      platform: platform || "unknown",
      lastUsed: /* @__PURE__ */ new Date()
    });
    res.json(pushToken);
  } catch (error) {
    console.error("Error registering push token:", error);
    res.status(500).json({ message: "Error registering push token" });
  }
});
router.delete("/unregister", isAuthenticated, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }
    await storage.deletePushToken(token);
    res.json({ message: "Token unregistered" });
  } catch (error) {
    console.error("Error unregistering push token:", error);
    res.status(500).json({ message: "Error unregistering push token" });
  }
});
var pushTokens_default = router;
export {
  pushTokens_default as default
};
