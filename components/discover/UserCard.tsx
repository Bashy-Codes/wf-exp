import { FC, memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { getCountryByCode, getLanguageByCode } from "@/constants/geographics";
import type { UserCardData } from "@/types/discover";
import { useTranslation } from "react-i18next";
import { Id } from "@/convex/_generated/dataModel";

import AgeGenderChip from "@/components/ui/AgeGenderChip";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import NameContainer from "@/components/ui/NameContainer";

interface UserCardProps {
  user: UserCardData;
  onViewProfile: (userId: Id<"users">) => void;
}

const UserCardComponent: FC<UserCardProps> = ({
  user,
  onViewProfile,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const country = getCountryByCode(user.country);

  const spokenLanguages = user.spokenLanguages
    .slice(0, 2)
    .map((code: string) => getLanguageByCode(code)?.name)
    .filter(Boolean)
    .join(", ");

  const learningLanguages = user.learningLanguages
    .slice(0, 2)
    .map((code: string) => getLanguageByCode(code)?.name)
    .filter(Boolean)
    .join(", ");

  const handleViewProfile = useCallback(() => {
    onViewProfile(user.userId);
  }, [user.userId, onViewProfile]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 20,
      marginHorizontal: 16,
      marginVertical: 8,
      alignItems: "center",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 3,
      width: "100%",
    },
    detailIcon: {
      marginRight: 12,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
      marginRight: 8,
    },
    detailValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "600",
      flexShrink: 1,
    },
    flagEmoji: {
      fontSize: 16,
      marginRight: 8,
    },
    profilePhotoContainer: {
      position: "relative",
    },
    onlineIndicator: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.success,
      borderWidth: 3,
      borderColor: theme.colors.surface,
    },
  });

  return (
    <TouchableOpacity onPress={handleViewProfile} activeOpacity={0.9} style={styles.card}>
      <ProfilePhoto
        profilePicture={user.profilePicture}
        size={120}
      />
      <NameContainer name={user.name} isPremiumUser={user.isPremiumUser} size={30} />
      <AgeGenderChip size="large" gender={user.gender} age={user.age} />

      <View style={styles.detailRow}>
        <Ionicons
          name="location-outline"
          size={20}
          color={theme.colors.error}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{t("userCard.country")}</Text>
        <Text style={styles.flagEmoji}>{country?.flag}</Text>
        <Text style={styles.detailValue}>{country?.name || "Unknown"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons
          name="language-outline"
          size={20}
          color={theme.colors.success}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{t("userCard.speaks")}</Text>
        <Text style={styles.detailValue}>{spokenLanguages || "🌍"}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons
          name="earth-outline"
          size={20}
          color={theme.colors.info}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{t("userCard.learning")}</Text>
        <Text style={styles.detailValue} >{learningLanguages || "🌍"}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const UserCard = memo(UserCardComponent);
