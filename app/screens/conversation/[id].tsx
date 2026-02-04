import { useCallback, useMemo, memo, useRef } from "react"
import { StyleSheet, View, ActivityIndicator } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/Theme"
import { useConversation } from "@/hooks/conversations/useConversation"
import type { Message as MessageData } from "@/types/conversations"
import { formatDateHeader, formatMessageTime, shouldShowTimestamp, shouldShowDateHeader } from "@/utils/chatTimeFormat"

// components
import { KeyboardHandler } from "@/components/KeyboardHandler"
import { ConfirmationModal } from "@/components/common/ConfirmationModal"
import { EmptyState } from "@/components/EmptyState"
import { ConversationHeader } from "@/components/conversations/ConversationHeader"
import { MessageBubble } from "@/components/conversations/MessageBubble"
import { MessageInput } from "@/components/conversations/MessageInput"
import { ActionModal } from "@/components/conversations/ActionModal"
import { CorrectionModal } from "@/components/conversations/CorrectionModal"

const MessageItemMemo = memo(
  ({
    item,
    dateHeader,
    timeLabel,
    onLongPress,
    onSwipeReply,
  }: {
    item: MessageData
    dateHeader?: string
    timeLabel?: string
    onLongPress: (message: MessageData) => void
    onSwipeReply: (message: MessageData) => void
  }) => (
    <MessageBubble
      message={item}
      dateHeader={dateHeader}
      timeLabel={timeLabel}
      onLongPress={onLongPress}
      onSwipeReply={onSwipeReply}
    />
  ),
)

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const theme = useTheme()
  const { t } = useTranslation()

  const conversationId = (id as string) || ""
  const flashListRef = useRef<any>(null)

  const {
    conversationInfo,
    messages,
    isLoadingConversation,
    isLoadingMessages,
    loadOlderMessages,
    hasOlderMessages,
    selectedMessage,
    replyingTo,
    isSending,
    error,
    actionModalVisible,
    deleteMessageModalVisible,
    correctionModalVisible,
    handleBackPress,
    handleMessageLongPress,
    handleReply,
    handleDeleteMessage,
    handleCorrectMessage,
    sendMessage,
    sendAttachment,
    setActionModalVisible,
    setDeleteMessageModalVisible,
    setCorrectionModalVisible,
    confirmDeleteMessage,
    confirmCorrectMessage,
    cancelReply,
  } = useConversation(conversationId)

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages])

  // Important for preventing glitches when scrolling upwards
  const keyExtractor = useCallback((item: MessageData) => item.messageId, [])

  const handleStartReached = useCallback(() => {
    if (hasOlderMessages && !isLoadingMessages) {
      loadOlderMessages()
    }
  }, [hasOlderMessages, isLoadingMessages, loadOlderMessages])

  const renderItem = useCallback(
    ({ item, index }: { item: MessageData; index: number }) => {
      const previousMessage = index > 0 ? reversedMessages[index - 1] : undefined
      const prevTimestamp = previousMessage?.createdAt

      const dateHeader = shouldShowDateHeader(item.createdAt, prevTimestamp)
        ? formatDateHeader(item.createdAt)
        : undefined

      const timeLabel = shouldShowTimestamp(item.createdAt, prevTimestamp)
        ? formatMessageTime(item.createdAt)
        : undefined

      return (
        <MessageItemMemo
          item={item}
          dateHeader={dateHeader}
          timeLabel={timeLabel}
          onLongPress={handleMessageLongPress}
          onSwipeReply={handleReply}
        />
      )
    },
    [handleMessageLongPress, handleReply, reversedMessages],
  )

  const maintainVisibleConfig = useMemo(
    () => ({
      autoscrollToBottomThreshold: 0.3,
      startRenderingFromBottom: true,
      animateAutoScrollToBottom: true,
    }),
    [],
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: "flex-end",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  })

  const isLoadingInitial = isLoadingConversation || (isLoadingMessages && messages.length === 0)

  if (!id || error) {
    return <EmptyState style={{ flex: 1 }} />
  }

  return (
    <KeyboardHandler enabled={true} style={styles.container}>
      {/* Header */}
      <ConversationHeader
        userId={conversationInfo?.otherUser.userId}
        name={isLoadingInitial ? "Loading..." : conversationInfo?.otherUser.name || ""}
        isPremiumUser={conversationInfo?.otherUser.isPremiumUser || false}
        onBackPress={handleBackPress}
      />

      {isLoadingInitial ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlashList
          ref={flashListRef}
          data={reversedMessages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onStartReached={handleStartReached}
          onStartReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={maintainVisibleConfig}
          contentContainerStyle={styles.contentContainer}
          drawDistance={500}
        />
      )}

      {/* Message Input */}
      <MessageInput
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
        isSending={isSending}
        messagePlaceholder={t("common.typeMessage")}
        onSendMessage={sendMessage}
        onSendAttachment={sendAttachment}
      />

      {/* Action Modal for message actions */}
      <ActionModal
        visible={actionModalVisible}
        message={selectedMessage}
        onReply={handleReply}
        onCorrect={handleCorrectMessage}
        onDelete={handleDeleteMessage}
        onClose={() => setActionModalVisible(false)}
      />

      {/* Correction Modal */}
      <CorrectionModal
        visible={correctionModalVisible}
        message={selectedMessage}
        onCorrect={confirmCorrectMessage}
        onClose={() => setCorrectionModalVisible(false)}
      />

      {/* Delete Message Confirmation Modal */}
      <ConfirmationModal
        visible={deleteMessageModalVisible}
        icon="trash-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.deleteMessage")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteMessageModalVisible(false)}
      />
    </KeyboardHandler>
  )
}