import React, { forwardRef, useImperativeHandle, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { WFModal } from "./WFModal";
import { FlashList } from "@shopify/flash-list";
import { EmptyState } from "@/components/EmptyState";

export interface SelectionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: React.ReactNode;
}

interface SelectionModalProps {
  items: SelectionItem[];
  loading?: boolean;
  onItemSelect: (item: SelectionItem) => void;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  headerIcon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  multiSelect?: boolean;
  selectedIds?: string[];
  onConfirm?: () => void;
}

export interface SelectionModalRef {
  present: () => void;
  dismiss: () => void;
}

export const SelectionModal = forwardRef<SelectionModalRef, SelectionModalProps>(
  ({ items, loading = false, onItemSelect, onLoadMore, canLoadMore = false, headerIcon = "list", title, multiSelect = false, selectedIds = [], onConfirm }, ref) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }), []);

    const handleItemPress = useCallback((item: SelectionItem) => {
      onItemSelect(item);
      if (!multiSelect) {
        setVisible(false);
      }
    }, [onItemSelect, multiSelect]);

    const handleConfirm = useCallback(() => {
      if (onConfirm) {
        onConfirm();
      }
      setVisible(false);
    }, [onConfirm]);

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    const handleLoadMore = useCallback(() => {
      if (canLoadMore && onLoadMore) {
        onLoadMore();
      }
    }, [canLoadMore, onLoadMore]);

    const renderItem = useCallback(({ item }: { item: SelectionItem }) => {
      const isSelected = selectedIds.includes(item.id);
      const styles = StyleSheet.create({
        itemContainer: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 18,
          paddingHorizontal: 20,
          borderRadius: theme.borderRadius.xl,
          marginVertical: 6,
          marginHorizontal: 4,
          backgroundColor: isSelected ? `${theme.colors.primary}15` : theme.colors.background,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: isSelected ? 2 : 0,
          borderColor: theme.colors.primary,
        },
        iconContainer: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: `${theme.colors.primary}15`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        },
        textContainer: {
          flex: 1,
          justifyContent: "center",
          marginLeft: 12,
        },
        title: {
          fontSize: 17,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: item.subtitle ? 3 : 0,
        },
        subtitle: {
          fontSize: 14,
          color: theme.colors.textMuted,
          fontWeight: "500",
        },
      });

      return (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.8}
        >
          {item.image ? (
            item.image
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.icon || "folder"}
                size={28}
                color={theme.colors.primary}
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }, [handleItemPress, theme, selectedIds]);

    const styles = StyleSheet.create({
      listContainer: {
        height: 460,
        marginHorizontal: -16,
        marginVertical: -24,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
      },
    });

    return (
      <WFModal
        visible={visible}
        onClose={handleClose}
        onConfirm={multiSelect ? handleConfirm : handleClose}
        headerIcon={headerIcon}
        title={title}
        confirmText={multiSelect ? "Done" : undefined}
      >
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlashList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => <EmptyState style={{ flex: 1, minHeight: 400 }} />}
              contentContainerStyle={{
                paddingVertical: 8,
              }}
              
            />
          )}
        </View>
      </WFModal>
    );
  }
);

