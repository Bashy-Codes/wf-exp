import type React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const PostCardSkeleton: React.FC = () => {
  const theme = useTheme();
  const imageCount = useMemo(() => Math.floor(Math.random() * 3) + 1, []);

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    userSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    profilePicture: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.full,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      width: "60%",
      height: 16,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 6,
    },
    timeText: {
      width: "40%",
      height: 12,
      borderRadius: theme.borderRadius.sm,
    },
    moreButton: {
      width: 26,
      height: 26,
      borderRadius: theme.borderRadius.lg,
    },
    content: {
      paddingHorizontal: 16,
      marginVertical: 16,
    },
    contentLine1: {
      width: "95%",
      height: 15,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 6,
    },
    contentLine2: {
      width: "85%",
      height: 15,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 6,
    },
    contentLine3: {
      width: "70%",
      height: 15,
      borderRadius: theme.borderRadius.sm,
    },
    imagesContainer: {
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    imageScrollView: {
      flexDirection: "row",
    },
    image: {
      width: 200,
      height: 150,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor: theme.colors.surface,
    },
    singleImage: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    metaContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    leftActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    reactionButton: {
      width: 70,
      height: 32,
      borderRadius: theme.borderRadius.full,
      marginRight: 16,
    },
    commentButton: {
      width: 60,
      height: 32,
      borderRadius: theme.borderRadius.full,
    },
    reactionsCount: {
      width: 40,
      height: 20,
      borderRadius: theme.borderRadius.sm,
    },
  });

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

  return (
    <View >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.profilePicture}
          />
          <View style={styles.userInfo}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.userName}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.timeText}
            />
          </View>
        </View>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.moreButton}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.contentLine1}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.contentLine2}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.contentLine3}
        />
      </View>

      {/* Images */}
      <View style={styles.imagesContainer}>
        {imageCount === 1 ? (
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.singleImage}
          />
        ) : (
          <View style={styles.imageScrollView}>
            {Array.from({ length: imageCount }).map((_, index) => (
              <ShimmerPlaceholder
                key={index}
                shimmerColors={shimmerColors}
                style={styles.image}
              />
            ))}
          </View>
        )}
      </View>


      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.reactionButton}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.commentButton}
          />
        </View>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.reactionsCount}
        />
      </View>
    </View >
  );
};