import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/Theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const TAB_ICONS = {
  index: { active: 'home', inactive: 'home-outline' },
  discover: { active: 'earth', inactive: 'earth-outline' },
  friends: { active: 'people', inactive: 'people-outline' },
  conversations: { active: 'chatbox-ellipses', inactive: 'chatbox-ellipses-outline' },

  profile: { active: 'person', inactive: 'person-outline' },
} as const;

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const hasUnreadConversations = useQuery(api.conversations.queries.hasUnreadConversations);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingBottom: insets.bottom + 8,
      paddingTop: 12,
      paddingHorizontal: 10,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    tabButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: 2,
    },
    activeTab: {
      backgroundColor: `${theme.colors.primary}15`,
    },
    notificationBadge: {
      position: 'absolute',
      top: 6,
      right: 14,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.error,
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
      zIndex: 1,
    }

  }), [theme, insets]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToAlignment="center"
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.tabContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const iconName = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
            const iconToShow = isFocused ? iconName?.active : iconName?.inactive;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.tabButton, isFocused && styles.activeTab]}
                activeOpacity={0.7}
              >
                {route.name === 'conversations' && hasUnreadConversations && (
                  <View style={styles.notificationBadge} />
                )}
                <Ionicons
                  name={iconToShow as any}
                  size={24}
                  color={
                    isFocused ? theme.colors.tabBarActive : theme.colors.textMuted
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
