import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createNotification } from "../notifications";
import { areFriends } from "../helpers";


// Helper function to generate conversation ID
function generateConversationId(
    userId1: Id<"users">,
    userId2: Id<"users">
): string {
    return [userId1, userId2].sort().join("-");
}

export const createConversation = mutation({
    args: {
        otherUserId: v.id("users"),
    },
    handler: async (ctx, { otherUserId }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            throw new Error("Not authenticated");
        }

        if (currentUserId === otherUserId) {
            throw new Error("Cannot create conversation with yourself");
        }

        // Check if conversation already exists
        const conversationId = generateConversationId(currentUserId, otherUserId);
        const existingConversation = await ctx.db
            .query("conversations")
            .withIndex("by_both", (q) =>
                q.eq("userId", currentUserId).eq("otherUserId", otherUserId)
            )
            .first();

        if (existingConversation) {
            return existingConversation.conversationId;
        }

        const areUserFriends = await areFriends(ctx, currentUserId, otherUserId);

        if (!areUserFriends) {
            throw new Error("You can only create conversations with friends");
        }

        // Create dual conversation records
        await ctx.db.insert("conversations", {
            userId: currentUserId,
            otherUserId: otherUserId,
            conversationId,
            lastMessageTime: Date.now(),
            hasUnreadMessages: false,
        });

        await ctx.db.insert("conversations", {
            userId: otherUserId,
            otherUserId: currentUserId,
            conversationId,
            lastMessageTime: Date.now(),
            hasUnreadMessages: false,
        });

        return conversationId;
    },
});

export const sendMessage = mutation({
    args: {
        conversationId: v.optional(v.string()),
        groupId: v.optional(v.id("groups")),
        content: v.optional(v.string()),
        type: v.union(v.literal("text"), v.literal("image"), v.literal("gif")),
        attachment: v.optional(v.string()),
        replyParentId: v.optional(v.id("messages")),
    },
    handler: async (ctx, { conversationId, groupId, content, type, attachment, replyParentId }) => {
        const senderId = await getAuthUserId(ctx);
        if (!senderId) {
            throw new Error("Not authenticated");
        }

        const isGroup = !!groupId;

        if (isGroup) {
            // Verify user is member of group
            const membership = await ctx.db
                .query("groupMembers")
                .withIndex("by_groupId_userId", (q) =>
                    q.eq("groupId", groupId).eq("userId", senderId)
                )
                .first();

            if (!membership) {
                throw new Error("Not authorized to send messages in this group");
            }
        } else {
            // Verify user is participant in conversation
            const senderConversation = await ctx.db
                .query("conversations")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conversationId!)
                )
                .filter((q) => q.eq(q.field("userId"), senderId))
                .first();

            if (!senderConversation) {
                throw new Error("Not authorized to send messages in this conversation");
            }
        }

        // Validate message content based on type
        if (type === "text" && !content?.trim()) {
            throw new Error("Text messages must have content");
        }
        if ((type === "image" || type === "gif") && !attachment) {
            throw new Error("Image and GIF messages must have an attachment");
        }

        // If replying, verify the parent message exists
        if (replyParentId) {
            const parentMessage = await ctx.db.get(replyParentId);
            if (!parentMessage) {
                throw new Error("Parent message not found");
            }
            if (isGroup) {
                if (parentMessage.groupId !== groupId) {
                    throw new Error("Parent message does not belong to this group");
                }
            } else {
                if (parentMessage.conversationId !== conversationId) {
                    throw new Error("Parent message does not belong to this conversation");
                }
            }
        }

        // Create message
        const messageData: any = {
            senderId,
            type,
        };

        if (isGroup) {
            messageData.groupId = groupId;
        } else {
            messageData.conversationId = conversationId;
        }

        if (content?.trim()) {
            messageData.content = content.trim();
        }
        if (attachment) {
            messageData.attachment = attachment;
        }
        if (replyParentId) {
            messageData.replyParentId = replyParentId;
        }

        const messageId = await ctx.db.insert("messages", messageData);

        if (!isGroup) {
            // Update conversation records
            const senderConversation = await ctx.db
                .query("conversations")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", conversationId!)
                )
                .filter((q) => q.eq(q.field("userId"), senderId))
                .first();

            if (senderConversation) {
                const otherUserId = senderConversation.otherUserId;
                const currentTime = Date.now();

                await ctx.db.patch(senderConversation._id, {
                    lastMessageId: messageId,
                    lastMessageTime: currentTime,
                    hasUnreadMessages: false,
                });

                const receiverConversation = await ctx.db
                    .query("conversations")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conversationId!)
                    )
                    .filter((q) => q.eq(q.field("userId"), otherUserId))
                    .first();

                if (receiverConversation) {
                    await ctx.db.patch(receiverConversation._id, {
                        lastMessageId: messageId,
                        lastMessageTime: currentTime,
                        hasUnreadMessages: true,
                    });
                }


            }
        }

        return messageId;
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, { messageId }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            throw new Error("Not authenticated");
        }

        const message = await ctx.db.get(messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        if (message.senderId !== currentUserId) {
            throw new Error("Not authorized to delete this message");
        }

        await ctx.db.delete(messageId);

        // Update conversation records if this was the last message
        if (message.conversationId) {
            const conversations = await ctx.db
                .query("conversations")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", message.conversationId!)
                )
                .collect();

            for (const conversation of conversations) {
                if (conversation.lastMessageId === messageId) {
                    const lastMessage = await ctx.db
                        .query("messages")
                        .withIndex("by_conversationGroup", (q) =>
                            q.eq("conversationId", message.conversationId!)
                        )
                        .order("desc")
                        .first();

                    await ctx.db.patch(conversation._id, {
                        lastMessageId: lastMessage?._id,
                        lastMessageTime:
                            lastMessage?._creationTime || conversation.lastMessageTime,
                    });
                }
            }
        }
    },
});

export const deleteConversation = mutation({
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
            throw new Error("Not authorized to delete this conversation");
        }

        // Get all conversation records for this group
        const allConversations = await ctx.db
            .query("conversations")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", conversationId)
            )
            .collect();

        // Delete all messages in the conversation (and their images)
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationGroup", (q) =>
                q.eq("conversationId", conversationId)
            )
            .collect();

        for (const message of messages) {
            // R2 attachments are managed separately, no need to delete here
            await ctx.db.delete(message._id);
        }

        // Get current user for notification
        const currentUser = await ctx.db.get(currentUserId);

        // Send notification to other participant
        if (currentUser) {
            const otherParticipantId = userConversation.otherUserId;

            await createNotification(
                ctx,
                otherParticipantId,
                currentUserId,
                "conversation_deleted",
            );
        }

        // Delete all conversation records
        for (const conversation of allConversations) {
            await ctx.db.delete(conversation._id);
        }


    },
});

export const markAsRead = mutation({
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
            throw new Error("Not authorized");
        }

        // Mark as read for current user
        await ctx.db.patch(userConversation._id, {
            hasUnreadMessages: false,
        });
    },
});

export const correctMessage = mutation({
    args: {
        messageId: v.id("messages"),
        correction: v.string(),
    },
    handler: async (ctx, { messageId, correction }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) {
            throw new Error("Not authenticated");
        }

        const message = await ctx.db.get(messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        if (message.type !== "text") {
            throw new Error("Can only correct text messages");
        }

        const isGroup = !!message.groupId;

        if (isGroup) {
            const membership = await ctx.db
                .query("groupMembers")
                .withIndex("by_groupId_userId", (q) =>
                    q.eq("groupId", message.groupId!).eq("userId", currentUserId)
                )
                .first();

            if (!membership) {
                throw new Error("Not authorized");
            }
        } else {
            const userConversation = await ctx.db
                .query("conversations")
                .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", message.conversationId!)
                )
                .filter((q) => q.eq(q.field("userId"), currentUserId))
                .first();

            if (!userConversation) {
                throw new Error("Not authorized");
            }
        }

        if (message.senderId === currentUserId) {
            throw new Error("Cannot correct your own messages");
        }

        await ctx.db.patch(messageId, {
            correction: correction.trim(),
        });
    },
});