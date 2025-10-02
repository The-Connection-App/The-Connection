import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = express.Router();

// Register push token
router.post("/register", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.session.userId!);
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const pushToken = await storage.savePushToken({
      userId,
      token,
      platform: platform || "unknown",
      lastUsed: new Date(),
    } as any);

    res.json(pushToken);
  } catch (error) {
    console.error("Error registering push token:", error);
    res.status(500).json({ message: "Error registering push token" });
  }
});

// Delete push token (logout/uninstall)
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

export default router;
