import { FC, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";


interface AddReactionModalProps {
  visible: boolean;
  postId: Id<"posts">;
  currentReaction?: string; // Current user's reaction emoji
  onClose: () => void;
  onReaction: (postId: Id<"posts">, emoji: string) => void;
}

// Predefined emojis for reactions
const REACTION_EMOJIS = [
  "❤️", "😂", "😮", "😢", "🙌", "👍", "👎", "🔥", "💯", "🎉", "😍", "🤔"
];

export const AddReactionModal: FC<AddReactionModalProps> = ({
  visible,
  postId,
  currentReaction,
  onClose,
  onReaction
}) => {
  const theme = useTheme();

  const handleReaction = useCallback((emoji: string) => {
    onReaction(postId, emoji);
    onClose();
  }, [postId, onReaction, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 16,
      maxWidth: 320,
      width: '90%',
    },
    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    reactionButton: {
      padding: 12,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      minWidth: 48,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedReactionButton: {
      backgroundColor: theme.colors.primary,
      transform: [{ scale: 1.1 }],
    },
    reactionEmoji: {
      fontSize: 24,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => { }}>
          <View style={styles.modalContainer}>
            <View style={styles.reactionsContainer}>
              {REACTION_EMOJIS.map((emoji, index) => {
                const isSelected = currentReaction === emoji;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.reactionButton,
                      isSelected && styles.selectedReactionButton
                    ]}
                    onPress={() => handleReaction(emoji)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
