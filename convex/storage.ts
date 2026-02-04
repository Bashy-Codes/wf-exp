import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { R2, type R2Callbacks } from "@convex-dev/r2";
import { DataModel } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { PutObjectCommand } from "@aws-sdk/client-s3"; 
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const generateConvexUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// Custom R2 class to support custom domain and cache headers
class CustomR2 extends R2 {
  constructor(component: any, options?: any) {
    super(component, options);
  }

  // Override generateUploadUrl to add Cache-Control
  async generateUploadUrl(customKey?: string) {
    const key = customKey || crypto.randomUUID();
    const url = await getSignedUrl(
      this.r2,
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        CacheControl: "public, max-age=31536000", // Cache for 1 year
      })
    );
    return { key, url };
  }

  // Override store to add Cache-Control for server-side uploads
  async store(
    ctx: any, // RunActionCtx type from R2 class
    file: Uint8Array | Buffer | Blob,
    opts: string | { key?: string; type?: string } = {}
  ) {
    if (typeof opts === "string") {
      opts = { key: opts };
    }
    if (opts.key) {
      const existingMetadataForKey = await ctx.runQuery(
        this.component.lib.getMetadata,
        {
          key: opts.key,
          ...this.config,
        }
      );
      if (existingMetadataForKey) {
        throw new Error(
          `Metadata already exists for key ${opts.key}. Please use a unique key.`
        );
      }
    }
    const key = opts.key || crypto.randomUUID();
    const parsedFile = await this.parseFile(file); 
    const fileType = await this.getFileType(parsedFile);

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: parsedFile,
      ContentType: opts.type || fileType,
      CacheControl: "public, max-age=31536000", // Cache for 1 year
    });
    await this.r2.send(command);
    await ctx.runAction(this.component.lib.syncMetadata, {
      key: key,
      ...this.config,
    });
    return key;
  }

  // Override getUrl to use custom domain
  async getUrl(key: string, options: { expiresIn?: number } = {}) {
    const { expiresIn = 86400 } = options;
    const signedUrl = await super.getUrl(key, { expiresIn });
    const url = new URL(signedUrl);
    const customBaseUrl = "https://storage.worldfriends.app";
    const customUrl = new URL(`${customBaseUrl}/${key}`);
    url.searchParams.forEach((value, key) => {
      customUrl.searchParams.set(key, value);
    });
    return customUrl.toString();
  }

  // Optional: Unsigned URLs for public bucket
  async getPublicUrl(key: string) {
    const customBaseUrl = "https://storage.worldfriends.app";
    return `${customBaseUrl}/${key}`;
  }

  // Expose internal methods for store (not ideal, but needed due to private methods)
  private async parseFile(file: Uint8Array | Buffer | Blob) {
    if (typeof process !== "undefined" && process.execPath && file instanceof Blob) {
      const buffer = await file.arrayBuffer();
      return new Uint8Array(buffer);
    }
    return file;
  }

  private async getFileType(file: Uint8Array | Buffer | Blob) {
    if (typeof process !== "undefined" && process.execPath && (file instanceof Buffer || file instanceof Uint8Array)) {
      const fileType = await import("file-type");
      return (await fileType.fileTypeFromBuffer(file))?.mime;
    }
    if (file instanceof Blob) {
      return file.type;
    }
  }
}

// Instantiate CustomR2
const r2 = new CustomR2(components.r2);

const callbacks: R2Callbacks = internal.storage;

export const {
  syncMetadata,
  getMetadata,
  listMetadata,
  deleteObject,
  onSyncMetadata,
} = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },
  checkReadKey: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },
  checkReadBucket: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },
  checkDelete: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },
  onUpload: async (_ctx, bucket, key) => {
    console.log(`File uploaded: ${key} to bucket: ${bucket}`);
  },
  onDelete: async (_ctx, bucket, key) => {
    console.log(`File deleted: ${key} from bucket: ${bucket}`);
  },
  onSyncMetadata: async (ctx, args) => {
    console.log("onSyncMetadata", args);
    const metadata = await r2.getMetadata(ctx, args.key);
    console.log("metadata", metadata);
  },
  callbacks,
});

// Generate upload URL for user profile photos
export const generateProfileUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const timestamp = Date.now();
    const customKey = `profile-photos/${userId}-${timestamp}`;
    return await r2.generateUploadUrl(customKey);
  },
});

// Generate upload URL for post images
export const generatePostUploadUrl = mutation({
  args: {
    postId: v.id("posts"),
    imageIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.userId !== userId) {
      throw new Error("You can only upload images to your own posts");
    }
    const customKey = `post-images/${args.postId}/${args.imageIndex}`;
    return await r2.generateUploadUrl(customKey);
  },
});

// Generate upload URL for discussion images
export const generateDiscussionUploadUrl = mutation({
  args: {
    communityId: v.id("communities"),
    discussionId: v.id("discussions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const discussion = await ctx.db.get(args.discussionId);
    if (!discussion) {
      throw new Error("Discussion not found");
    }
    if (discussion.userId !== userId) {
      throw new Error("You can only upload images to your own discussions");
    }
    const customKey = `discussion-images/${args.communityId}/${args.discussionId}`;
    return await r2.generateUploadUrl(customKey);
  },
});

// Generate upload URL for conversation attachments
export const generateConversationUploadUrl = mutation({
  args: {
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verify user is participant in conversation
    const userConversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!userConversation) {
      throw new Error("Not authorized to upload to this conversation");
    }
    
    const timestamp = Date.now();
    const customKey = `conversations-attachments/${args.conversationId}-${timestamp}`;
    return await r2.generateUploadUrl(customKey);
  },
});

export { r2 };