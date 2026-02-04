import { useState, useRef, useCallback } from "react";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { uploadPostImageToR2 } from "@/utils/uploadImages";
import { CollectionsModalRef } from "@/components/feed/CollectionsModal";
import { AttachmentPickerRef } from "@/components/common/AttachmentPicker";

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

interface Attachment {
  type: "image" | "gif";
  uri: string;
}

export const useCreatePost = () => {
  // State
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>('hidden');
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<Id<"collections"> | null>(null);

  // Convex mutations
  const createPost = useMutation(api.feed.posts.createPost);
  const updatePostAttachments = useMutation(api.feed.posts.updatePostAttachments);
  const generatePostUploadUrl = useMutation(api.storage.generatePostUploadUrl);
  const syncMetadata = useMutation(api.storage.syncMetadata);

  // Refs
  const attachmentPickerRef = useRef<AttachmentPickerRef>(null);
  const collectionsModalRef = useRef<CollectionsModalRef>(null);

  // Computed values
  const characterCount = content.length;
  const canPost = content.trim().length > 0;
  const hasChanges = content.trim().length > 0 || attachments.length > 0;

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  }, [hasChanges]);

  const confirmDiscard = useCallback(() => {
    setContent("");
    setAttachments([]);
    setSelectedCollectionId(null);
    setShowDiscardModal(false);
    router.back();
  }, []);

  // Attachment handling
  const handleAddAttachment = useCallback(() => {
    attachmentPickerRef.current?.present();
  }, []);

  const handleAttachmentSelected = useCallback((uri: string, type: "image" | "gif") => {
    setAttachments((prev) => {
      if (prev.length < 3) {
        return [...prev, { type, uri }];
      }
      return prev;
    });
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Collection selection handlers
  const openCollectionsSheet = useCallback(() => {
    collectionsModalRef.current?.present();
  }, []);

  const handleAddToCollectionPress = useCallback(() => {
    openCollectionsSheet();
  }, [openCollectionsSheet]);

  const handleCollectionSelect = useCallback(
    (collectionId: Id<"collections">) => {
      setSelectedCollectionId(collectionId);
      collectionsModalRef.current?.dismiss();
    },
    []
  );

  const handleRemoveCollection = useCallback(() => {
    setSelectedCollectionId(null);
  }, []);



  // Modal handlers
  const closeDiscardModal = useCallback(() => {
    setShowDiscardModal(false);
  }, []);

  const closePostModal = useCallback(() => {
    setShowPostModal(false);
  }, []);

  // Post creation handlers
  const handlePost = useCallback(() => {
    if (!canPost) return;
    setShowPostModal(true);
  }, [canPost]);

  const confirmPost = useCallback(async () => {
    if (!canPost) return;

    try {
      setLoadingModalState('loading');
      setShowPostModal(false);

      // Create the post first (without attachments)
      const result = await createPost({
        content: content.trim(),
        attachments: undefined,
        collectionId: selectedCollectionId || undefined,
      });

      const processedAttachments: Array<{ type: "image" | "gif"; url: string }> = [];

      // Upload images and add GIFs
      if (attachments.length > 0 && result.postId) {
        for (let i = 0; i < attachments.length; i++) {
          const attachment = attachments[i];
          
          if (attachment.type === "image") {
            const uploadResult = await uploadPostImageToR2(
              attachment.uri,
              result.postId,
              i + 1,
              generatePostUploadUrl,
              syncMetadata
            );

            if (!uploadResult || !uploadResult.key) {
              throw new Error(`Failed to upload image ${i + 1}`);
            }

            processedAttachments.push({ type: "image", url: uploadResult.key });
          } else if (attachment.type === "gif") {
            processedAttachments.push({ type: "gif", url: attachment.uri });
          }
        }

        // Update the post with all attachments
        await updatePostAttachments({
          postId: result.postId,
          attachments: processedAttachments,
        });
      }

      // Show success state
      setLoadingModalState('success');

      // Reset form
      setContent("");
      setAttachments([]);
      setSelectedCollectionId(null);

      // Navigate back to feed after success animation
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Post creation failed:", error);
      setLoadingModalState('error');
    }
  }, [
    canPost,
    content,
    attachments,
    createPost,
    generatePostUploadUrl,
    syncMetadata,
    updatePostAttachments,
    selectedCollectionId,
  ]);

  // Loading modal handlers
  const handleLoadingModalComplete = useCallback(() => {
    setLoadingModalState('hidden');
  }, []);


  return {
    // State
    content,
    attachments,
    showDiscardModal,
    showPostModal,
    loadingModalState,
    selectedCollectionId,

    // Refs
    attachmentPickerRef,
    collectionsModalRef,

    // Computed values
    characterCount,
    canPost,
    hasChanges,

    // Content handlers
    setContent,

    // Navigation handlers
    handleBack,

    // Post creation handlers
    handlePost,
    confirmPost,
    confirmDiscard,

    // Attachment handlers
    handleAddAttachment,
    handleAttachmentSelected,
    handleRemoveAttachment,

    // Collection handlers
    openCollectionsSheet,
    handleAddToCollectionPress,
    handleCollectionSelect,
    handleRemoveCollection,

    // Modal handlers
    closeDiscardModal,
    closePostModal,
    handleLoadingModalComplete
  };
};
