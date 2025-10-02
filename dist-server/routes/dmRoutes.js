import express from "express";
import { storage } from "../storage.js";
import { pushService } from "../services/pushNotifications.js";
const router = express.Router();
async function canSendDM(senderId, receiverId) {
  const blocked = await storage.getBlockedUserIdsFor(receiverId);
  if (blocked.includes(senderId)) return false;
  const receiver = await storage.getUser(receiverId);
  if (!receiver) return false;
  const privacy = receiver.dmPrivacy || "everyone";
  if (privacy === "everyone") return true;
  if (privacy === "nobody") return false;
  if (privacy === "connections") {
    const conn = await storage.getConnectionBetween(senderId, receiverId);
    return !!(conn && conn.status === "accepted");
  }
  return false;
}
router.get("/:userId", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const currentUserId = parseInt(String(req.session.userId));
  const otherUserId = parseInt(req.params.userId);
  try {
    const chat = await storage.getDirectMessages(currentUserId, otherUserId);
    res.json(chat);
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});
router.post("/send", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const senderId = parseInt(String(req.session.userId));
  const { receiverId, content } = req.body;
  if (!content) return res.status(400).send("Message content required");
  try {
    const message = await storage.createDirectMessage({
      senderId,
      receiverId: parseInt(receiverId),
      content
    });
    try {
      const sender = await storage.getUser(senderId);
      await pushService.sendToUser({
        userId: parseInt(receiverId),
        title: `New message from ${sender?.displayName || sender?.username}`,
        body: String(content).substring(0, 100),
        category: "dm",
        data: { type: "dm", senderId, messageId: message.id }
      });
    } catch (pushErr) {
      console.error("Failed to send push notification for DM:", pushErr);
    }
    res.json(message);
  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
});
var dmRoutes_default = router;
export {
  dmRoutes_default as default
};
