import { Expo } from "expo-server-sdk";
import { storage } from "../storage.js";
const expo = new Expo();
class PushNotificationService {
  /**
   * Send push notification to a user
   */
  async sendToUser(payload) {
    try {
      const user = await storage.getUser(payload.userId);
      if (!user) return;
      const notificationEnabled = this.isNotificationEnabled(user, payload.category);
      if (!notificationEnabled) {
        console.log(`User ${payload.userId} has ${payload.category} notifications disabled`);
        return;
      }
      const tokens = await storage.getUserPushTokens(payload.userId);
      if (!tokens || tokens.length === 0) {
        console.log(`No push tokens found for user ${payload.userId}`);
        return;
      }
      const messages = tokens.filter((token) => Expo.isExpoPushToken(token.token)).map((token) => ({
        to: token.token,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        priority: "high"
      }));
      if (messages.length === 0) return;
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log("Push notification sent:", ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
        }
      }
    } catch (error) {
      console.error("Error in sendToUser:", error);
    }
  }
  /**
   * Check if user has specific notification type enabled
   */
  isNotificationEnabled(user, category) {
    switch (category) {
      case "dm":
        return user.notifyDMs !== false;
      case "community":
        return user.notifyCommunities !== false;
      case "forum":
        return user.notifyForums !== false;
      case "feed":
        return user.notifyFeed !== false;
      default:
        return true;
    }
  }
  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds, payload) {
    const promises = userIds.map(
      (userId) => this.sendToUser({ ...payload, userId })
    );
    await Promise.allSettled(promises);
  }
}
const pushService = new PushNotificationService();
export {
  PushNotificationService,
  pushService
};
