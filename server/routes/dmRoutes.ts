import express from "express";
import { storage } from "../storage";
import { pushService } from "../services/pushNotifications";

const router = express.Router();

// Helper: Check if users are connected or if privacy allows DMs
async function canSendDM(senderId: number, receiverId: number): Promise<boolean> {
  // Blocked users should not be able to send
  const blocked = await storage.getBlockedUserIdsFor(receiverId);
  if (blocked.includes(senderId)) return false;

  const receiver = await storage.getUser(receiverId);
  if (!receiver) return false;

  // dmPrivacy: 'everyone' | 'connections' | 'nobody'
  const privacy = (receiver as any).dmPrivacy || 'everyone';
  if (privacy === 'everyone') return true;
  if (privacy === 'nobody') return false;

  // connections -> require an accepted connection
  if (privacy === 'connections') {
    const conn = await storage.getConnectionBetween(senderId, receiverId);
    return !!(conn && conn.status === 'accepted');
  }

  return false;
}

// Fetch DMs between two users
router.get("/:userId", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const currentUserId = parseInt(String(req.session.userId)); // Logged-in user
  const otherUserId = parseInt(req.params.userId);

  try {
    const chat = await storage.getDirectMessages(currentUserId, otherUserId);
    res.json(chat);
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new DM
router.post("/send", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const senderId = parseInt(String(req.session.userId));
  const { receiverId, content } = req.body;

  if (!content) return res.status(400).send("Message content required");

  try {
    const message = await storage.createDirectMessage({
      senderId: senderId,
      receiverId: parseInt(receiverId),
      content: content
    });

    // Fire a push notification to the receiver (best-effort)
    try {
      const sender = await storage.getUser(senderId);
      await pushService.sendToUser({
        userId: parseInt(receiverId),
        title: `New message from ${sender?.displayName || sender?.username}`,
        body: String(content).substring(0, 100),
        category: "dm",
        data: { type: "dm", senderId, messageId: message.id },
      });
    } catch (pushErr) {
      console.error('Failed to send push notification for DM:', pushErr);
    }

    res.json(message);
  } catch (error) {
    console.error('Error sending direct message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

export default router;