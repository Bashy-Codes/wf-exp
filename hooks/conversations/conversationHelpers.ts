import { useRef, useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useConvex } from "convex/react";
import { insertAtTop } from "convex/react";
import { MessageData } from "@/types/conversations";
import { uploadConversationAttachmentToR2 } from "@/utils/uploadImages";

interface UseConversationHelpersProps {
  conversationId?: string;
  groupId?: Id<"groups">;
  isGroup?: boolean;
}

export const useConversationHelpers = ({
  conversationId,
  groupId,
  isGroup = false,
}: UseConversationHelpersProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const convex = useConvex();

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [deleteMessageModalVisible, setDeleteMessageModalVisible] = useState(false);
  const [correctionModalVisible, setCorrectionModalVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const markAsReadMutation = useMutation(api.conversations.mutations.markAsRead);
  const deleteMessageMutation = useMutation(api.conversations.mutations.deleteMessage);
  const correctMessageMutation = useMutation(api.conversations.mutations.correctMessage);
  const generateUploadUrl = useMutation(api.storage.generateConversationUploadUrl);
  const syncMetadata = useMutation(api.storage.syncMetadata);
  const markGroupAsReadMutation = useMutation(api.groups.mutations.markGroupAsRead);

  const sendMessageMutation = useMutation(api.conversations.mutations.sendMessage).withOptimisticUpdate(
    (localStore, args) => {
      if (isGroup) {
        if (args.groupId !== groupId) return;
      } else {
        if (args.conversationId !== conversationId) return;
      }

      const now = Date.now();
      const tempId = `temp-${now}-${Math.random()}` as Id<"messages">;

      const optimisticMessage: any = {
        _id: tempId,
        _creationTime: now,
        conversationId: args.conversationId,
        groupId: args.groupId,
        senderId: undefined,
        content: args.content ?? undefined,
        type: args.type ?? "text",
        attachment: args.attachment,
        replyParentId: args.replyParentId,
        correction: undefined,
        messageId: tempId,
        createdAt: now,
        attachmentUrl: undefined,
        replyParent: undefined,
        sender: undefined,
        isOwner: true,
      };

      if (isGroup) {
        insertAtTop({
          paginatedQuery: api.groups.queries.getGroupMessages,
          argsToMatch: { groupId: args.groupId },
          localQueryStore: localStore,
          item: optimisticMessage,
        });
      } else {
        insertAtTop({
          paginatedQuery: api.conversations.queries.getConversationMessages,
          argsToMatch: { conversationId: args.conversationId },
          localQueryStore: localStore,
          item: optimisticMessage,
        });
      }
    }
  );

  const deleteMessage = useCallback(
    async (messageId: Id<"messages">) => {
      try {
        setIsDeleting(messageId);
        await deleteMessageMutation({ messageId });
      } catch (error) {
        console.error("Failed to delete message:", error);
      } finally {
        setIsDeleting(null);
      }
    },
    [deleteMessageMutation]
  );

  const correctMessage = useCallback(
    async (messageId: Id<"messages">, correction: string) => {
      try {
        await correctMessageMutation({ messageId, correction });
        Toast.show({
          type: "success",
          text1: t("successToasts.messageCorrected")
        });
      } catch (error) {
        console.error("Failed to correct message:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    },
    [correctMessageMutation, t]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        setIsSending(true);

        const args: any = {
          content: content.trim(),
          type: "text",
          replyParentId: replyingTo?.messageId,
        };

        if (isGroup) {
          args.groupId = groupId;
        } else {
          args.conversationId = conversationId;
        }

        await sendMessageMutation(args);

        if (replyingTo) {
          setReplyingTo(null);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, groupId, isGroup, replyingTo, sendMessageMutation, t]
  );

  const sendImage = useCallback(
    async (attachment: string) => {
      try {
        setIsSending(true);
        const args: any = {
          type: "image",
          attachment,
        };

        if (isGroup) {
          args.groupId = groupId;
        } else {
          args.conversationId = conversationId;
        }

        await sendMessageMutation(args);
      } catch (error) {
        console.error("Failed to send image:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, groupId, isGroup, sendMessageMutation, t]
  );

  const sendGif = useCallback(
    async (gifUrl: string) => {
      try {
        setIsSending(true);
        const args: any = {
          type: "gif",
          attachment: gifUrl,
        };

        if (isGroup) {
          args.groupId = groupId;
        } else {
          args.conversationId = conversationId;
        }

        await sendMessageMutation(args);
      } catch (error) {
        console.error("Failed to send GIF:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, groupId, isGroup, sendMessageMutation, t]
  );

  const sendAttachment = useCallback(
    async (attachmentUri: string, attachmentType: "image" | "gif", gifUrl?: string) => {
      try {
        setIsSending(true);
        if (attachmentType === "gif" && gifUrl) {
          await sendGif(gifUrl);
        } else {
          const result = await uploadConversationAttachmentToR2(
            attachmentUri,
            conversationId || groupId || "",
            generateUploadUrl,
            syncMetadata
          );

          if (!result?.key) {
            throw new Error("Failed to upload image");
          }

          await sendImage(result.key);
        }
      } catch (error) {
        console.error("Failed to send attachment:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, groupId, sendGif, sendImage, generateUploadUrl, syncMetadata, t]
  );

  const startReply = useCallback((message: MessageData) => {
    setReplyingTo(message);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleMessageLongPress = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    setActionModalVisible(true);
  }, []);

  const handleReply = useCallback(
    (message: MessageData) => {
      startReply(message);
    },
    [startReply]
  );

  const handleDeleteMessage = useCallback(
    (message: MessageData) => {
      setSelectedMessage(message);
      setDeleteMessageModalVisible(true);
    },
    []
  );

  const handleCorrectMessage = useCallback(
    (message: MessageData) => {
      setSelectedMessage(message);
      setCorrectionModalVisible(true);
    },
    []
  );

  const confirmCorrectMessage = useCallback(
    async (messageId: string, correction: string) => {
      await correctMessage(messageId as Id<"messages">, correction);
      setCorrectionModalVisible(false);
      setSelectedMessage(null);
    },
    [correctMessage]
  );

  const confirmDeleteMessage = useCallback(async () => {
    if (selectedMessage) {
      await deleteMessage(selectedMessage.messageId);
      setDeleteMessageModalVisible(false);
      setSelectedMessage(null);
    }
  }, [selectedMessage, deleteMessage]);

  const handleBackPress = useCallback(() => {
    if (isGroup && groupId) {
      markGroupAsReadMutation({ groupId }).catch((error) => {
        console.error("Failed to mark group as read:", error);
      });
    } else if (conversationId) {
      markAsReadMutation({ conversationId }).catch((error) => {
        console.error("Failed to mark conversation as read:", error);
      });
    }
    router.back();
  }, [router, conversationId, groupId, isGroup, markAsReadMutation, markGroupAsReadMutation]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current === "active" &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        if (isGroup && groupId) {
          markGroupAsReadMutation({ groupId }).catch((error) => {
            console.error("Failed to mark group as read:", error);
          });
        } else if (conversationId) {
          markAsReadMutation({ conversationId }).catch((error) => {
            console.error("Failed to mark conversation as read:", error);
          });
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [conversationId, groupId, isGroup, markAsReadMutation, markGroupAsReadMutation]);

  useEffect(() => {
    const handleHardwareBackPress = () => {
      if (isGroup && groupId) {
        markGroupAsReadMutation({ groupId }).catch((error) => {
          console.error("Failed to mark group as read:", error);
        });
      } else if (conversationId) {
        markAsReadMutation({ conversationId }).catch((error) => {
          console.error("Failed to mark conversation as read:", error);
        });
      }
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleHardwareBackPress);
    return () => backHandler.remove();
  }, [conversationId, groupId, isGroup, markAsReadMutation, markGroupAsReadMutation, router]);

  return {
    selectedMessage,
    replyingTo,
    isSending,
    isDeleting,
    actionModalVisible,
    deleteMessageModalVisible,
    correctionModalVisible,
    setActionModalVisible,
    setDeleteMessageModalVisible,
    setCorrectionModalVisible,
    sendMessage,
    sendImage,
    sendGif,
    sendAttachment,
    deleteMessage,
    correctMessage,
    startReply,
    cancelReply,
    handleMessageLongPress,
    handleReply,
    handleDeleteMessage,
    handleCorrectMessage,
    confirmDeleteMessage,
    confirmCorrectMessage,
    handleBackPress,
  };
};
