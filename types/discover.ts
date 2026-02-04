/**
 * User-related TypeScript interfaces and types
 */

import { Id } from "@/convex/_generated/dataModel";

export interface UserCardData {
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  gender: "male" | "female" | "other";
  age: number;
  country: string;
  spokenLanguages: string[];
  learningLanguages: string[];
  isPremiumUser: boolean;
}
