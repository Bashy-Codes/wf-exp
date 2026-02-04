import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { r2 } from "../storage";
import { getRelativeTime, getCountryFlag } from "../helpers";

export const getUserConversations = query({
    args: {
        paginationOpts: paginationOptsValidator,
        locale: v.optional(v.string()),
    },
    handler: async (ctx, { paginationOpts, locale }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            return {
                page: [],
                isDone: true,
                continueCursor: "",
            };
        }

        const results = await ctx.db
            .query("conversations")
            .withIndex("by_user_lastMessageTime", (q) =>
                q.eq("userId", currentUserId)
            )
            .order("desc")
            .paginate(paginationOpts);

        const pageConversations = results.page;

        // Enrich conversations with user and last message data
        const enrichedConversations = await Promise.all(
            pageConversations.map(async (conversation) => {
                // Get the other user data
                const otherUserId = conversation.otherUserId;
                const otherUser = await ctx.db.get(otherUserId);
                if (!otherUser) {
                    return null;
                }

                // Get profile picture URL
                const profilePictureUrl = await r2.getPublicUrl(otherUser.profilePicture);

                // Get last message if exists
                let lastMessage = undefined;
                if (conversation.lastMessageId) {
                    const message = await ctx.db.get(conversation.lastMessageId);
                    if (message) {
                        lastMessage = {
                            messageId: message._id,
                            content: message.content,
                            type: message.type,
                            senderId: message.senderId,
                            createdAt: message._creationTime,
                            conversationId: conversation.conversationId,
                            imageId: undefined,
                            replyParentId: undefined,
                            sender: {
                                userId: otherUser._id,
                                name: otherUser.name,
                                profilePicture: profilePictureUrl,
                            },
                            isOwner: message.senderId === currentUserId,
                        };
                    }
                }

                return {
                    conversationId: conversation.conversationId,
                    createdAt: conversation._creationTime,
                    lastMessageId: conversation.lastMessageId,
                    lastMessageTime: getRelativeTime(conversation.lastMessageTime, locale),
                    hasUnreadMessages: conversation.hasUnreadMessages,
                    lastMessage,
                    otherUser: {
                        userId: otherUser._id,
                        name: otherUser.name,
                        country: getCountryFlag(otherUser.country),
                        profilePicture: profilePictureUrl,
                        isPremiumUser: otherUser.isPremium
                    },
                };
            })
        );

        // Filter out null results (where other user profile wasn't found)
        const validConversations = enrichedConversations.filter(
            (conv) => conv !== null
        );

        return {
            page: validConversations,
            isDone: results.isDone,
            continueCursor: results.continueCursor,
        };
    },
});

export const getConversationMessages = query({
    args: {
        conversationId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { conversationId, paginationOpts }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            throw new Error("Not authenticated");
        }

        const userConversation = await ctx.db
            .query("conversations")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), currentUserId))
            .first();

        if (!userConversation) {
            throw new Error("Not authorized to view this conversation");
        }

        const results = await ctx.db
            .query("messages")
            .withIndex("by_conversationGroup", (q) =>
                q.eq("conversationId", conversationId)
            )
            .order("desc")
            .paginate(paginationOpts);

        const enrichedMessages = await Promise.all(
            results.page.map(async (message) => {
                const isOwner = message.senderId === currentUserId;

                const senderUser = await ctx.db.get(message.senderId);
                if (!senderUser) return null;

                let attachmentUrl: string | null = null;
                if (message.attachment) {
                    if (message.type === "image") {
                        attachmentUrl = await r2.getPublicUrl(message.attachment);
                    } else if (message.type === "gif") {
                        attachmentUrl = message.attachment;
                    }
                }

                let replyParent = null;
                if (message.replyParentId) {
                    const parentMessage = await ctx.db.get(message.replyParentId);
                    if (parentMessage) {
                        const parentSenderUser = await ctx.db.get(parentMessage.senderId);
                        if (parentSenderUser) {
                            replyParent = {
                                messageId: parentMessage._id,
                                content: parentMessage.content,
                                type: parentMessage.type,
                                senderName: parentSenderUser.name
                            };
                        }
                    }
                }

                return {
                    messageId: message._id,
                    conversationId: message.conversationId,
                    createdAt: message._creationTime,
                    content: message.content,
                    type: message.type,
                    attachmentUrl,
                    isOwner,
                    replyParentId: message.replyParentId,
                    replyParent,
                    correction: message.correction,
                    sender: {
                        senderId: message.senderId,
                        senderName: senderUser.name,
                    },
                };
            })
        );

        return {
            ...results,
            page: enrichedMessages.filter((msg) => msg !== null),
        };
    },
});

export const getConversationInfo = query({
    args: {
        conversationId: v.string(),
    },
    handler: async (ctx, { conversationId }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            throw new Error("Not authenticated");
        }

        // Get user's conversation record
        const userConversation = await ctx.db
            .query("conversations")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), currentUserId))
            .first();

        if (!userConversation) {
            throw new Error("Not authorized to view this conversation");
        }

        // Get the other user data
        const otherUserId = userConversation.otherUserId;
        const otherUser = await ctx.db.get(otherUserId);

        if (!otherUser) {
            throw new Error("Other user not found");
        }

        // Get profile picture URL
        const profilePictureUrl = await r2.getPublicUrl(otherUser.profilePicture);

        return {
            otherUser: {
                userId: otherUser._id,
                name: otherUser.name,
                profilePicture: profilePictureUrl,
                isPremiumUser: otherUser.isPremium
            },
        };
    },
});

export const hasUnreadConversations = query({
    handler: async (ctx) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            return false;
        }

        const unreadConversation = await ctx.db
            .query("conversations")
            .withIndex("by_user_lastMessageTime", (q) =>
                q.eq("userId", currentUserId)
            )
            .filter((q) => q.eq(q.field("hasUnreadMessages"), true))
            .first();

        return !!unreadConversation;
    },
});