import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { storage } from "../storage";

const expo = new Expo();

interface NotificationPayload {
  userId: number;
  title: string;
  body: string;
  data?: any;
  category: "dm" | "community" | "forum" | "feed";
}

export class PushNotificationService {
  /**
   * Send push notification to a user
   */
  async sendToUser(payload: NotificationPayload): Promise<void> {
    try {
      // Get user's notification preferences
      const user = await storage.getUser(payload.userId);
      if (!user) return;

      // Check if user has this notification type enabled
      const notificationEnabled = this.isNotificationEnabled(user, payload.category);
      if (!notificationEnabled) {
        console.log(`User ${payload.userId} has ${payload.category} notifications disabled`);
        return;
      }

      // Get user's push tokens
      const tokens = await storage.getUserPushTokens(payload.userId);
      if (!tokens || tokens.length === 0) {
        console.log(`No push tokens found for user ${payload.userId}`);
        return;
      }

      // Build messages
      const messages: ExpoPushMessage[] = tokens
        .filter((token) => Expo.isExpoPushToken(token.token))
        .map((token) => ({
          to: token.token,
          sound: "default",
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          priority: "high",
        }));

      if (messages.length === 0) return;

      // Send notifications in chunks
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
  private isNotificationEnabled(user: any, category: string): boolean {
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
  async sendToUsers(userIds: number[], payload: Omit<NotificationPayload, "userId">): Promise<void> {
    const promises = userIds.map((userId) =>
      this.sendToUser({ ...payload, userId })
    );
    await Promise.allSettled(promises);
  }
}

export const pushService = new PushNotificationService();
