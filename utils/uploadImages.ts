import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import * as ImageManipulator from "expo-image-manipulator";


export type UploadResult = {
  storageId?: string; // For Convex storage
  key?: string; // For R2 storage
} | null;

export type UploadType = "profile" | "post" | "convex";

// Helper functions to generate R2 keys (kept for backward compatibility)
export const generateProfilePhotoKey = (userId: string): string => {
  const timestamp = Date.now();
  return `profile-photos/${userId}-${timestamp}`;
};

export const generatePostImageKey = (
  postId: Id<"posts"> | string,
  imageIndex: number,
  extension = "jpg"
): string => {
  return `post-images/${postId}/${imageIndex}.${extension}`;
};

// Upload image to Convex storage (for conversations, reports, etc.)
export async function uploadImageToConvex(
  imageUri: string,
  generateConvexUploadUrl: ReturnType<
    typeof useMutation<typeof api.storage.generateConvexUploadUrl>
  >
): Promise<UploadResult> {
  try {
    // Compress the image first
    const compressedImage = await compressImage(imageUri);
    if (!compressedImage) {
      throw new Error("Failed to compress image");
    }

    // Get upload URL
    const uploadUrl = await generateConvexUploadUrl();
    if (!uploadUrl) {
      throw new Error("Failed to get upload URL");
    }

    // Upload the file as a blob
    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();

    // Upload the file directly as blob with proper content type
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: blob,
    });

    if (!result.ok) {
      throw new Error("Failed to upload image");
    }

    const { storageId } = await result.json();
    return { storageId };
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
}

// Upload profile image to R2 with user-based custom key
export async function uploadProfileImageToR2(
  imageUri: string,
  generateProfileUploadUrl: ReturnType<
    typeof useMutation<typeof api.storage.generateProfileUploadUrl>
  >,
  syncMetadata: ReturnType<typeof useMutation<typeof api.storage.syncMetadata>>
): Promise<UploadResult> {
  try {
    // Compress the image first
    const compressedImage = await compressImage(imageUri);
    if (!compressedImage) {
      throw new Error("Failed to compress image");
    }

    // Get signed URL with user-based custom key
    const { url, key } = await generateProfileUploadUrl();

    // Convert to blob for upload
    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();

    // Upload file to R2
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    // Sync metadata to Convex
    await syncMetadata({ key });

    return { key };
  } catch (error) {
    console.error("Profile R2 Upload failed:", error);
    return null;
  }
}

// Upload post image to R2 with content-based custom key
export async function uploadPostImageToR2(
  imageUri: string,
  postId: Id<"posts">,
  imageIndex: number,
  generatePostUploadUrl: ReturnType<
    typeof useMutation<typeof api.storage.generatePostUploadUrl>
  >,
  syncMetadata: ReturnType<typeof useMutation<typeof api.storage.syncMetadata>>
): Promise<UploadResult> {
  try {
    // Compress the image first
    const compressedImage = await compressImage(imageUri);
    if (!compressedImage) {
      throw new Error("Failed to compress image");
    }

    // Get signed URL with content-based custom key
    const { url, key } = await generatePostUploadUrl({
      postId,
      imageIndex,
    });

    // Convert to blob for upload
    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();

    // Upload file to R2
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    // Sync metadata to Convex
    await syncMetadata({ key });

    return { key };
  } catch (error) {
    console.error("Post R2 Upload failed:", error);
    return null;
  }
}

// Upload conversation attachment to R2
export async function uploadConversationAttachmentToR2(
  imageUri: string,
  conversationId: string,
  generateConversationUploadUrl: ReturnType<
    typeof useMutation<typeof api.storage.generateConversationUploadUrl>
  >,
  syncMetadata: ReturnType<typeof useMutation<typeof api.storage.syncMetadata>>
): Promise<UploadResult> {
  try {
    const compressedImage = await compressImage(imageUri);
    if (!compressedImage) {
      throw new Error("Failed to compress image");
    }

    const { url, key } = await generateConversationUploadUrl({
      conversationId,
    });

    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();

    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    await syncMetadata({ key });

    return { key };
  } catch (error) {
    console.error("Conversation R2 Upload failed:", error);
    return null;
  }
}

// Upload discussion image to R2
export async function uploadDiscussionImageToR2(
  imageUri: string,
  communityId: Id<"communities">,
  discussionId: Id<"discussions">,
  generateDiscussionUploadUrl: ReturnType<
    typeof useMutation<typeof api.storage.generateDiscussionUploadUrl>
  >,
  syncMetadata: ReturnType<typeof useMutation<typeof api.storage.syncMetadata>>
): Promise<UploadResult> {
  try {
    const compressedImage = await compressImage(imageUri);
    if (!compressedImage) {
      throw new Error("Failed to compress image");
    }

    const { url, key } = await generateDiscussionUploadUrl({
      communityId,
      discussionId,
    });

    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();

    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    await syncMetadata({ key });

    return { key };
  } catch (error) {
    console.error("Discussion R2 Upload failed:", error);
    return null;
  }
}

// Image compression utility for React Native
export async function compressImage(
  imageUri: string,
  maxWidth = 1200
): Promise<ImageManipulator.ImageResult | null> {
  try {
    // First, resize the image if it's too large
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: maxWidth,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Check if the image is still too large (> 1MB)
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();

    if (blob.size > 1024 * 1024) {
      // If still too large, compress more aggressively
      return await ImageManipulator.manipulateAsync(
        resizedImage.uri,
        [
          {
            resize: {
              width: Math.floor(maxWidth * 0.7), // Reduce size more
            },
          },
        ],
        {
          compress: 0.6, // More aggressive compression
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
    }

    return resizedImage;
  } catch (error) {
    console.error("Image compression failed:", error);
    return null;
  }
}

// Helper to validate image URI (for React Native)
export async function validateImageUri(
  imageUri: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      return "File must be an image";
    }

    // We'll compress it anyway, so no need to check size here
    return null;
  } catch (error) {
    return "Invalid image file";
  }
}
