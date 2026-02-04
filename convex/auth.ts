import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ verify: ResendOTP }), Google],
  callbacks: {
    async redirect({ redirectTo }) {
      if (redirectTo.startsWith("worldfriends://")) {
        return redirectTo;
      }
      // Allow Expo development URLs
      if (/^exp:\/\/.*/.test(redirectTo)) {
        return redirectTo;
      }

      // Allow production app deep link URLs
      if (/^worldfriends:\/\/.*/.test(redirectTo)) {
        return redirectTo;
      }
      throw new Error(`Invalid redirectTo ${redirectTo}`);
    },

    async createOrUpdateUser(ctx: MutationCtx, args) {
      // If user already exists, just return the existing user ID
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Create a new user with required fields and default values
      const userId = await ctx.db.insert("users", {
        // Auth-related fields
        email: args.profile.email as string | undefined,
        emailVerificationTime: args.profile.emailVerificationTime as number | undefined,

        // Required fields with default values - these will be updated during profile creation
        userName: "",
        name: "",
        profilePicture: "",
        gender: "other",
        birthDate: "",
        country: "",
        isPremium: false,
      });

      return userId;
    },
  },
});
