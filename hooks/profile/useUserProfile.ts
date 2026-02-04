import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ActionSheetOption, ActionSheetRef } from "@/components/common/ActionSheet";
import { router } from "expo-router";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

export const useUserDetails = (userId: Id<"users"> | undefined) => {
  // States
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showRemoveFriendConfirmation, setShowRemoveFriendConfirmation] = useState(false);
  const [profileLoadingModalState, setProfileLoadingModalState] = useState<LoadingModalState>('hidden');
  const [blockLoadingModalState, setBlockLoadingModalState] = useState<LoadingModalState>('hidden');

  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);

  // Refs
  const actionModalRef = useRef<ActionSheetRef>(null);

  // Theme
  const theme = useTheme();
  const { t } = useTranslation();

  const result = useQuery(
    api.users.queries.getUserProfile,
    !userId || isBlocking ? "skip" : { userId }
  );

  // Redirect to profile tab if viewing own profile
  useEffect(() => {
    if (result && !result.ok && result.error === "OWN_PROFILE") {
      router.replace("/(tabs)/profile");
    }
  }, [result]);

  const blockUserMutation = useMutation(api.users.mutations.blockUser);
  const sendFriendRequestMutation = useMutation(api.friendships.mutations.sendFriendRequest);
  const removeFriendMutation = useMutation(api.friendships.mutations.removeFriend);

  // Loading state
  const restrictionError = result && !result.ok && result.error === "PRIVACY_RESTRICTION";
  const loading = result === undefined && !isBlocking;
  const userProfile = result && result.ok ? result.profile : undefined;

  // Action handlers
  const handleEllipsisPress = useCallback(() => {
    actionModalRef.current?.present();
  }, []);

  const handleBlockUser = useCallback(() => {
    setShowBlockConfirmation(true);
  }, []);

  const handleReportUser = useCallback(() => {
    actionModalRef.current?.dismiss();
    if (userProfile && userId) {
      router.push({
        pathname: "/screens/report",
        params: {
          type: "user",
          targetId: userId,
          targetName: userProfile.name,
        },
      });
    }
  }, [userProfile, userId]);

  const handleConfirmBlock = useCallback(async () => {
    if (!userId) return;

    setShowBlockConfirmation(false);
    setBlockLoadingModalState('loading');

    try {
      setIsBlocking(true);
      await blockUserMutation({ userId });

      setBlockLoadingModalState('success');

      // Navigate back after success animation
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/discover");
        }
      }, 2000);
    } catch (error) {
      setIsBlocking(false);
      setBlockLoadingModalState('error');
    }
  }, [userId, blockUserMutation, t]);

  const handleCancelBlock = useCallback(() => {
    setShowBlockConfirmation(false);
  }, []);

  const handleFriendAction = useCallback(async () => {
    if (!userProfile || userProfile.hasPendingRequest) return;

    await handleSendFriendRequest();
  }, [userProfile, handleSendFriendRequest]);

  const handleSendFriendRequest = useCallback(
    async () => {
      if (!userId) return;

      setIsSendingFriendRequest(true);
      try {
        await sendFriendRequestMutation({
          receiverId: userId,
        });

        setIsProcessingRequest(true);
      } catch (error) {
        console.error('Failed to send friend request:', error);
      } finally {
        setIsSendingFriendRequest(false);
      }
    },
    [userId, sendFriendRequestMutation]
  );

  const handleConfirmRemoveFriend = useCallback(async () => {
    if (!userId) return;

    setShowRemoveFriendConfirmation(false);
    setBlockLoadingModalState('loading');

    try {
      setIsProcessingRequest(true);

      await removeFriendMutation({
        friendUserId: userId,
      });

      setBlockLoadingModalState('success');
    } catch (error) {
      setBlockLoadingModalState('error');
    } finally {
      setIsProcessingRequest(false);
    }
  }, [userId, removeFriendMutation]);

  const handleCancelRemoveFriend = useCallback(() => {
    setShowRemoveFriendConfirmation(false);
  }, []);



  // Loading modal handlers
  const handleProfileLoadingModalComplete = useCallback(() => {
    setProfileLoadingModalState('hidden');
  }, []);

  const handleBlockLoadingModalComplete = useCallback(() => {
    setBlockLoadingModalState('hidden');
  }, []);

  const actionModalOptions: ActionSheetOption[] = useMemo(
    () => {
      const options: ActionSheetOption[] = [
        {
          id: "report-user",
          title: t("actions.reportUser"),
          icon: "flag-outline",
          color: theme.colors.error,
          onPress: handleReportUser,
        },
        {
          id: "block-user",
          title: t("actions.blockUser"),
          icon: "ban",
          color: theme.colors.error,
          onPress: handleBlockUser,
        },
      ];

      // Only add "Remove Friend" if the user is a friend
      if (userProfile?.isFriend) {
        options.unshift({
          id: "friend-action",
          title: t("actions.removeFriend"),
          icon: "person-remove",
          color: theme.colors.error,
          // dismiss Modal and show confirmation modal
          onPress: () => {
            actionModalRef.current?.dismiss();
            setShowRemoveFriendConfirmation(true);
          },
        });
      }
      return options;
    },
    [theme.colors.error, handleReportUser, handleBlockUser, userProfile, t]
  );

  return {
    // State
    userProfile,
    loading,
    restrictionError,
    showBlockConfirmation,
    isBlocking,
    showRemoveFriendConfirmation,
    profileLoadingModalState,
    blockLoadingModalState,
    isProcessingRequest,
    isSendingFriendRequest,

    // Refs
    actionModalRef,

    // Actions
    handleEllipsisPress,
    handleBlockUser,
    handleConfirmBlock,
    handleCancelBlock,
    handleFriendAction,
    handleSendFriendRequest,
    handleConfirmRemoveFriend,
    handleCancelRemoveFriend,
    handleProfileLoadingModalComplete,
    handleBlockLoadingModalComplete,

    // Options
    actionModalOptions,
  };
};
