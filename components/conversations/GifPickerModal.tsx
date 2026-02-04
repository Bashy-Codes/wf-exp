import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TENOR_API_KEY = "AIzaSyAOZHiCmQQ_fHQu14uroBFcU9SH2Sep--g";
const TENOR_CLIENT_KEY = "worldfriends";

interface GifResult {
  id: string;
  media_formats: {
    tinygif: { url: string };
    gif: { url: string };
  };
}

interface GifPickerModalProps {
  visible: boolean;
  onSelectGif: (gifUrl: string, gifId: string) => void;
  onClose: () => void;
}

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
  visible,
  onSelectGif,
  onClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchGifs = useCallback(async (query: string) => {
    if (!TENOR_API_KEY) return;

    setLoading(true);
    try {
      const endpoint = query
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      searchGifs("");
    }
  }, [visible, searchGifs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchGifs(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchGifs]);

  const handleSelectGif = useCallback(
    (gif: GifResult) => {
      const gifUrl = gif.media_formats.gif.url;
      onSelectGif(gifUrl, gif.id);

      // Register share event
      fetch(
        `https://tenor.googleapis.com/v2/registershare?id=${gif.id}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&q=${searchQuery}`
      ).catch(console.error);

      onClose();
    },
    [onSelectGif, onClose, searchQuery]
  );

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
    closeButton: {
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
    gifItem: {
      flex: 1,
      margin: 4,
      borderRadius: theme.borderRadius.md,
      overflow: "hidden",
      aspectRatio: 1,
      backgroundColor: theme.colors.surface,
    },
    gif: {
      width: "100%",
      height: "100%",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    poweredBy: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 4,
    },
    poweredByText: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for GIFs..."
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="search"
          />
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.white} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : gifs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>
              {searchQuery ? "No GIFs found" : "Search for GIFs to get started"}
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={gifs}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.gifItem}
                  onPress={() => handleSelectGif(item)}
                >
                  <Image
                    source={{ uri: item.media_formats.tinygif.url }}
                    style={styles.gif}
                    contentFit="cover"
                  />
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.poweredBy}>
              <Text style={styles.poweredByText}>Powered by</Text>
              <Text style={[styles.poweredByText, { fontWeight: "600" }]}>Tenor</Text>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};
