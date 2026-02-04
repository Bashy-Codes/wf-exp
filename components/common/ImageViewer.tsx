import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import PagerView from "react-native-pager-view";
import { themes } from "@/constants/themes";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ImageViewerProps {
  images: Array<{ uri: string }>;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

const ZoomableImage = ({
  uri,
  onZoomChange,
}: {
  uri: string;
  onZoomChange: (isZoomed: boolean) => void;
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const [panEnabled, setPanEnabled] = useState(false);

  const updateZoomState = (zoomed: boolean) => {
    setPanEnabled(zoomed);
    onZoomChange(zoomed);
  };

  const reset = () => {
    "worklet";
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    runOnJS(updateZoomState)(false);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        reset();
      } else {
        savedScale.value = scale.value;
        runOnJS(updateZoomState)(true);
      }
    });

  const panGesture = Gesture.Pan()
    .enabled(panEnabled)
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        reset();
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
        runOnJS(updateZoomState)(true);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const composed = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          priority="normal"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </GestureDetector>
  );
};

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  imageIndex,
  visible,
  onRequestClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(imageIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(imageIndex);
  }, [imageIndex]);

  const renderIndicators = () => {
    if (images.length <= 1 || images.length > 3) return null;

    return (
      <View style={[styles.indicatorContainer, { top: insets.top + 60 }]}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && {
                backgroundColor: theme.colors.primary,
                width: 24,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modal}>
          <StatusBar barStyle="light-content" />

          <PagerView
            style={styles.pager}
            initialPage={imageIndex}
            onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
            scrollEnabled={!isZoomed}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.page}>
                <ZoomableImage
                  uri={image.uri}
                  onZoomChange={setIsZoomed}
                />
              </View>
            ))}
          </PagerView>

          {!isZoomed && renderIndicators()}

          {!isZoomed && (
            <View style={[styles.closeButtonContainer, { top: insets.top + 50 }]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onRequestClose}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: "#000",
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButtonContainer: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff28",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});
