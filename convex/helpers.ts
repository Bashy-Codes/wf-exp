import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Cached Intl instances for performance
const rtfCache = new Map<string, Intl.RelativeTimeFormat>();
const countryNamesCache = new Map<string, Intl.DisplayNames>();
const languageNamesCache = new Map<string, Intl.DisplayNames>();

function getRTF(locale: string): Intl.RelativeTimeFormat {
  if (!rtfCache.has(locale)) {
    rtfCache.set(locale, new Intl.RelativeTimeFormat(locale, { numeric: "auto" }));
  }
  return rtfCache.get(locale)!;
}

function getCountryNames(locale: string): Intl.DisplayNames {
  if (!countryNamesCache.has(locale)) {
    countryNamesCache.set(locale, new Intl.DisplayNames([locale], { type: "region" }));
  }
  return countryNamesCache.get(locale)!;
}

function getLanguageNames(locale: string): Intl.DisplayNames {
  if (!languageNamesCache.has(locale)) {
    languageNamesCache.set(locale, new Intl.DisplayNames([locale], { type: "language" }));
  }
  return languageNamesCache.get(locale)!;
}

/**
 * Get country name from ISO-2 code
 */
export function getCountryName(code: string, locale: string = "en"): string {
  if (code === "OTHER") return "Other";
  const names = getCountryNames(locale);
  return names.of(code) || code;
}

/**
 * Get country flag emoji from ISO-2 code
 */
export function getCountryFlag(code: string): string {
  if (code === "OTHER") return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
}

/**
 * Get language name from ISO 639 code
 */
export function getLanguageName(code: string, locale: string = "en"): string {
  if (code === "other") return "Other";
  if (code === "yue") return "Chinese (Cantonese)";
  const names = getLanguageNames(locale);
  return names.of(code) || code;
}

/**
 * Format timestamp as relative time (e.g., "2 hours ago", "in 3 days")
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - User's locale (e.g., "en", "fr", "es")
 */
export function getRelativeTime(timestamp: number, locale: string = "en"): string {
  const rtf = getRTF(locale);
  const diff = timestamp - Date.now();
  const seconds = Math.floor(Math.abs(diff) / 1000);

  if (seconds < 60) return rtf.format(Math.floor(diff / 1000), "second");

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(Math.floor(diff / 60000), "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(Math.floor(diff / 3600000), "hour");

  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(Math.floor(diff / 86400000), "day");

  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(months, "month");

  const years = Math.floor(days / 365);
  return rtf.format(years, "year");
}

/**
 * Get optimized image URL with automatic resizing and format conversion
 * @param storageKey - R2 storage key
 * @param width - Target width in pixels
 * @param quality - JPEG/WebP quality (1-100), default 85
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  storageKey: string,
  width: number,
  quality: number = 85
): string {
  const baseUrl = "https://storage.worldfriends.app";
  return `${baseUrl}/${storageKey}?w=${width}&q=${quality}&f=webp`;
}


/**
 * Helper function to check if two users are friends
 */
export async function areFriends(
  ctx: QueryCtx | MutationCtx,
  userId1: Id<"users">,
  userId2: Id<"users">
): Promise<boolean> {
  if (userId1 === userId2) return false;

  const [userAId, userBId] = userId1 < userId2
    ? [userId1, userId2]
    : [userId2, userId1];

  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q) =>
      q.eq("userAId", userAId).eq("userBId", userBId)
    )
    .filter((q) => q.eq(q.field("status"), "accepted"))
    .first();

  return !!friendship;
}

/**
 * Helper function to check pending requests
 */

export async function hasPendingRequest(
  ctx: QueryCtx | MutationCtx,
  senderId: Id<"users">,
  receiverId: Id<"users">
): Promise<boolean> {
  const [userAId, userBId] = senderId < receiverId
    ? [senderId, receiverId]
    : [receiverId, senderId];

  const friendship = await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q) =>
      q.eq("userAId", userAId).eq("userBId", userBId)
    )
    .filter((q) => q.eq(q.field("status"), "pending"))
    .first();

  return !!friendship;
}


/**
 * Helper function to get user's friends list
 */
export async function getUserFriends(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<Id<"users">[]> {
  const [asA, asB] = await Promise.all([
    ctx.db
      .query("friendships")
      .withIndex("by_userA", (q) => q.eq("userAId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect(),
    ctx.db
      .query("friendships")
      .withIndex("by_userB", (q) => q.eq("userBId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect(),
  ]);

  return [
    ...asA.map((f) => f.userBId),
    ...asB.map((f) => f.userAId),
  ];
}

/**
 * Helper function to calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Helper function to Increment posts count for a collection
 */
export const incrementCollectionPostsCount = async (
  ctx: any,
  collectionId: Id<"collections">
) => {
  const collection = await ctx.db.get(collectionId);
  if (collection) {
    await ctx.db.patch(collectionId, {
      postsCount: collection.postsCount + 1,
    });
  }
};

/**
 * Helper function to Decrement posts count for a collection
 */
export const decrementCollectionPostsCount = async (
  ctx: any,
  collectionId: Id<"collections">
) => {
  const collection = await ctx.db.get(collectionId);
  if (collection && collection.postsCount > 0) {
    await ctx.db.patch(collectionId, {
      postsCount: collection.postsCount - 1,
    });
  }
};



/**
 * Helper function to check age group and gender preference compatibility between two users
 */
export async function checkUsersPrivacy(
  ctx: QueryCtx | MutationCtx,
  userId1: Id<"users">,
  userId2: Id<"users">
): Promise<boolean> {
  const [user1, user2, userInfo1, userInfo2] = await Promise.all([
    ctx.db.get(userId1),
    ctx.db.get(userId2),
    ctx.db
      .query("userInformation")
      .withIndex("by_userId", (q) => q.eq("userId", userId1))
      .unique(),
    ctx.db
      .query("userInformation")
      .withIndex("by_userId", (q) => q.eq("userId", userId2))
      .unique(),
  ]);

  if (!user1 || !user2 || !userInfo1 || !userInfo2) {
    return false;
  }

  if (userInfo1.ageGroup !== userInfo2.ageGroup) {
    return false;
  }

  if (userInfo1.genderPreference && user1.gender !== user2.gender) {
    return false;
  }

  if (userInfo2.genderPreference && user2.gender !== user1.gender) {
    return false;
  }

  return true;
}

/**
 * Helper function to get the user age group
 */
export function getAgeGroup(birthDate: string): "13-17" | "18-100" {
  const age = calculateAge(birthDate);
  return age < 18 ? "13-17" : "18-100";
}
