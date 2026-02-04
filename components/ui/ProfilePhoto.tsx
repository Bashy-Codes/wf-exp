import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/Theme";

interface ProfilePhotoProps {
  profilePicture?: string;
  size?: number;
  style?: ViewStyle;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  profilePicture,
  size = 60,
  style
}) => {
  const theme = useTheme();

  const containerSize = size;

  const styles = StyleSheet.create({
    container: {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
      position: "relative",
      overflow: "hidden",
      borderWidth: size >= 70 ? 2 : 0,
      borderColor: theme.colors.primary,
      zIndex: 1
    },
    image: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: containerSize / 2,
      backgroundColor: theme.colors.surface,
      zIndex: 2,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: profilePicture }}
        style={styles.image}
        contentFit="cover"
        cachePolicy={"memory-disk"}
        priority={"normal"}
      />
    </View>
  );
};

export default memo(ProfilePhoto);
