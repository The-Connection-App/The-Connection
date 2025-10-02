import {
  users,
  communities,
  communityWallPosts,
  groupMembers,
  connections,
  pushTokens,
  livestreams,
  events,
  prayerRequests,
  livestreamerApplications,
  apologistScholarApplications,
  messages,
  contentReports,
  userBlocks
} from "./shared/schema.js";
import { db } from "./db.js";
import { eq, and, or, desc, inArray, like } from "drizzle-orm";
import { whereNotDeleted } from "./db/helpers.js";
import { geocodeAddress } from "./geocoding.js";
import softDelete from "./db/softDelete.js";
class StorageSafety {
  static implementedMethods = /* @__PURE__ */ new Set([
    "getUser",
    "getUserById",
    "getUserByUsername",
    "getUserByEmail",
    "searchUsers",
    "getAllUsers",
    "updateUser",
    "createUser",
    "updateUserPassword",
    "setVerifiedApologeticsAnswerer",
    "getVerifiedApologeticsAnswerers",
    "getAllCommunities",
    "searchCommunities",
    "getPublicCommunitiesAndUserCommunities",
    "getCommunity",
    "getCommunityBySlug",
    "createCommunity",
    "updateCommunity",
    "deleteCommunity",
    "getCommunityMembers",
    "getCommunityMember",
    "getUserCommunities",
    "addCommunityMember",
    "updateCommunityMemberRole",
    "removeCommunityMember",
    "isCommunityMember",
    "isCommunityOwner",
    "isCommunityModerator",
    "createCommunityInvitation",
    "getCommunityInvitations",
    "getCommunityInvitationByToken",
    "getCommunityInvitationById",
    "updateCommunityInvitationStatus",
    "deleteCommunityInvitation",
    "getCommunityInvitationByEmailAndCommunity",
    "getCommunityRooms",
    "getPublicCommunityRooms",
    "getCommunityRoom",
    "createCommunityRoom",
    "updateCommunityRoom",
    "deleteCommunityRoom",
    "getChatMessages",
    "getChatMessagesAfter",
    "createChatMessage",
    "deleteChatMessage",
    "getCommunityWallPosts",
    "getCommunityWallPost",
    "createCommunityWallPost",
    "updateCommunityWallPost",
    "deleteCommunityWallPost",
    "getAllPosts",
    "getPost",
    "getPostsByCommunitySlug",
    "getPostsByGroupId",
    "getUserPosts",
    "createPost",
    "upvotePost",
    "getComment",
    "getCommentsByPostId",
    "createComment",
    "upvoteComment",
    "getGroup",
    "getGroupsByUserId",
    "createGroup",
    "addGroupMember",
    "getGroupMembers",
    "isGroupAdmin",
    "isGroupMember",
    "getAllApologeticsResources",
    "getApologeticsResource",
    "createApologeticsResource",
    "getPublicPrayerRequests",
    "getAllPrayerRequests",
    "getPrayerRequest",
    "getUserPrayerRequests",
    "getGroupPrayerRequests",
    "getPrayerRequestsVisibleToUser",
    "createPrayerRequest",
    "updatePrayerRequest",
    "markPrayerRequestAsAnswered",
    "deletePrayerRequest",
    "createPrayer",
    "getPrayersForRequest",
    "getUserPrayedRequests",
    "getAllApologeticsTopics",
    "getApologeticsTopic",
    "getApologeticsTopicBySlug",
    "createApologeticsTopic",
    "getAllApologeticsQuestions",
    "getApologeticsQuestion",
    "getApologeticsQuestionsByTopic",
    "createApologeticsQuestion",
    "updateApologeticsQuestionStatus",
    "getApologeticsAnswersByQuestion",
    "createApologeticsAnswer",
    "getAllEvents",
    "getEvent",
    "getUserEvents",
    "createEvent",
    "updateEvent",
    "deleteEvent",
    "createEventRSVP",
    "getEventRSVPs",
    "getUserEventRSVP",
    "updateEventRSVP",
    "deleteEventRSVP",
    "getAllMicroblogs",
    "getMicroblog",
    "getUserMicroblogs",
    "createMicroblog",
    "updateMicroblog",
    "deleteMicroblog",
    "likeMicroblog",
    "unlikeMicroblog",
    "getUserLikedMicroblogs",
    "getAllLivestreams",
    "createLivestream",
    "getLivestreamerApplicationByUserId",
    "getPendingLivestreamerApplications",
    "createLivestreamerApplication",
    "updateLivestreamerApplication",
    "isApprovedLivestreamer",
    "getApologistScholarApplicationByUserId",
    "getPendingApologistScholarApplications",
    "createApologistScholarApplication",
    "updateApologistScholarApplication",
    "getAllLivestreamerApplications",
    "getAllApologistScholarApplications",
    "getLivestreamerApplicationStats",
    "updateLivestreamerApplicationStatus",
    "deleteUser",
    "getAllBibleReadingPlans",
    "getBibleReadingPlan",
    "createBibleReadingPlan",
    "getBibleReadingProgress",
    "createBibleReadingProgress",
    "markDayCompleted",
    "getBibleStudyNotes",
    "getBibleStudyNote",
    "createBibleStudyNote",
    "updateBibleStudyNote",
    "deleteBibleStudyNote",
    "getDirectMessages",
    "createDirectMessage",
    "updateUserPreferences",
    "getUserPreferences"
  ]);
  static isMethodImplemented(methodName) {
    return this.implementedMethods.has(methodName);
  }
  static createSafeFallback(methodName, fallback) {
    if (!this.isMethodImplemented(methodName)) {
      console.warn(`Method ${methodName} not fully implemented, using fallback`);
    }
    return fallback;
  }
}
class MemStorage {
  data = {
    users: [],
    communities: [
      {
        id: 1,
        name: "Prayer Requests",
        description: "Share your prayer requests and pray for others in the community.",
        slug: "prayer-requests",
        iconName: "pray",
        iconColor: "primary",
        interestTags: JSON.stringify(["prayer", "support", "community"]),
        city: null,
        state: null,
        isLocalCommunity: false,
        latitude: null,
        longitude: null,
        memberCount: 1,
        createdBy: 1,
        isPrivate: false,
        hasPrivateWall: true,
        hasPublicWall: true,
        createdAt: /* @__PURE__ */ new Date(),
        deletedAt: null
      },
      {
        id: 2,
        name: "Bible Study",
        description: "Discuss and study the Bible together with fellow believers.",
        slug: "bible-study",
        iconName: "book",
        iconColor: "secondary",
        interestTags: JSON.stringify(["bible", "study", "scripture"]),
        city: null,
        state: null,
        isLocalCommunity: false,
        latitude: null,
        longitude: null,
        memberCount: 1,
        createdBy: 1,
        isPrivate: false,
        hasPrivateWall: true,
        hasPublicWall: true,
        createdAt: /* @__PURE__ */ new Date(),
        deletedAt: null
      },
      {
        id: 3,
        name: "Christian Apologetics",
        description: "Discuss and learn about defending the Christian faith.",
        slug: "apologetics",
        iconName: "shield",
        iconColor: "accent",
        interestTags: JSON.stringify(["apologetics", "defense", "faith"]),
        city: null,
        state: null,
        isLocalCommunity: false,
        latitude: null,
        longitude: null,
        memberCount: 1,
        createdBy: 1,
        isPrivate: false,
        hasPrivateWall: true,
        hasPublicWall: true,
        createdAt: /* @__PURE__ */ new Date(),
        deletedAt: null
      }
    ],
    communityMembers: [],
    communityInvitations: [],
    communityChatRooms: [],
    chatMessages: [],
    communityWallPosts: [],
    posts: [],
    comments: [],
    groups: [],
    groupMembers: [],
    apologeticsResources: [],
    livestreams: [],
    prayerRequests: [],
    prayers: [],
    apologeticsTopics: [],
    apologeticsQuestions: [],
    apologeticsAnswers: [],
    events: [],
    eventRsvps: [],
    microblogs: [],
    microblogLikes: [],
    livestreamerApplications: [],
    apologistScholarApplications: [],
    bibleReadingPlans: [],
    bibleReadingProgress: [],
    bibleStudyNotes: [],
    userPreferences: [],
    messages: [],
    connections: [],
    // Moderation in-memory stores
    contentReports: [],
    userBlocks: []
  };
  nextId = 1;
  // User methods
  async getUser(id) {
    return this.data.users.find((u) => u.id === id);
  }
  async getUserById(id) {
    return this.getUser(id);
  }
  async getUserByUsername(username) {
    return this.data.users.find((u) => u.username === username);
  }
  async getUserByEmail(email) {
    return this.data.users.find((u) => u.email === email);
  }
  async searchUsers(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.data.users.filter(
      (u) => u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.displayName?.toLowerCase().includes(term)
    );
  }
  async getAllUsers() {
    return this.data.users.filter((u) => !u.deletedAt).map((u) => ({ ...u }));
  }
  async updateUser(id, userData) {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) throw new Error("User not found");
    this.data.users[userIndex] = { ...this.data.users[userIndex], ...userData };
    return this.data.users[userIndex];
  }
  async updateUserPreferences(userId, preferences) {
    let userPref = this.data.userPreferences.find((p) => p.userId === userId);
    if (!userPref) {
      userPref = {
        id: this.nextId++,
        userId,
        interests: null,
        favoriteTopics: null,
        engagementHistory: null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.data.userPreferences.push(userPref);
    }
    Object.assign(userPref, preferences, { updatedAt: /* @__PURE__ */ new Date() });
    return userPref;
  }
  async getUserPreferences(userId) {
    return this.data.userPreferences.find((p) => p.userId === userId);
  }
  async createUser(user) {
    const newUser = {
      id: this.nextId++,
      username: user.username,
      email: user.email,
      password: user.password,
      displayName: user.displayName || user.username,
      bio: user.bio || null,
      avatarUrl: user.avatarUrl || null,
      city: user.city || null,
      state: user.state || null,
      zipCode: user.zipCode || null,
      latitude: user.latitude || null,
      longitude: user.longitude || null,
      onboardingCompleted: user.onboardingCompleted || false,
      dmPrivacy: user.dmPrivacy || "everyone",
      notifyDMs: user.notifyDMs !== void 0 ? user.notifyDMs : true,
      notifyCommunities: user.notifyCommunities !== void 0 ? user.notifyCommunities : true,
      notifyForums: user.notifyForums !== void 0 ? user.notifyForums : true,
      notifyFeed: user.notifyFeed !== void 0 ? user.notifyFeed : true,
      isVerifiedApologeticsAnswerer: false,
      isAdmin: user.isAdmin || false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      deletedAt: null
    };
    this.data.users.push(newUser);
    return newUser;
  }
  // Push token in-memory storage
  // ...existing code...
  async getUserPushTokens(userId) {
    const store = this.data.pushTokens;
    if (!store) return [];
    return store.filter((t) => t.userId === userId);
  }
  async savePushToken(token) {
    if (!this.data.pushTokens) this.data.pushTokens = [];
    const store = this.data.pushTokens;
    const t = token;
    const existing = store.find((s) => s.token === t.token);
    if (existing) {
      existing.lastUsed = /* @__PURE__ */ new Date();
      existing.userId = t.userId;
      existing.platform = t.platform;
      return existing;
    }
    const newToken = {
      id: this.nextId++,
      userId: t.userId,
      token: t.token,
      platform: t.platform,
      createdAt: /* @__PURE__ */ new Date(),
      lastUsed: /* @__PURE__ */ new Date()
    };
    store.push(newToken);
    return newToken;
  }
  async updateNotificationPreferences(userId, preferences) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    Object.assign(user, preferences);
  }
  async deletePushToken(token) {
    const store = this.data.pushTokens;
    if (!store) return true;
    const idx = store.findIndex((t) => t.token === token);
    if (idx === -1) return true;
    store.splice(idx, 1);
    return true;
  }
  async updateUserPassword(userId, hashedPassword) {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      user.password = hashedPassword;
      return user;
    }
    return void 0;
  }
  async setVerifiedApologeticsAnswerer(userId, isVerified) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.isVerifiedApologeticsAnswerer = isVerified;
    return user;
  }
  async getVerifiedApologeticsAnswerers() {
    return this.data.users.filter((u) => u.isVerifiedApologeticsAnswerer && !u.deletedAt);
  }
  // Community methods
  async getAllCommunities() {
    return this.data.communities.filter((c) => !c.deletedAt).map((c) => ({ ...c }));
  }
  async searchCommunities(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.data.communities.filter(
      (c) => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
    );
  }
  async getPublicCommunitiesAndUserCommunities(userId, searchQuery) {
    let communities2 = this.data.communities.filter((c) => !c.isPrivate && !c.deletedAt);
    if (userId) {
      const userCommunities = this.data.communityMembers.filter((m) => m.userId === userId).map((m) => this.data.communities.find((c) => c.id === m.communityId)).filter(Boolean);
      const communityMap = /* @__PURE__ */ new Map();
      [...communities2, ...userCommunities].forEach((c) => communityMap.set(c.id, c));
      communities2 = Array.from(communityMap.values());
    }
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      communities2 = communities2.filter(
        (c) => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
      );
    }
    return communities2;
  }
  async getCommunity(id) {
    return this.data.communities.find((c) => c.id === id && !c.deletedAt);
  }
  async getCommunityBySlug(slug) {
    return this.data.communities.find((c) => c.slug === slug && !c.deletedAt);
  }
  async createCommunity(community) {
    const newCommunity = {
      id: this.nextId++,
      name: community.name,
      description: community.description,
      slug: community.slug,
      iconName: community.iconName,
      iconColor: community.iconColor,
      interestTags: community.interestTags || [],
      city: community.city || null,
      state: community.state || null,
      isLocalCommunity: community.isLocalCommunity || false,
      latitude: community.latitude || null,
      longitude: community.longitude || null,
      memberCount: 0,
      isPrivate: community.isPrivate || false,
      hasPrivateWall: community.hasPrivateWall || false,
      hasPublicWall: community.hasPublicWall || true,
      createdAt: /* @__PURE__ */ new Date(),
      deletedAt: null,
      createdBy: community.createdBy
    };
    this.data.communities.push(newCommunity);
    return newCommunity;
  }
  async updateCommunity(id, community) {
    const index = this.data.communities.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Community not found");
    this.data.communities[index] = { ...this.data.communities[index], ...community };
    return this.data.communities[index];
  }
  async deleteCommunity(id) {
    const comm = this.data.communities.find((c) => c.id === id);
    if (!comm) return false;
    comm.deletedAt = /* @__PURE__ */ new Date();
    return true;
  }
  // Community invitation methods
  async createCommunityInvitation(invitation) {
    const newInvitation = {
      id: this.nextId++,
      communityId: invitation.communityId,
      inviterUserId: invitation.inviterUserId,
      inviteeEmail: invitation.inviteeEmail,
      inviteeUserId: invitation.inviteeUserId || null,
      status: invitation.status || "pending",
      token: invitation.token,
      createdAt: /* @__PURE__ */ new Date(),
      expiresAt: invitation.expiresAt
    };
    this.data.communityInvitations.push(newInvitation);
    return newInvitation;
  }
  async getCommunityInvitations(communityId) {
    return this.data.communityInvitations.filter((i) => i.communityId === communityId).map((i) => ({
      ...i,
      inviter: this.data.users.find((u) => u.id === i.inviterUserId)
    }));
  }
  async getCommunityInvitationByToken(token) {
    return this.data.communityInvitations.find((i) => i.token === token);
  }
  async getCommunityInvitationById(id) {
    return this.data.communityInvitations.find((i) => i.id === id);
  }
  async updateCommunityInvitationStatus(id, status) {
    const invitation = this.data.communityInvitations.find((i) => i.id === id);
    if (!invitation) throw new Error("Invitation not found");
    invitation.status = status;
    return invitation;
  }
  async deleteCommunityInvitation(id) {
    const index = this.data.communityInvitations.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.data.communityInvitations.splice(index, 1);
    return true;
  }
  async getCommunityInvitationByEmailAndCommunity(email, communityId) {
    return this.data.communityInvitations.find((i) => i.inviteeEmail === email && i.communityId === communityId);
  }
  // Community member methods
  async getCommunityMembers(communityId) {
    return this.data.communityMembers.filter((m) => m.communityId === communityId).map((m) => ({
      ...m,
      user: this.data.users.find((u) => u.id === m.userId)
    }));
  }
  async getCommunityMember(communityId, userId) {
    return this.data.communityMembers.find((m) => m.communityId === communityId && m.userId === userId);
  }
  async getUserCommunities(userId) {
    const userMemberships = this.data.communityMembers.filter((m) => m.userId === userId);
    return userMemberships.map((m) => {
      const community = this.data.communities.find((c) => c.id === m.communityId);
      const memberCount = this.data.communityMembers.filter((mem) => mem.communityId === community.id).length;
      return { ...community, memberCount };
    });
  }
  async addCommunityMember(member) {
    const newMember = {
      id: this.nextId++,
      communityId: member.communityId,
      userId: member.userId,
      role: member.role || "member",
      joinedAt: /* @__PURE__ */ new Date()
    };
    this.data.communityMembers.push(newMember);
    const community = this.data.communities.find((c) => c.id === member.communityId);
    if (community) {
      community.memberCount = (community.memberCount || 0) + 1;
    }
    return newMember;
  }
  async updateCommunityMemberRole(id, role) {
    const member = this.data.communityMembers.find((m) => m.id === id);
    if (!member) throw new Error("Member not found");
    member.role = role;
    return member;
  }
  async removeCommunityMember(communityId, userId) {
    const index = this.data.communityMembers.findIndex((m) => m.communityId === communityId && m.userId === userId);
    if (index === -1) return false;
    this.data.communityMembers.splice(index, 1);
    const community = this.data.communities.find((c) => c.id === communityId);
    if (community && community.memberCount > 0) {
      community.memberCount--;
    }
    return true;
  }
  async isCommunityMember(communityId, userId) {
    return this.data.communityMembers.some((m) => m.communityId === communityId && m.userId === userId);
  }
  async isCommunityOwner(communityId, userId) {
    const member = await this.getCommunityMember(communityId, userId);
    return member?.role === "owner";
  }
  async isCommunityModerator(communityId, userId) {
    const member = await this.getCommunityMember(communityId, userId);
    return member?.role === "moderator" || member?.role === "owner";
  }
  // Community chat room methods
  async getCommunityRooms(communityId) {
    return this.data.communityChatRooms.filter((r) => r.communityId === communityId);
  }
  async getPublicCommunityRooms(communityId) {
    return this.data.communityChatRooms.filter((r) => r.communityId === communityId && !r.isPrivate);
  }
  async getCommunityRoom(id) {
    return this.data.communityChatRooms.find((r) => r.id === id);
  }
  async createCommunityRoom(room) {
    const newRoom = {
      id: this.nextId++,
      communityId: room.communityId,
      name: room.name,
      description: room.description || null,
      isPrivate: room.isPrivate || false,
      createdAt: /* @__PURE__ */ new Date(),
      createdBy: room.createdBy
    };
    this.data.communityChatRooms.push(newRoom);
    return newRoom;
  }
  async updateCommunityRoom(id, data) {
    const room = this.data.communityChatRooms.find((r) => r.id === id);
    if (!room) throw new Error("Room not found");
    Object.assign(room, data);
    return room;
  }
  async deleteCommunityRoom(id) {
    const index = this.data.communityChatRooms.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.data.communityChatRooms.splice(index, 1);
    return true;
  }
  // Chat message methods
  async getChatMessages(roomId, limit) {
    const messages2 = this.data.chatMessages.filter((m) => m.chatRoomId === roomId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((m) => ({
      ...m,
      sender: this.data.users.find((u) => u.id === m.senderId)
    }));
    return limit ? messages2.slice(-limit) : messages2;
  }
  async getChatMessagesAfter(roomId, afterId) {
    const afterMessage = this.data.chatMessages.find((m) => m.id === afterId);
    if (!afterMessage) return [];
    return this.data.chatMessages.filter((m) => m.chatRoomId === roomId && new Date(m.createdAt).getTime() > new Date(afterMessage.createdAt).getTime()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((m) => ({
      ...m,
      sender: this.data.users.find((u) => u.id === m.senderId)
    }));
  }
  async createChatMessage(message) {
    const newMessage = {
      id: this.nextId++,
      content: message.content,
      chatRoomId: message.chatRoomId,
      senderId: message.senderId,
      isSystemMessage: message.isSystemMessage || false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.chatMessages.push(newMessage);
    return newMessage;
  }
  async deleteChatMessage(id) {
    const index = this.data.chatMessages.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.data.chatMessages.splice(index, 1);
    return true;
  }
  // Community wall post methods
  async getCommunityWallPosts(communityId, isPrivate) {
    const posts2 = this.data.communityWallPosts.filter((p) => p.communityId === communityId && (isPrivate === void 0 || p.isPrivate === isPrivate)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((p) => ({
      ...p,
      author: this.data.users.find((u) => u.id === p.authorId)
    }));
    return posts2;
  }
  async getCommunityWallPost(id) {
    const post = this.data.communityWallPosts.find((p) => p.id === id);
    if (!post) return void 0;
    return {
      ...post,
      author: this.data.users.find((u) => u.id === post.authorId)
    };
  }
  async createCommunityWallPost(post) {
    const newPost = {
      id: this.nextId++,
      likeCount: 0,
      commentCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      deletedAt: null,
      ...post
    };
    this.data.communityWallPosts.push(newPost);
    return newPost;
  }
  async updateCommunityWallPost(id, data) {
    const post = this.data.communityWallPosts.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    Object.assign(post, data);
    return post;
  }
  async deleteCommunityWallPost(id) {
    const post = this.data.communityWallPosts.find((p) => p.id === id);
    if (!post) return false;
    post.deletedAt = /* @__PURE__ */ new Date();
    return true;
  }
  // Post methods
  async getAllPosts(filter) {
    let posts2 = this.data.posts.filter((p) => !p.deletedAt);
    if (filter === "top") {
      posts2.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (filter === "hot") {
      posts2.sort((a, b) => {
        const aScore = (a.upvotes || 0) / Math.max(1, Math.floor((Date.now() - new Date(a.createdAt).getTime()) / (1e3 * 60 * 60)));
        const bScore = (b.upvotes || 0) / Math.max(1, Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1e3 * 60 * 60)));
        return bScore - aScore;
      });
    } else {
      posts2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return posts2;
  }
  async getPost(id) {
    return this.data.posts.find((p) => p.id === id && !p.deletedAt);
  }
  async getPostsByCommunitySlug(communitySlug, filter) {
    const community = this.data.communities.find((c) => c.slug === communitySlug);
    if (!community) return [];
    let posts2 = this.data.posts.filter((p) => p.communityId === community.id && !p.deletedAt);
    if (filter === "top") {
      posts2.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (filter === "hot") {
      posts2.sort((a, b) => {
        const aScore = (a.upvotes || 0) / Math.max(1, Math.floor((Date.now() - new Date(a.createdAt).getTime()) / (1e3 * 60 * 60)));
        const bScore = (b.upvotes || 0) / Math.max(1, Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1e3 * 60 * 60)));
        return bScore - aScore;
      });
    } else {
      posts2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return posts2;
  }
  async getPostsByGroupId(groupId, filter) {
    let posts2 = this.data.posts.filter((p) => p.groupId === groupId && !p.deletedAt);
    if (filter === "top") {
      posts2.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (filter === "hot") {
      posts2.sort((a, b) => {
        const aScore = (a.upvotes || 0) / Math.max(1, Math.floor((Date.now() - new Date(a.createdAt).getTime()) / (1e3 * 60 * 60)));
        const bScore = (b.upvotes || 0) / Math.max(1, Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1e3 * 60 * 60)));
        return bScore - aScore;
      });
    } else {
      posts2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return posts2;
  }
  async getUserPosts(userId) {
    const posts2 = this.data.posts.filter((p) => p.authorId === userId && !p.deletedAt);
    const microblogs2 = this.data.microblogs.filter((m) => m.authorId === userId);
    const wallPosts = this.data.communityWallPosts.filter((p) => p.authorId === userId);
    return [
      ...posts2.map((p) => ({ ...p, type: "post" })),
      ...microblogs2.map((m) => ({ ...m, type: "microblog" })),
      ...wallPosts.map((p) => ({ ...p, type: "wall_post" }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createPost(post) {
    const newPost = {
      id: this.nextId++,
      upvotes: 0,
      commentCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      deletedAt: null,
      ...post
    };
    this.data.posts.push(newPost);
    return newPost;
  }
  async upvotePost(id) {
    const post = this.data.posts.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    post.upvotes = (post.upvotes || 0) + 1;
    return post;
  }
  // Comment methods
  async getComment(id) {
    return this.data.comments.find((c) => c.id === id);
  }
  async getCommentsByPostId(postId) {
    return this.data.comments.filter((c) => c.postId === postId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createComment(comment) {
    const newComment = {
      id: this.nextId++,
      upvotes: 0,
      createdAt: /* @__PURE__ */ new Date(),
      ...comment
    };
    this.data.comments.push(newComment);
    const post = this.data.posts.find((p) => p.id === newComment.postId);
    if (post) {
      post.commentCount = (post.commentCount || 0) + 1;
    }
    return newComment;
  }
  async upvoteComment(id) {
    const comment = this.data.comments.find((c) => c.id === id);
    if (!comment) throw new Error("Comment not found");
    comment.upvotes = (comment.upvotes || 0) + 1;
    return comment;
  }
  // Group methods
  async getGroup(id) {
    return this.data.groups.find((g) => g.id === id);
  }
  async getGroupsByUserId(userId) {
    const userGroups = this.data.groupMembers.filter((m) => m.userId === userId);
    return userGroups.map((m) => this.data.groups.find((g) => g.id === m.groupId));
  }
  async createGroup(group) {
    const newGroup = {
      id: this.nextId++,
      createdAt: /* @__PURE__ */ new Date(),
      ...group
    };
    this.data.groups.push(newGroup);
    return newGroup;
  }
  // Group member methods
  async addGroupMember(member) {
    const newMember = {
      id: this.nextId++,
      groupId: member.groupId,
      userId: member.userId,
      isAdmin: member.isAdmin || false,
      joinedAt: /* @__PURE__ */ new Date()
    };
    this.data.groupMembers.push(newMember);
    return newMember;
  }
  async getGroupMembers(groupId) {
    return this.data.groupMembers.filter((m) => m.groupId === groupId);
  }
  async isGroupAdmin(groupId, userId) {
    const member = this.data.groupMembers.find((m) => m.groupId === groupId && m.userId === userId);
    return member?.isAdmin === true;
  }
  async isGroupMember(groupId, userId) {
    return this.data.groupMembers.some((m) => m.groupId === groupId && m.userId === userId);
  }
  // Apologetics resource methods
  async getAllApologeticsResources() {
    return [...this.data.apologeticsResources];
  }
  async getApologeticsResource(id) {
    return this.data.apologeticsResources.find((r) => r.id === id);
  }
  async createApologeticsResource(resource) {
    const newResource = {
      id: this.nextId++,
      createdAt: /* @__PURE__ */ new Date(),
      ...resource
    };
    this.data.apologeticsResources.push(newResource);
    return newResource;
  }
  // Prayer request methods
  async getPublicPrayerRequests() {
    return this.data.prayerRequests.filter((p) => p.privacyLevel === "public").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getAllPrayerRequests(filter) {
    let requests = [...this.data.prayerRequests];
    if (filter === "answered") {
      requests = requests.filter((p) => p.isAnswered);
    } else if (filter === "unanswered") {
      requests = requests.filter((p) => !p.isAnswered);
    }
    return requests.map((p) => ({ ...p, description: p.title }));
  }
  async getPrayerRequest(id) {
    const request = this.data.prayerRequests.find((p) => p.id === id);
    return request ? { ...request, description: request.title } : void 0;
  }
  async getUserPrayerRequests(userId) {
    return this.data.prayerRequests.filter((p) => p.authorId === userId).map((p) => ({ ...p, description: p.title }));
  }
  async getGroupPrayerRequests(groupId) {
    return this.data.prayerRequests.filter((p) => p.groupId === groupId).map((p) => ({ ...p, description: p.title }));
  }
  async getPrayerRequestsVisibleToUser(userId) {
    const userGroups = this.data.groupMembers.filter((gm) => gm.userId === userId).map((gm) => gm.groupId);
    return this.data.prayerRequests.filter((p) => {
      if (p.privacyLevel === "public") return true;
      if (p.privacyLevel === "group-only" && p.groupId && userGroups.includes(p.groupId)) return true;
      if (p.authorId === userId) return true;
      return false;
    }).map((p) => ({ ...p, description: p.title }));
  }
  async createPrayerRequest(prayer) {
    const newPrayer = {
      id: this.nextId++,
      title: prayer.title,
      content: prayer.content,
      isAnonymous: prayer.isAnonymous,
      privacyLevel: prayer.privacyLevel,
      groupId: prayer.groupId,
      authorId: prayer.authorId,
      prayerCount: 0,
      isAnswered: false,
      answeredDescription: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: null
    };
    this.data.prayerRequests.push(newPrayer);
    return newPrayer;
  }
  async updatePrayerRequest(id, prayer) {
    const request = this.data.prayerRequests.find((p) => p.id === id);
    if (!request) throw new Error("Prayer request not found");
    Object.assign(request, prayer, { updatedAt: /* @__PURE__ */ new Date() });
    return request;
  }
  async markPrayerRequestAsAnswered(id, description) {
    const request = this.data.prayerRequests.find((p) => p.id === id);
    if (!request) throw new Error("Prayer request not found");
    request.isAnswered = true;
    request.answeredDescription = description;
    request.updatedAt = /* @__PURE__ */ new Date();
    return request;
  }
  async deletePrayerRequest(id) {
    const index = this.data.prayerRequests.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.prayerRequests.splice(index, 1);
    return true;
  }
  // Prayer methods
  async createPrayer(prayer) {
    const newPrayer = {
      id: this.nextId++,
      userId: prayer.userId,
      prayerRequestId: prayer.prayerRequestId,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.prayers.push(newPrayer);
    const request = this.data.prayerRequests.find((p) => p.id === prayer.prayerRequestId);
    if (request) {
      request.prayerCount = (request.prayerCount || 0) + 1;
    }
    return newPrayer;
  }
  async getPrayersForRequest(prayerRequestId) {
    return this.data.prayers.filter((p) => p.prayerRequestId === prayerRequestId);
  }
  async getUserPrayedRequests(userId) {
    const userPrayers = this.data.prayers.filter((p) => p.userId === userId);
    return Array.from(new Set(userPrayers.map((p) => p.prayerRequestId)));
  }
  // Apologetics Q&A methods
  async getAllApologeticsTopics() {
    return [...this.data.apologeticsTopics];
  }
  async getApologeticsTopic(id) {
    return this.data.apologeticsTopics.find((t) => t.id === id);
  }
  async getApologeticsTopicBySlug(slug) {
    return this.data.apologeticsTopics.find((t) => t.slug === slug);
  }
  async createApologeticsTopic(topic) {
    const newTopic = {
      id: this.nextId++,
      createdAt: /* @__PURE__ */ new Date(),
      ...topic
    };
    this.data.apologeticsTopics.push(newTopic);
    return newTopic;
  }
  async getAllApologeticsQuestions(filterByStatus) {
    let questions = [...this.data.apologeticsQuestions];
    if (filterByStatus) {
      questions = questions.filter((q) => q.status === filterByStatus);
    }
    return questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getApologeticsQuestion(id) {
    return this.data.apologeticsQuestions.find((q) => q.id === id);
  }
  async getApologeticsQuestionsByTopic(topicId) {
    return this.data.apologeticsQuestions.filter((q) => q.topicId === topicId);
  }
  async createApologeticsQuestion(question) {
    const newQuestion = {
      id: this.nextId++,
      title: question.title,
      content: question.content,
      authorId: question.authorId,
      topicId: question.topicId,
      status: question.status || "pending",
      answerCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      viewCount: 0
    };
    this.data.apologeticsQuestions.push(newQuestion);
    const topic = this.data.apologeticsTopics.find((t) => t.id === question.topicId);
    if (topic) {
      topic.questionCount = (topic.questionCount || 0) + 1;
    }
    return newQuestion;
  }
  async updateApologeticsQuestionStatus(id, status) {
    const question = this.data.apologeticsQuestions.find((q) => q.id === id);
    if (!question) throw new Error("Question not found");
    question.status = status;
    return question;
  }
  async getApologeticsAnswersByQuestion(questionId) {
    return this.data.apologeticsAnswers.filter((a) => a.questionId === questionId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createApologeticsAnswer(answer) {
    const newAnswer = {
      id: this.nextId++,
      content: answer.content,
      authorId: answer.authorId,
      questionId: answer.questionId,
      isVerifiedAnswer: answer.isVerifiedAnswer || false,
      upvotes: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.apologeticsAnswers.push(newAnswer);
    return newAnswer;
  }
  // Event methods
  async getAllEvents() {
    return this.data.events.filter((e) => !e.deletedAt).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }
  async getEvent(id) {
    return this.data.events.find((e) => e.id === id && !e.deletedAt);
  }
  async getUserEvents(userId) {
    return this.data.events.filter((e) => e.creatorId === userId && !e.deletedAt);
  }
  async createEvent(event) {
    const newEvent = {
      id: this.nextId++,
      ...event,
      createdAt: /* @__PURE__ */ new Date()
    };
    newEvent.rsvpCount = 0;
    this.data.events.push(newEvent);
    return newEvent;
  }
  async updateEvent(id, data) {
    const event = this.data.events.find((e) => e.id === id);
    if (!event) throw new Error("Event not found");
    Object.assign(event, data);
    return event;
  }
  async deleteEvent(id) {
    const ev = this.data.events.find((e) => e.id === id);
    if (!ev) return false;
    ev.deletedAt = /* @__PURE__ */ new Date();
    return true;
  }
  // Event RSVP methods
  async createEventRSVP(rsvp) {
    const newRsvp = {
      id: this.nextId++,
      userId: rsvp.userId,
      status: rsvp.status,
      eventId: rsvp.eventId,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.eventRsvps.push(newRsvp);
    const event = this.data.events.find((e) => e.id === rsvp.eventId);
    if (event) {
      event.rsvpCount = (event.rsvpCount || 0) + 1;
    }
    return newRsvp;
  }
  async getEventRSVPs(eventId) {
    return this.data.eventRsvps.filter((r) => r.eventId === eventId);
  }
  async getUserEventRSVP(eventId, userId) {
    return this.data.eventRsvps.find((r) => r.eventId === eventId && r.userId === userId);
  }
  async updateEventRSVP(id, status) {
    const rsvp = this.data.eventRsvps.find((r) => r.id === id);
    if (!rsvp) throw new Error("RSVP not found");
    rsvp.status = status;
    return rsvp;
  }
  async deleteEventRSVP(id) {
    const index = this.data.eventRsvps.findIndex((r) => r.id === id);
    if (index === -1) return false;
    const rsvp = this.data.eventRsvps[index];
    this.data.eventRsvps.splice(index, 1);
    const event = this.data.events.find((e) => e.id === rsvp.eventId);
    if (event && event.rsvpCount > 0) {
      event.rsvpCount--;
    }
    return true;
  }
  // Livestream methods
  async getAllLivestreams() {
    return [...this.data.livestreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createLivestream(livestream) {
    const newLivestream = {
      id: this.nextId++,
      title: livestream.title,
      description: livestream.description || null,
      createdAt: /* @__PURE__ */ new Date(),
      status: "upcoming",
      hostId: livestream.hostId,
      thumbnail: livestream.thumbnail || null,
      viewerCount: 0,
      scheduledFor: livestream.scheduledFor,
      duration: livestream.duration || null,
      tags: livestream.tags || null,
      streamUrl: livestream.streamUrl || null,
      isLive: livestream.isLive || false
    };
    this.data.livestreams.push(newLivestream);
    return newLivestream;
  }
  // Microblog methods
  async getAllMicroblogs() {
    return [...this.data.microblogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getMicroblog(id) {
    return this.data.microblogs.find((m) => m.id === id);
  }
  async getUserMicroblogs(userId) {
    return this.data.microblogs.filter((m) => m.authorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createMicroblog(microblog) {
    const newMicroblog = {
      id: this.nextId++,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      ...microblog
    };
    this.data.microblogs.push(newMicroblog);
    return newMicroblog;
  }
  async updateMicroblog(id, data) {
    const microblog = this.data.microblogs.find((m) => m.id === id);
    if (!microblog) throw new Error("Microblog not found");
    Object.assign(microblog, data);
    return microblog;
  }
  async deleteMicroblog(id) {
    const mb = this.data.microblogs.find((m) => m.id === id);
    if (!mb) return false;
    mb.deletedAt = /* @__PURE__ */ new Date();
    return true;
  }
  // Microblog like methods
  async likeMicroblog(microblogId, userId) {
    const existingLike = this.data.microblogLikes.find((l) => l.microblogId === microblogId && l.userId === userId);
    if (existingLike) {
      throw new Error("Already liked");
    }
    const newLike = {
      id: this.nextId++,
      microblogId,
      userId,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.microblogLikes.push(newLike);
    const microblog = this.data.microblogs.find((m) => m.id === microblogId);
    if (microblog) {
      microblog.likeCount = (microblog.likeCount || 0) + 1;
    }
    return newLike;
  }
  async unlikeMicroblog(microblogId, userId) {
    const index = this.data.microblogLikes.findIndex((l) => l.microblogId === microblogId && l.userId === userId);
    if (index === -1) return false;
    this.data.microblogLikes.splice(index, 1);
    const microblog = this.data.microblogs.find((m) => m.id === microblogId);
    if (microblog && microblog.likeCount > 0) {
      microblog.likeCount--;
    }
    return true;
  }
  async getUserLikedMicroblogs(userId) {
    const userLikes = this.data.microblogLikes.filter((l) => l.userId === userId);
    return userLikes.map((l) => this.data.microblogs.find((m) => m.id === l.microblogId));
  }
  // Livestreamer application methods
  async getLivestreamerApplicationByUserId(userId) {
    return this.data.livestreamerApplications.find((a) => a.userId === userId);
  }
  async getPendingLivestreamerApplications() {
    return this.data.livestreamerApplications.filter((a) => a.status === "pending");
  }
  async createLivestreamerApplication(application) {
    const newApplication = {
      id: this.nextId++,
      ...application,
      status: "pending",
      reviewNotes: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: /* @__PURE__ */ new Date()
    };
    this.data.livestreamerApplications.push(newApplication);
    return newApplication;
  }
  async updateLivestreamerApplication(id, status, reviewNotes, reviewerId) {
    const application = this.data.livestreamerApplications.find((a) => a.id === id);
    if (!application) throw new Error("Application not found");
    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = reviewerId;
    application.reviewedAt = /* @__PURE__ */ new Date();
    return application;
  }
  async isApprovedLivestreamer(userId) {
    const application = this.data.livestreamerApplications.find((a) => a.userId === userId && a.status === "approved");
    return !!application;
  }
  // Apologist Scholar application methods
  async getApologistScholarApplicationByUserId(userId) {
    return this.data.apologistScholarApplications.find((a) => a.userId === userId);
  }
  async getPendingApologistScholarApplications() {
    return this.data.apologistScholarApplications.filter((a) => a.status === "pending");
  }
  async createApologistScholarApplication(application) {
    const newApplication = {
      id: this.nextId++,
      ...application,
      status: "pending",
      reviewNotes: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: /* @__PURE__ */ new Date()
    };
    this.data.apologistScholarApplications.push(newApplication);
    return newApplication;
  }
  async updateApologistScholarApplication(id, status, reviewNotes, reviewerId) {
    const application = this.data.apologistScholarApplications.find((a) => a.id === id);
    if (!application) throw new Error("Application not found");
    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = reviewerId;
    application.reviewedAt = /* @__PURE__ */ new Date();
    return application;
  }
  // Bible Reading Plan methods
  async getAllBibleReadingPlans() {
    return [...this.data.bibleReadingPlans];
  }
  async getBibleReadingPlan(id) {
    return this.data.bibleReadingPlans.find((p) => p.id === id);
  }
  async createBibleReadingPlan(plan) {
    const newPlan = {
      id: this.nextId++,
      title: plan.title,
      description: plan.description,
      groupId: plan.groupId,
      duration: plan.duration,
      isPublic: plan.isPublic,
      creatorId: plan.creatorId,
      readings: plan.readings,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.bibleReadingPlans.push(newPlan);
    return newPlan;
  }
  // Bible Reading Progress methods
  async getBibleReadingProgress(userId, planId) {
    return this.data.bibleReadingProgress.find((p) => p.userId === userId && p.planId === planId);
  }
  async createBibleReadingProgress(progress) {
    const newProgress = {
      id: this.nextId++,
      currentDay: 1,
      completedDays: "[]",
      startedAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      ...progress
    };
    this.data.bibleReadingProgress.push(newProgress);
    return newProgress;
  }
  async markDayCompleted(progressId, day) {
    const progress = this.data.bibleReadingProgress.find((p) => p.id === progressId);
    if (!progress) throw new Error("Progress not found");
    let completedDays;
    try {
      completedDays = JSON.parse(progress.completedDays || "[]");
    } catch {
      completedDays = [];
    }
    if (!completedDays.includes(day)) {
      completedDays.push(day);
      progress.completedDays = JSON.stringify(completedDays);
      progress.currentDay = (progress.currentDay || 1) + 1;
    }
    return progress;
  }
  // Bible Study Note methods
  async getBibleStudyNotes(userId) {
    return this.data.bibleStudyNotes.filter((n) => n.userId === userId);
  }
  async getBibleStudyNote(id) {
    return this.data.bibleStudyNotes.find((n) => n.id === id);
  }
  async createBibleStudyNote(note) {
    const newNote = {
      id: this.nextId++,
      title: note.title,
      isPublic: note.isPublic,
      groupId: note.groupId,
      userId: note.userId,
      content: note.content,
      passage: note.passage,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.data.bibleStudyNotes.push(newNote);
    return newNote;
  }
  async updateBibleStudyNote(id, data) {
    const note = this.data.bibleStudyNotes.find((n) => n.id === id);
    if (!note) throw new Error("Note not found");
    Object.assign(note, data, { updatedAt: /* @__PURE__ */ new Date() });
    return note;
  }
  async deleteBibleStudyNote(id) {
    const index = this.data.bibleStudyNotes.findIndex((n) => n.id === id);
    if (index === -1) return false;
    this.data.bibleStudyNotes.splice(index, 1);
    return true;
  }
  // Admin methods
  async getAllLivestreamerApplications() {
    return [...this.data.livestreamerApplications];
  }
  async getAllApologistScholarApplications() {
    return [...this.data.apologistScholarApplications];
  }
  async getLivestreamerApplicationStats() {
    const all = this.data.livestreamerApplications;
    return {
      total: all.length,
      pending: all.filter((a) => a.status === "pending").length,
      approved: all.filter((a) => a.status === "approved").length,
      rejected: all.filter((a) => a.status === "rejected").length
    };
  }
  async updateLivestreamerApplicationStatus(id, status, reviewNotes) {
    const application = this.data.livestreamerApplications.find((a) => a.id === id);
    if (!application) throw new Error("Application not found");
    application.status = status;
    if (reviewNotes) application.reviewNotes = reviewNotes;
    application.reviewedAt = /* @__PURE__ */ new Date();
    return application;
  }
  async deleteUser(userId) {
    const index = this.data.users.findIndex((u) => u.id === userId);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    return true;
  }
  // Direct Messaging methods
  async getDirectMessages(userId1, userId2) {
    return this.data.messages.filter(
      (m) => m.senderId === userId1 && m.receiverId === userId2 || m.senderId === userId2 && m.receiverId === userId1
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  async createDirectMessage(message) {
    const newMessage = {
      id: crypto.randomUUID(),
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.messages.push(newMessage);
    return newMessage;
  }
  // Connection methods
  async getConnectionBetween(userId1, userId2) {
    return this.data.connections.find(
      (c) => c.userId === userId1 && c.connectedUserId === userId2 || c.userId === userId2 && c.connectedUserId === userId1
    );
  }
  async createConnection(connection) {
    const newConnection = {
      id: this.nextId++,
      userId: connection.userId,
      connectedUserId: connection.connectedUserId,
      status: connection.status || "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.connections.push(newConnection);
    return newConnection;
  }
  async getConnectionsFor(userId) {
    return this.data.connections.filter((c) => c.userId === userId || c.connectedUserId === userId);
  }
  async updateConnectionStatus(connectionId, status, actingUserId) {
    const connIdx = this.data.connections.findIndex((c) => c.id === connectionId);
    if (connIdx === -1) throw new Error("Connection not found");
    const conn = this.data.connections[connIdx];
    if (status === "accepted") {
      if (conn.connectedUserId !== actingUserId) throw new Error("Not authorized to accept this connection");
      conn.status = "accepted";
      return conn;
    }
    if (status === "blocked") {
      if (conn.connectedUserId !== actingUserId && conn.userId !== actingUserId) throw new Error("Not authorized to block this connection");
      conn.status = "blocked";
      return conn;
    }
    if (conn.connectedUserId === actingUserId || conn.userId === actingUserId) {
      conn.status = status;
      return conn;
    }
    throw new Error("Not authorized to update this connection");
  }
  // Moderation methods (in-memory)
  async createContentReport(report) {
    const newReport = {
      id: this.nextId++,
      reporterId: report.reporterId,
      contentType: report.contentType,
      contentId: report.contentId,
      reason: report.reason || "other",
      description: report.description || null,
      status: "pending",
      moderatorId: null,
      moderatorNotes: null,
      resolvedAt: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.data.contentReports.push(newReport);
    return newReport;
  }
  async createUserBlock(block) {
    const exists = this.data.userBlocks.find((b) => b.blockerId === block.blockerId && b.blockedId === block.blockedId);
    if (exists) return exists;
    const newBlock = {
      id: this.nextId++,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      reason: block.reason || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.data.userBlocks.push(newBlock);
    return newBlock;
  }
  async getBlockedUserIdsFor(blockerId) {
    return this.data.userBlocks.filter((b) => b.blockerId === blockerId).map((b) => b.blockedId);
  }
  // Admin moderation helpers (in-memory)
  async getReports(filter) {
    let rows = this.data.contentReports.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
    if (filter?.limit) rows = rows.slice(0, filter.limit);
    return rows;
  }
  async getReportById(id) {
    return this.data.contentReports.find((r) => r.id === id);
  }
  async updateReport(id, update) {
    const idx = this.data.contentReports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Report not found");
    const existing = this.data.contentReports[idx];
    const updated = { ...existing, ...update, updatedAt: /* @__PURE__ */ new Date() };
    this.data.contentReports[idx] = updated;
    return updated;
  }
}
class DbStorage {
  // User methods
  async getUser(id) {
    const result = await db.select().from(users).where(and(eq(users.id, id), whereNotDeleted(users)));
    return result[0];
  }
  async getUserById(id) {
    return this.getUser(id);
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(and(eq(users.username, username), whereNotDeleted(users)));
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(and(eq(users.email, email), whereNotDeleted(users)));
    return result[0];
  }
  async searchUsers(searchTerm) {
    const term = `%${searchTerm}%`;
    return await db.select().from(users).where(and(
      or(
        like(users.username, term),
        like(users.email, term),
        like(users.displayName, term)
      ),
      whereNotDeleted(users)
    ));
  }
  async getAllUsers() {
    return await db.select().from(users).where(whereNotDeleted(users));
  }
  // Connection methods (DB)
  async getConnectionBetween(userId1, userId2) {
    const rows = await db.select().from(connections).where(or(
      and(eq(connections.userId, userId1), eq(connections.connectedUserId, userId2)),
      and(eq(connections.userId, userId2), eq(connections.connectedUserId, userId1))
    ));
    return rows[0];
  }
  async createConnection(connection) {
    const [row] = await db.insert(connections).values(connection).returning();
    return row;
  }
  async getConnectionsFor(userId) {
    const rows = await db.select().from(connections).where(or(eq(connections.userId, userId), eq(connections.connectedUserId, userId)));
    return rows;
  }
  async updateConnectionStatus(connectionId, status, actingUserId) {
    const rows = await db.select().from(connections).where(eq(connections.id, connectionId));
    const conn = rows[0];
    if (!conn) throw new Error("Connection not found");
    if (status === "accepted") {
      if (conn.connectedUserId !== actingUserId) throw new Error("Not authorized to accept this connection");
      const updated = await db.update(connections).set({ status }).where(eq(connections.id, connectionId)).returning();
      return updated[0];
    }
    if (status === "blocked") {
      if (conn.connectedUserId !== actingUserId && conn.userId !== actingUserId) throw new Error("Not authorized to block this connection");
      const updated = await db.update(connections).set({ status }).where(eq(connections.id, connectionId)).returning();
      return updated[0];
    }
    if (conn.connectedUserId === actingUserId || conn.userId === actingUserId) {
      const updated = await db.update(connections).set({ status }).where(eq(connections.id, connectionId)).returning();
      return updated[0];
    }
    throw new Error("Not authorized to update this connection");
  }
  // Moderation methods (DB)
  async createContentReport(report) {
    const [row] = await db.insert(contentReports).values(report).returning();
    return row;
  }
  async createUserBlock(block) {
    const inserted = await db.insert(userBlocks).values(block).onConflictDoNothing().returning();
    if (inserted && inserted.length > 0) return inserted[0];
    const existing = await db.select().from(userBlocks).where(and(eq(userBlocks.blockerId, block.blockerId), eq(userBlocks.blockedId, block.blockedId)));
    return existing[0];
  }
  async getBlockedUserIdsFor(blockerId) {
    const rows = await db.select({ blockedId: userBlocks.blockedId }).from(userBlocks).where(eq(userBlocks.blockerId, blockerId));
    return rows.map((r) => r.blockedId);
  }
  // Admin moderation helpers (DB)
  async getReports(filter) {
    const q = db.select().from(contentReports);
    if (filter?.status) q.where(eq(contentReports.status, filter.status));
    q.orderBy(desc(contentReports.createdAt));
    if (filter?.limit) q.limit(filter.limit);
    const rows = await q;
    return rows;
  }
  async getReportById(id) {
    const rows = await db.select().from(contentReports).where(eq(contentReports.id, id));
    return rows[0];
  }
  async updateReport(id, update) {
    const updated = await db.update(contentReports).set(update).where(eq(contentReports.id, id)).returning();
    if (!updated || updated.length === 0) throw new Error("Report not found");
    return updated[0];
  }
  async updateUser(id, userData) {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }
  async updateUserPreferences(userId, preferences) {
    return {
      id: 1,
      userId,
      interests: preferences.interests || null,
      favoriteTopics: preferences.favoriteTopics || null,
      engagementHistory: preferences.engagementHistory || null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  async getUserPreferences(userId) {
    return void 0;
  }
  async createUser(user) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  async updateUserPassword(userId, hashedPassword) {
    const result = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId)).returning();
    return result[0];
  }
  async setVerifiedApologeticsAnswerer(userId, isVerified) {
    const result = await db.update(users).set({ isVerifiedApologeticsAnswerer: isVerified }).where(eq(users.id, userId)).returning();
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }
  async getVerifiedApologeticsAnswerers() {
    return await db.select().from(users).where(and(eq(users.isVerifiedApologeticsAnswerer, true), whereNotDeleted(users)));
  }
  // Push token methods
  async getUserPushTokens(userId) {
    const rows = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
    return rows;
  }
  async savePushToken(token) {
    try {
      const inserted = await db.insert(pushTokens).values(token).onConflictDoUpdate({
        target: pushTokens.token,
        set: { lastUsed: /* @__PURE__ */ new Date(), userId: token.userId }
      }).returning();
      return inserted[0];
    } catch (err) {
      const updated = await db.update(pushTokens).set({ lastUsed: /* @__PURE__ */ new Date(), platform: token.platform }).where(eq(pushTokens.token, token.token)).returning();
      if (updated && updated[0]) return updated[0];
      throw err;
    }
  }
  async updateNotificationPreferences(userId, preferences) {
    await db.update(users).set(preferences).where(eq(users.id, userId));
  }
  async deletePushToken(token) {
    const res = await db.delete(pushTokens).where(eq(pushTokens.token, token));
    return true;
  }
  // Community methods - simplified for now
  async getAllCommunities() {
    return await db.select().from(communities).where(whereNotDeleted(communities));
  }
  async searchCommunities(searchTerm) {
    const term = `%${searchTerm}%`;
    return await db.select().from(communities).where(and(
      or(
        like(communities.name, term),
        like(communities.description, term)
      ),
      whereNotDeleted(communities)
    ));
  }
  async getPublicCommunitiesAndUserCommunities(userId, searchQuery) {
    let whereCondition = eq(communities.isPrivate, false);
    if (searchQuery) {
      const term = `%${searchQuery}%`;
      whereCondition = and(whereCondition, or(like(communities.name, term), like(communities.description, term)));
    }
    whereCondition = and(whereCondition, whereNotDeleted(communities));
    const query = db.select().from(communities).where(whereCondition);
    return await query;
  }
  async getCommunity(id) {
    const result = await db.select().from(communities).where(and(eq(communities.id, id), whereNotDeleted(communities)));
    return result[0];
  }
  async getCommunityBySlug(slug) {
    const result = await db.select().from(communities).where(and(eq(communities.slug, slug), whereNotDeleted(communities)));
    return result[0];
  }
  async createCommunity(community) {
    const comm = community;
    let latitude = comm.latitude;
    let longitude = comm.longitude;
    if (!latitude && !longitude && (comm.city || comm.state)) {
      const geocodeResult = await geocodeAddress("", comm.city, comm.state);
      if ("latitude" in geocodeResult) {
        latitude = geocodeResult.latitude.toString();
        longitude = geocodeResult.longitude.toString();
      }
    }
    const communityData = {
      ...community,
      latitude,
      longitude
    };
    const result = await db.insert(communities).values(communityData).returning();
    return result[0];
  }
  async updateCommunity(id, community) {
    const result = await db.update(communities).set(community).where(eq(communities.id, id)).returning();
    if (!result[0]) throw new Error("Community not found");
    return result[0];
  }
  async deleteCommunity(id) {
    const result = await softDelete(db, communities, communities.id, id);
    return !!result;
  }
  // Placeholder implementations for other methods - can be expanded as needed
  async getCommunityMembers(communityId) {
    return [];
  }
  async getCommunityMember(communityId, userId) {
    return void 0;
  }
  async getUserCommunities(userId) {
    return [];
  }
  async addCommunityMember(member) {
    throw new Error("Not implemented");
  }
  async updateCommunityMemberRole(id, role) {
    throw new Error("Not implemented");
  }
  async removeCommunityMember(communityId, userId) {
    return false;
  }
  async isCommunityMember(communityId, userId) {
    return false;
  }
  async isCommunityOwner(communityId, userId) {
    return false;
  }
  async isCommunityModerator(communityId, userId) {
    return false;
  }
  // Community invitation methods
  async createCommunityInvitation(invitation) {
    throw new Error("Not implemented");
  }
  async getCommunityInvitations(communityId) {
    return [];
  }
  async getCommunityInvitationByToken(token) {
    return void 0;
  }
  async getCommunityInvitationById(id) {
    return void 0;
  }
  async updateCommunityInvitationStatus(id, status) {
    throw new Error("Not implemented");
  }
  async deleteCommunityInvitation(id) {
    return false;
  }
  async getCommunityInvitationByEmailAndCommunity(email, communityId) {
    return void 0;
  }
  // Community chat room methods
  async getCommunityRooms(communityId) {
    return [];
  }
  async getPublicCommunityRooms(communityId) {
    return [];
  }
  async getCommunityRoom(id) {
    return void 0;
  }
  async createCommunityRoom(room) {
    throw new Error("Not implemented");
  }
  async updateCommunityRoom(id, data) {
    throw new Error("Not implemented");
  }
  async deleteCommunityRoom(id) {
    return false;
  }
  // Chat message methods
  async getChatMessages(roomId, limit) {
    return [];
  }
  async getChatMessagesAfter(roomId, afterId) {
    return [];
  }
  async createChatMessage(message) {
    throw new Error("Not implemented");
  }
  async deleteChatMessage(id) {
    return false;
  }
  // Community wall post methods
  async getCommunityWallPosts(communityId, isPrivate) {
    return [];
  }
  async getCommunityWallPost(id) {
    return void 0;
  }
  async createCommunityWallPost(post) {
    throw new Error("Not implemented");
  }
  async updateCommunityWallPost(id, data) {
    throw new Error("Not implemented");
  }
  async deleteCommunityWallPost(id) {
    const result = await softDelete(db, communityWallPosts, communityWallPosts.id, id);
    return !!result;
  }
  // Post methods
  async getAllPosts(filter) {
    return [];
  }
  async getPost(id) {
    return void 0;
  }
  async getPostsByCommunitySlug(communitySlug, filter) {
    return [];
  }
  async getPostsByGroupId(groupId, filter) {
    return [];
  }
  async getUserPosts(userId) {
    return [];
  }
  async createPost(post) {
    throw new Error("Not implemented");
  }
  async upvotePost(id) {
    throw new Error("Not implemented");
  }
  // Comment methods
  async getComment(id) {
    return void 0;
  }
  async getCommentsByPostId(postId) {
    return [];
  }
  async createComment(comment) {
    throw new Error("Not implemented");
  }
  async upvoteComment(id) {
    throw new Error("Not implemented");
  }
  // Group methods
  async getGroup(id) {
    return void 0;
  }
  async getGroupsByUserId(userId) {
    return [];
  }
  async createGroup(group) {
    throw new Error("Not implemented");
  }
  // Group member methods
  async addGroupMember(member) {
    throw new Error("Not implemented");
  }
  async getGroupMembers(groupId) {
    return [];
  }
  async isGroupAdmin(groupId, userId) {
    return false;
  }
  async isGroupMember(groupId, userId) {
    return false;
  }
  // Apologetics resource methods
  async getAllApologeticsResources() {
    return [];
  }
  async getApologeticsResource(id) {
    return void 0;
  }
  async createApologeticsResource(resource) {
    throw new Error("Not implemented");
  }
  // Prayer request methods
  async getPublicPrayerRequests() {
    return [];
  }
  async getAllPrayerRequests(filter) {
    return [];
  }
  async getPrayerRequest(id) {
    return void 0;
  }
  async getUserPrayerRequests(userId) {
    return [];
  }
  async getGroupPrayerRequests(groupId) {
    return [];
  }
  async getPrayerRequestsVisibleToUser(userId) {
    const userGroups = await db.select({ groupId: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, userId));
    const groupIds = userGroups.map((g) => g.groupId);
    const conditions = [];
    conditions.push(eq(prayerRequests.privacyLevel, "public"));
    if (groupIds.length > 0) {
      conditions.push(and(
        eq(prayerRequests.privacyLevel, "group-only"),
        inArray(prayerRequests.groupId, groupIds)
      ));
    }
    conditions.push(eq(prayerRequests.authorId, userId));
    return await db.select().from(prayerRequests).where(or(...conditions));
  }
  async createPrayerRequest(prayer) {
    throw new Error("Not implemented");
  }
  async updatePrayerRequest(id, prayer) {
    throw new Error("Not implemented");
  }
  async markPrayerRequestAsAnswered(id, description) {
    throw new Error("Not implemented");
  }
  async deletePrayerRequest(id) {
    return false;
  }
  // Prayer methods
  async createPrayer(prayer) {
    throw new Error("Not implemented");
  }
  async getPrayersForRequest(prayerRequestId) {
    return [];
  }
  async getUserPrayedRequests(userId) {
    return [];
  }
  // Apologetics Q&A methods
  async getAllApologeticsTopics() {
    return [];
  }
  async getApologeticsTopic(id) {
    return void 0;
  }
  async getApologeticsTopicBySlug(slug) {
    return void 0;
  }
  async createApologeticsTopic(topic) {
    throw new Error("Not implemented");
  }
  async getAllApologeticsQuestions(filterByStatus) {
    return [];
  }
  async getApologeticsQuestion(id) {
    return void 0;
  }
  async getApologeticsQuestionsByTopic(topicId) {
    return [];
  }
  async createApologeticsQuestion(question) {
    throw new Error("Not implemented");
  }
  async updateApologeticsQuestionStatus(id, status) {
    throw new Error("Not implemented");
  }
  async getApologeticsAnswersByQuestion(questionId) {
    return [];
  }
  async createApologeticsAnswer(answer) {
    throw new Error("Not implemented");
  }
  // Event methods
  async getAllEvents() {
    return [];
  }
  async getEvent(id) {
    return void 0;
  }
  async getUserEvents(userId) {
    return [];
  }
  async createEvent(event) {
    throw new Error("Not implemented");
  }
  async updateEvent(id, data) {
    throw new Error("Not implemented");
  }
  async deleteEvent(id) {
    const result = await softDelete(db, events, events.id, id);
    return !!result;
  }
  async getNearbyEvents(latitude, longitude, radius) {
    console.warn("getNearbyEvents is not fully implemented in DbStorage. Returning empty array.");
    return [];
  }
  // Event RSVP methods
  async createEventRSVP(rsvp) {
    throw new Error("Not implemented");
  }
  async getEventRSVPs(eventId) {
    return [];
  }
  async getUserEventRSVP(eventId, userId) {
    return void 0;
  }
  async updateEventRSVP(id, status) {
    throw new Error("Not implemented");
  }
  async deleteEventRSVP(id) {
    return false;
  }
  // Livestream methods
  async getAllLivestreams() {
    return [];
  }
  async createLivestream(livestream) {
    const result = await db.insert(livestreams).values(livestream).returning();
    return result[0];
  }
  // Microblog methods
  async getAllMicroblogs() {
    return [];
  }
  async getMicroblog(id) {
    return void 0;
  }
  async getUserMicroblogs(userId) {
    return [];
  }
  async createMicroblog(microblog) {
    throw new Error("Not implemented");
  }
  async updateMicroblog(id, data) {
    throw new Error("Not implemented");
  }
  async deleteMicroblog(id) {
    return false;
  }
  // Microblog like methods
  async likeMicroblog(microblogId, userId) {
    throw new Error("Not implemented");
  }
  async unlikeMicroblog(microblogId, userId) {
    return false;
  }
  async getUserLikedMicroblogs(userId) {
    return [];
  }
  // Livestreamer application methods
  async getLivestreamerApplicationByUserId(userId) {
    return void 0;
  }
  async getPendingLivestreamerApplications() {
    return [];
  }
  async createLivestreamerApplication(application) {
    throw new Error("Not implemented");
  }
  async updateLivestreamerApplication(id, status, reviewNotes, reviewerId) {
    throw new Error("Not implemented");
  }
  async isApprovedLivestreamer(userId) {
    return false;
  }
  // Apologist Scholar application methods
  async getApologistScholarApplicationByUserId(userId) {
    return void 0;
  }
  async getPendingApologistScholarApplications() {
    return [];
  }
  async createApologistScholarApplication(application) {
    throw new Error("Not implemented");
  }
  async updateApologistScholarApplication(id, status, reviewNotes, reviewerId) {
    throw new Error("Not implemented");
  }
  // Bible Reading Plan methods
  async getAllBibleReadingPlans() {
    return [];
  }
  async getBibleReadingPlan(id) {
    return void 0;
  }
  async createBibleReadingPlan(plan) {
    throw new Error("Not implemented");
  }
  // Bible Reading Progress methods
  async getBibleReadingProgress(userId, planId) {
    return void 0;
  }
  async createBibleReadingProgress(progress) {
    throw new Error("Not implemented");
  }
  async markDayCompleted(progressId, day) {
    throw new Error("Not implemented");
  }
  // Bible Study Note methods
  async getBibleStudyNotes(userId) {
    return [];
  }
  async getBibleStudyNote(id) {
    return void 0;
  }
  async createBibleStudyNote(note) {
    throw new Error("Not implemented");
  }
  async updateBibleStudyNote(id, data) {
    throw new Error("Not implemented");
  }
  async deleteBibleStudyNote(id) {
    return false;
  }
  // Admin methods
  async getAllLivestreamerApplications() {
    return await db.select().from(livestreamerApplications);
  }
  async getAllApologistScholarApplications() {
    return await db.select().from(apologistScholarApplications);
  }
  async getLivestreamerApplicationStats() {
    const all = await db.select().from(livestreamerApplications);
    return {
      total: all.length,
      pending: all.filter((a) => a.status === "pending").length,
      approved: all.filter((a) => a.status === "approved").length,
      rejected: all.filter((a) => a.status === "rejected").length
    };
  }
  async updateLivestreamerApplicationStatus(id, status, reviewNotes) {
    const result = await db.update(livestreamerApplications).set({
      status,
      reviewNotes: reviewNotes || null,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq(livestreamerApplications.id, id)).returning();
    if (!result[0]) throw new Error("Application not found");
    return result[0];
  }
  async deleteUser(userId) {
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount > 0;
  }
  // Direct Messaging methods
  async getDirectMessages(userId1, userId2) {
    const result = await db.select().from(messages).where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      )
    ).orderBy(messages.createdAt);
    return result;
  }
  async createDirectMessage(message) {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }
}
const storage = process.env.USE_DB === "true" ? new DbStorage() : new MemStorage();
export {
  DbStorage,
  MemStorage,
  storage
};
