import React, { forwardRef, useState, useCallback, useImperativeHandle, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PickerItem {
  id: string;
  name: string;
  emoji: string;
}

interface ItemPickerModalProps {
  items: PickerItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onConfirm: () => void;
  multiSelect?: boolean;
  minSelection?: number;
  maxSelection?: number;
}

export interface ItemPickerModalRef {
  present: () => void;
  dismiss: () => void;
}

export const ItemPickerModal = forwardRef<ItemPickerModalRef, ItemPickerModalProps>(
  ({ items, selectedItems, onSelectionChange, onConfirm, multiSelect = false, minSelection = 0, maxSelection }, ref) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [tempSelectedItems, setTempSelectedItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
        setTempSelectedItems(selectedItems);
      },
      dismiss: () => {
        setVisible(false);
        setTempSelectedItems([]);
      },
    }), [selectedItems]);

    const handleItemPress = useCallback(
      (itemId: string) => {
        if (multiSelect) {
          const isSelected = tempSelectedItems.includes(itemId);
          if (isSelected) {
            const newSelection = tempSelectedItems.filter((id) => id !== itemId);
            if (minSelection > 0 && newSelection.length < minSelection) {
              return;
            }
            setTempSelectedItems(newSelection);
          } else {
            if (maxSelection && tempSelectedItems.length >= maxSelection) {
              return;
            }
            const newSelection = [...tempSelectedItems, itemId];
            setTempSelectedItems(newSelection);
          }
        } else {
          setTempSelectedItems([itemId]);
        }
      },
      [tempSelectedItems, multiSelect, minSelection, maxSelection]
    );

    const handleClose = useCallback(() => {
      setVisible(false);
      setTempSelectedItems([]);
      setSearchQuery("");
    }, []);

    const handleConfirm = useCallback(() => {
      if (minSelection > 0 && tempSelectedItems.length < minSelection) {
        return;
      }
      onSelectionChange(tempSelectedItems);
      onConfirm();
      setVisible(false);
      setTempSelectedItems([]);
      setSearchQuery("");
    }, [onConfirm, tempSelectedItems, onSelectionChange, minSelection]);

    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) return items;
      const query = searchQuery.toLowerCase();
      return items.filter(item => item.name.toLowerCase().includes(query));
    }, [items, searchQuery]);

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      },
      searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
      },
      searchInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: theme.colors.text,
      },
      confirmButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
      },
      listContent: {
        paddingHorizontal: 12,
        paddingBottom: 8,
      },
      itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.lg,
        marginVertical: 4,
        backgroundColor: theme.colors.surface,
      },
      selectedItem: {
        backgroundColor: theme.colors.primary,
      },
      itemContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
      },
      emoji: {
        fontSize: 24,
        marginRight: 16,
      },
      itemName: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: "600",
      },
      selectedItemName: {
        color: theme.colors.white,
        fontWeight: "700",
      },
      emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      },
      emptyText: {
        fontSize: 15,
        color: theme.colors.textMuted,
        textAlign: "center",
        marginTop: 12,
      },
    });

    const renderItem = useCallback(
      ({ item }: { item: PickerItem }) => {
        const isSelected = tempSelectedItems.includes(item.id);
        return (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              isSelected && styles.selectedItem,
            ]}
            onPress={() => handleItemPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[
                styles.itemName,
                isSelected && styles.selectedItemName,
              ]}>
                {item.name}
              </Text>
            </View>
            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.white}
              />
            )}
          </TouchableOpacity>
        );
      },
      [tempSelectedItems, handleItemPress, theme, styles]
    );

    const keyExtractor = useCallback((item: PickerItem) => item.id, []);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search..."
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="search"
              autoFocus
            />
            <Pressable
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Ionicons name="checkmark" size={20} color={theme.colors.white} />
            </Pressable>
          </View>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>
                {searchQuery ? "No items found" : "Start typing to search"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    );
  }
);