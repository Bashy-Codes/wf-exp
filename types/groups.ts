import { Id } from "@/convex/_generated/dataModel";

export interface GroupData {
  groupId: Id<"groups">;
  title: string;
  description: string;
  banner: string | null;
  membersCount: number;
  createdAt: number;
  unreadCount?: number;
}

export interface GroupInfo {
  groupId: Id<"groups">;
  title: string;
  description: string;
  banner: string | null;
  membersCount: number;
  createdAt: number;
  memberIds: Id<"users">[];
}
