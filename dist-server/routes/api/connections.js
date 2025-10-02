import express from "express";
import { storage } from "../../storage.js";
import { insertConnectionSchema } from "../../shared/schema.js";
const router = express.Router();
router.post("/", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
  const senderId = Number(req.session.userId);
  try {
    const parseResult = insertConnectionSchema.safeParse({ userId: senderId, connectedUserId: Number(req.body.connectedUserId), status: "pending" });
    if (!parseResult.success) return res.status(400).json({ message: "Invalid payload", errors: parseResult.error.errors });
    const conn = await storage.createConnection(parseResult.data);
    res.status(201).json(conn);
  } catch (err) {
    console.error("Error creating connection:", err);
    res.status(500).json({ message: "Error creating connection" });
  }
});
router.get("/", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
  const userId = Number(req.session.userId);
  try {
    const connections = await storage.getConnectionsFor(userId);
    res.json(connections);
  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(500).json({ message: "Error fetching connections" });
  }
});
router.post("/:id/accept", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
  const userId = Number(req.session.userId);
  const connectionId = Number(req.params.id);
  try {
    const result = await storage.updateConnectionStatus(connectionId, "accepted", userId);
    res.json(result);
  } catch (err) {
    console.error("Error accepting connection:", err);
    res.status(500).json({ message: "Error accepting connection" });
  }
});
router.post("/:id/reject", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
  const userId = Number(req.session.userId);
  const connectionId = Number(req.params.id);
  try {
    const result = await storage.updateConnectionStatus(connectionId, "blocked", userId);
    res.json(result);
  } catch (err) {
    console.error("Error rejecting connection:", err);
    res.status(500).json({ message: "Error rejecting connection" });
  }
});
router.get("/status/:userId", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
  const userId = Number(req.session.userId);
  const otherId = Number(req.params.userId);
  try {
    const conn = await storage.getConnectionBetween(userId, otherId);
    res.json(conn || null);
  } catch (err) {
    console.error("Error checking connection status:", err);
    res.status(500).json({ message: "Error checking connection status" });
  }
});
var connections_default = router;
export {
  connections_default as default
};
