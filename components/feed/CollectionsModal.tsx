import React, { forwardRef, useImperativeHandle, useCallback, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import type { CollectionTypes } from "@/types/feed";
import { SelectionModal, SelectionModalRef, SelectionItem } from "@/components/ui/SelectionModal";

interface CollectionsModalProps {
  onCollectionSelect: (collectionId: Id<"collections">) => void;
}

export interface CollectionsModalRef {
  present: () => void;
  dismiss: () => void;
}

export const CollectionsModal = forwardRef<CollectionsModalRef, CollectionsModalProps>(
  ({ onCollectionSelect }, ref) => {
    const selectionModalRef = React.useRef<SelectionModalRef>(null);
    const [isVisible, setIsVisible] = useState(false);

    const {
      results: collections,
      status,
      loadMore,
    } = usePaginatedQuery(
      api.feed.collections.getCurrentUserCollections,
      isVisible ? {} : "skip",
      { initialNumItems: 10 }
    );

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsVisible(true);
        selectionModalRef.current?.present();
      },
      dismiss: () => {
        setIsVisible(false);
        selectionModalRef.current?.dismiss();
      },
    }), []);

    const handleLoadMore = useCallback(() => {
      if (status === "CanLoadMore") {
        loadMore(10);
      }
    }, [status, loadMore]);

    const handleItemSelect = useCallback((item: SelectionItem) => {
      onCollectionSelect(item.id as Id<"collections">);
    }, [onCollectionSelect]);

    const items: SelectionItem[] = collections?.map((collection: CollectionTypes) => ({
      id: collection.collectionId,
      title: collection.title,
      icon: "images" as const,
    })) || [];

    return (
      <SelectionModal
        ref={selectionModalRef}
        items={items}
        loading={status === "LoadingFirstPage"}
        onItemSelect={handleItemSelect}
        onLoadMore={handleLoadMore}
        canLoadMore={status === "CanLoadMore"}
        headerIcon="images"
        title="Collections"
      />
    );
  }
);

CollectionsModal.displayName = "CollectionsModal";