import express from "express";
import { storage } from "../storage";
// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Fetch user settings
router.get("/settings", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
  const resolvedUserId = typeof userId === 'number' ? userId : parseInt(String(userId));
  const user = await storage.getUser(resolvedUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without sensitive fields
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Error fetching user settings' });
  }
});

// Update user settings
router.put("/settings", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
  const { displayName, email, bio, city, state, zipCode, notifyDMs, notifyCommunities, notifyForums, notifyFeed } = req.body;
    
    // Only allow updating specific fields
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    
  const resolvedUserId2 = typeof userId === 'number' ? userId : parseInt(String(userId));
  await storage.updateUser(resolvedUserId2, updateData);
    // Update notification preferences if provided
    const notifPrefs: any = {};
    if (notifyDMs !== undefined) notifPrefs.notifyDMs = notifyDMs;
    if (notifyCommunities !== undefined) notifPrefs.notifyCommunities = notifyCommunities;
    if (notifyForums !== undefined) notifPrefs.notifyForums = notifyForums;
    if (notifyFeed !== undefined) notifPrefs.notifyFeed = notifyFeed;
    if (Object.keys(notifPrefs).length > 0) {
      await storage.updateNotificationPreferences(resolvedUserId2, notifPrefs);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Error updating user settings' });
  }
});

export default router;