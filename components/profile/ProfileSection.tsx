import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { getCountryByCode } from "@/constants/geographics";
import { Image } from "expo-image";
import { ProfileItem } from "./ProfileItem";
import ProfilePhoto from "../ui/ProfilePhoto";
import NameContainer from "../ui/NameContainer";
import AgeGenderChip from "../ui/AgeGenderChip";
import { Button } from "../ui/Button";
import { Separator } from "../common/Separator";

interface ProfileSectionProps {
  profilePicture: string;
  name: string;
  gender: "male" | "female" | "other";
  age: number;
  countryCode: string;
  isPremiumUser: boolean;
  aboutMe: string;
  spokenLanguageCodes: string[];
  learningLanguageCodes: string[];
  hobbies: string[];
  showActions?: boolean;
  hasPendingRequest?: boolean;
  onActionPress: () => void;
  isProcessingRequest?: boolean;
  lastActive?: string | null;
}

export const ProfileSection = memo<ProfileSectionProps>(
  ({
    profilePicture,
    name,
    gender,
    age,
    countryCode,
    isPremiumUser = false,
    aboutMe,
    spokenLanguageCodes,
    learningLanguageCodes,
    hobbies,
    showActions = false,
    hasPendingRequest = false,
    onActionPress,
    isProcessingRequest = false,
    lastActive,
  }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const country = getCountryByCode(countryCode);

    const styles = StyleSheet.create({
      bannerContainer: {
        height: 200,
        backgroundColor: theme.colors.surface,
        position: "relative",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: "hidden",
        objectFit: "cover",
      },
      banner: {
        width: "100%",
        height: "100%",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: "hidden",
        objectFit: "cover",
      },
      userInfoContainer: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginTop: -60,
      },
      profilePhotoWrapper: {
        borderWidth: 4,
        borderColor: theme.colors.background,
        borderRadius: 64,
        overflow: "hidden",
      },
      lastActiveText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 12,
      },
      detailRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `${theme.colors.info}15`,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.full,
        gap: 8,
      },
      countryFlag: {
        fontSize: 18,
      },
      countryText: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
      },
      actionsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
      },
    });

    return (
      <View>
        <View style={styles.bannerContainer}>
          <Image
            source={require("@/assets/images/profile-banner.jpeg")}
            style={styles.banner}
            contentFit="cover"
          />
        </View>

        <View style={styles.userInfoContainer}>
          <View style={styles.profilePhotoWrapper}>
            <ProfilePhoto profilePicture={profilePicture} size={120} />
          </View>
          {lastActive && (
            <Text style={styles.lastActiveText}>
              {lastActive}
            </Text>
          )}
          <NameContainer
            size={32}
            name={name}
            isPremiumUser={isPremiumUser}
          />
          <AgeGenderChip size="large" gender={gender} showGenerText age={age} />
          <View style={styles.detailRow}>
            <Text style={styles.countryFlag}>{country?.flag}</Text>
            <Text style={styles.countryText}>{country?.name}</Text>
          </View>
        </View>

        {showActions && (
          <View style={styles.actionsContainer}>
            {hasPendingRequest ? (
              <Button
                iconName="time"
                title={t("profile.pendingRequest")}
                disabled
                onPress={() => { }}
              />
            ) : (
              <Button
                iconName="person-add"
                title={t("profile.addFriend")}
                onPress={onActionPress}
                disabled={isProcessingRequest}
              />
            )}
          </View>
        )}

        <Separator customOptions={["⋆｡✿ ⋆ ── ⋆ ✿｡⋆"]} />

        <ProfileItem
          type="about"
          title={t("profile.items.aboutMe")}
          icon="person-circle"
          data={{ aboutMe }}
        />
        <ProfileItem
          type="languages"
          title={t("profile.items.languages")}
          icon="language"
          data={{
            spokenLanguages: spokenLanguageCodes,
            learningLanguages: learningLanguageCodes,
          }}
        />
        <ProfileItem
          type="hobbies"
          title={t("profile.items.hobbies")}
          icon="heart"
          data={{ hobbies }}
        />
      </View>
    );
  }
);