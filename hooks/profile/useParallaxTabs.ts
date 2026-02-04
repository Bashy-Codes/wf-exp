import { useCallback, useMemo, useRef, useState } from "react";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

const HEADER_SCROLL_DISTANCE = 140;

export const useParallaxTabs = (tabCount: number) => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollY = useSharedValue(0);
  
  const scrollRefs = useMemo(
    () => Array.from({ length: tabCount }, () => useRef(null)),
    [tabCount]
  );

  const scrollPositions = useMemo(
    () => Array.from({ length: tabCount }, () => useSharedValue(0)),
    [tabCount]
  );

  const createScrollHandler = useCallback(
    (index: number) =>
      useAnimatedScrollHandler({
        onScroll: (event) => {
          scrollPositions[index].value = event.contentOffset.y;
          if (index === activeTab) {
            scrollY.value = event.contentOffset.y;
          }
        },
      }),
    [activeTab, scrollPositions, scrollY]
  );

  const syncScrollToPosition = useCallback(
    (targetPosition: number) => {
      scrollRefs.forEach((ref, index) => {
        if (index !== activeTab && ref.current) {
          (ref.current as any).scrollToOffset({
            offset: Math.min(targetPosition, HEADER_SCROLL_DISTANCE),
            animated: false,
          });
        }
      });
    },
    [activeTab, scrollRefs]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      syncScrollToPosition(offsetY);
    },
    [syncScrollToPosition]
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      syncScrollToPosition(offsetY);
    },
    [syncScrollToPosition]
  );

  const handleTabChange = useCallback(
    (newIndex: number) => {
      setActiveTab(newIndex);
      const currentScroll = scrollPositions[newIndex].value;
      scrollY.value = currentScroll;
    },
    [scrollPositions, scrollY]
  );

  return {
    scrollY,
    scrollRefs,
    activeTab,
    createScrollHandler,
    handleMomentumScrollEnd,
    handleScrollEndDrag,
    handleTabChange,
  };
};
