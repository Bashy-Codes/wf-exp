import { Id } from "@/convex/_generated/dataModel";

export interface UserProfile {
  // general user data
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  username: string;
  gender: "male" | "female" | "other";
  age: number;
  countryCode: string;
  isPremiumUser: boolean;
  // profile data
  aboutMe: string;
  spokenLanguageCodes: string[];
  learningLanguageCodes: string[];
  hobbies: string[];
}


/*
* Feed-related TypeScript types
*/


export interface PostTypes {
  postId: Id<"posts">;
  userId: Id<"users">;
  content: string;
  postAttachments?: Array<{
    type: "image" | "gif";
    url: string;
  }>;
  reactionsCount: number;
  commentsCount: number;
  hasReacted: boolean;
  userReaction?: string;
  isOwner: boolean;
  createdAt: string;
  isPinned: boolean;
  postAuthor: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isPremiumUser: boolean;
  };
}


export interface CommentTypes {
  commentId: Id<"comments">;
  createdAt: number;
  userId: Id<"users">;
  postId: Id<"posts">;
  content: string;
  attachment?: string;
  repliesCount: number;
  replyParentId?: Id<"comments">;
  isOwner: boolean;
  commentAuthor: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isPremiumUser: boolean;
  };
}

export interface ReactionTypes {
  reactionId: Id<"reactions">;
  createdAt: number;
  userId: Id<"users">;
  postId: Id<"posts">;
  emoji: string;
  reactionAuthor: {
    userId: Id<"users">;
    name: string;
    profilePicture: string;
    isPremiumUser: boolean;
  };
}


/**
 * Collection-related TypeScript types
 */

export interface CollectionTypes {
  collectionId: Id<"collections">;
  createdAt: number;
  userId: Id<"users">;
  title: string;
  postCount: number;
  isOwner: boolean;
}

export interface CollectionPostTypes {
  collectionPostId: Id<"posts">;
  createdAt: number;
  collectionId: Id<"collections">;
  post: PostTypes;
}
