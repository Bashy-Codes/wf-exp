import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const userManagementTables = {
  users: defineTable({
    // Required Convex Auth fields
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),

    userName: v.string(),
    name: v.string(),
    profilePicture: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    birthDate: v.string(),
    country: v.string(),
    isPremium: v.boolean(),
  })
    .index("by_userName", ["userName"])
    .index("by_country_gender", ["country", "gender"]),

  profiles: defineTable({
    userId: v.id("users"),
    aboutMe: v.string(),
    spokenLanguages: v.array(v.string()),
    learningLanguages: v.array(v.string()),
    hobbies: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  userInformation: defineTable({
    userId: v.id("users"),
    genderPreference: v.boolean(),
    ageGroup: v.union(v.literal("13-17"), v.literal("18-100")),
    lastActive: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_ageGroup_lastActive", ["ageGroup", "lastActive"])
    .index("by_ageGroup_genderPreference_lastActive", [
      "ageGroup",
      "genderPreference",
      "lastActive",
    ]),

  blockedUsers: defineTable({
    blockerUserId: v.id("users"),
    blockedUserId: v.id("users"),
  })
    .index("by_blocker", ["blockerUserId"])
    .index("by_blocked", ["blockedUserId"])
    .index("by_both", ["blockerUserId", "blockedUserId"]),
};

/*
 * Tables for the friendships and requests
**/

const friendshipsTables = {
  friendships: defineTable({
    userAId: v.id("users"),
    userBId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    senderId: v.id("users"),
  })
    .index("by_pair", ["userAId", "userBId"])
    .index("by_userA", ["userAId"])
    .index("by_userB", ["userBId"])
    .index("by_userA_status", ["userAId", "status"])
    .index("by_userB_status", ["userBId", "status"]),
};

/*
 * Tables for Feed
**/

const feedTables = {
  posts: defineTable({
    userId: v.id("users"),
    collectionId: v.optional(v.id("collections")),
    content: v.string(),
    attachments: v.optional(v.array(v.object({
      type: v.union(v.literal("image"), v.literal("gif")),
      url: v.string(),
    }))),
    commentsCount: v.number(),
    reactionsCount: v.number(),
    isPinned: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isPinned", ["userId", "isPinned"])
    .index("by_isPinned", ["isPinned"])
    .index("by_collectionId", ["collectionId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
    replyParentId: v.optional(v.id("comments")),
    repliesCount: v.number(),
    attachment: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_postId", ["postId"])
    .index("by_replyParent", ["replyParentId"])
    .index("by_postId_replyParent", ["postId", "replyParentId"]),

  reactions: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    emoji: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_postId", ["postId"])
    .index("by_userId_postId", ["userId", "postId"]),

  collections: defineTable({
    userId: v.id("users"),
    title: v.string(),
    postsCount: v.number(),
  }).index("by_userId", ["userId"]),
};

/*
 * Tables for Conversations
**/

const conversationsTables = {
  conversations: defineTable({
    conversationId: v.string(), // Shared identifier for both conversation records
    userId: v.id("users"), // The user who "owns" this conversation record
    otherUserId: v.id("users"), // The other participant
    lastMessageId: v.optional(v.id("messages")),
    lastMessageTime: v.number(),
    hasUnreadMessages: v.boolean(),
  })
    .index("by_both", ["userId", "otherUserId"])
    .index("by_user_lastMessageTime", ["userId", "lastMessageTime"])
    .index("by_conversationId", ["conversationId"]),

  messages: defineTable({
    conversationId: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
    senderId: v.id("users"),
    content: v.optional(v.string()),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("gif")),
    attachment: v.optional(v.string()),
    replyParentId: v.optional(v.id("messages")),
    correction: v.optional(v.string()),
  })
    .index("by_conversationGroup", ["conversationId"])
    .index("by_groupId", ["groupId"]),

  groups: defineTable({
    title: v.string(),
    description: v.string(),
    banner: v.optional(v.id("_storage")),
    membersCount: v.number(),
    creatorId: v.id("users"),
  })
    .index("by_creatorId", ["creatorId"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"])
    .index("by_groupId_userId", ["groupId", "userId"]),
};

/*
 * Tables for Notifications
**/

const notifications = {
  notifications: defineTable({
    recipientId: v.id("users"),
    senderId: v.id("users"),
    type: v.union(
      v.literal("friend_request_sent"),
      v.literal("friend_request_accepted"),
      v.literal("friend_request_rejected"),
      v.literal("friend_removed"),
      v.literal("conversation_deleted"),
      v.literal("user_blocked"),
      v.literal("post_reaction"),
      v.literal("post_commented"),
      v.literal("comment_replied")
    ),
    hasUnread: v.boolean(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_unread", ["recipientId", "hasUnread"]),
};


/*
 * Tables for Moderations
**/

const moderationTables = {
  reports: defineTable({
    reporterId: v.id("users"),
    reportType: v.union(
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("inappropriate_content"),
      v.literal("spam"),
      v.literal("other"),
    ),
    reportReason: v.string(),
    attachment: v.id("_storage"),

    targetType: v.union(v.literal("user"), v.literal("post")),
    targetUserId: v.optional(v.id("users")),
    targetPostId: v.optional(v.id("posts"))
  })
    .index("by_reporter", ["reporterId"])
    .index("by_targetUser", ["targetUserId"])
};


const schema = defineSchema({
  ...authTables,
  ...userManagementTables,
  ...friendshipsTables,
  ...feedTables,
  ...conversationsTables,
  ...moderationTables,
  ...notifications
});

export default schema;
