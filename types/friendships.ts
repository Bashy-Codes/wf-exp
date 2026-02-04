import { Id } from "@/convex/_generated/dataModel";

export interface FriendshipItem {
  friendshipId: Id<"friendships">;
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  country: string;
  status: "pending" | "accepted";
  senderId: Id<"users">;
}
