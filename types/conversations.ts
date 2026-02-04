import { Id } from "@/convex/_generated/dataModel";

/**
 * Conversation-related TypeScript interfaces and types
 */

export interface ConversationData {
  conversationId: string;
  createdAt: number;
  lastMessageId?: Id<"messages">;
  lastMessageTime: string;
  hasUnreadMessages: boolean;
  lastMessage?: Message;
  otherUser: {
    userId: Id<"users">;
    name: string;
    country: string;
    profilePicture: string;
    isPremiumUser: boolean;
  };
}


/**
 * Conversation Message types
 */
export interface Message {
  messageId: Id<"messages">;
  conversationId: string;
  createdAt: number;
  content?: string;
  type: "text" | "image" | "gif";
  attachmentUrl?: string;
  isOwner: boolean;
  replyParentId?: Id<"messages">;
  replyParent?: {
    messageId: Id<"messages">;
    content?: string;
    type: "text" | "image" | "gif";
    senderName: string;
  };
  correction?: string;
  sender: {
    senderId: Id<"users">;
    senderName: string;
  };
}

/**
 * Conversation Info types
 */
export interface ConversationInfo {
  otherUser: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isPremiumUser: boolean;
  };
}
