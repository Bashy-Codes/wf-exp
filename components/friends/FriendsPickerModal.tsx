import React, { forwardRef, useImperativeHandle, useCallback, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { getCountryByCode } from "@/constants/geographics";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import { SelectionModal, SelectionModalRef, SelectionItem } from "@/components/ui/SelectionModal";

interface Friend {
  userId: Id<"users">;
  profilePicture: string;
  name: string;
  gender: "male" | "female" | "other";
  age: number;
  country: string;
}

interface FriendsPickerModalProps {
  onFriendSelect?: (friend: Friend) => void;
  onMultiSelect?: (friends: Friend[]) => void;
  multiSelect?: boolean;
}

export interface FriendsPickerModalRef {
  present: () => void;
  dismiss: () => void;
}

export const FriendsPickerModal = forwardRef<FriendsPickerModalRef, FriendsPickerModalProps>(
  ({ onFriendSelect, onMultiSelect, multiSelect = false }, ref) => {
    const selectionModalRef = React.useRef<SelectionModalRef>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const {
      results: friends,
      status,
      loadMore,
    } = usePaginatedQuery(
      api.friendships.queries.getUserFriends,
      isVisible ? {} : "skip",
      { initialNumItems: 10 }
    );

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsVisible(true);
        setSelectedIds([]);
        selectionModalRef.current?.present();
      },
      dismiss: () => {
        setIsVisible(false);
        setSelectedIds([]);
        selectionModalRef.current?.dismiss();
      },
    }), []);

    const handleLoadMore = useCallback(() => {
      if (status === "CanLoadMore") {
        loadMore(20);
      }
    }, [status, loadMore]);

    const handleItemSelect = useCallback((item: SelectionItem) => {
      if (multiSelect) {
        setSelectedIds(prev => 
          prev.includes(item.id) 
            ? prev.filter(id => id !== item.id)
            : [...prev, item.id]
        );
      } else {
        const friend = friends?.find(f => f.userId === item.id);
        if (friend && onFriendSelect) {
          onFriendSelect(friend);
        }
      }
    }, [friends, onFriendSelect, multiSelect]);

    const handleConfirm = useCallback(() => {
      if (multiSelect && onMultiSelect) {
        const selectedFriends = friends?.filter(f => selectedIds.includes(f.userId)) || [];
        onMultiSelect(selectedFriends);
      }
    }, [multiSelect, onMultiSelect, friends, selectedIds]);

    const items: SelectionItem[] = friends?.map((friend: Friend) => {
      const country = getCountryByCode(friend.country);
      const genderEmoji = friend.gender === "female" ? "👩" : friend.gender === "male" ? "👨" : "👤";

      return {
        id: friend.userId,
        title: friend.name,
        subtitle: `${genderEmoji} • ${friend.age} • ${country?.flag} ${country?.name}`,
        image: (
          <ProfilePhoto
            profilePicture={friend.profilePicture}
            size={56}
          />
        ),
      };
    }) || [];

    return (
      <SelectionModal
        ref={selectionModalRef}
        items={items}
        loading={status === "LoadingFirstPage"}
        onItemSelect={handleItemSelect}
        onLoadMore={handleLoadMore}
        canLoadMore={status === "CanLoadMore"}
        headerIcon="people"
        title="Friends"
        multiSelect={multiSelect}
        selectedIds={selectedIds}
        onConfirm={multiSelect ? handleConfirm : undefined}
      />
    );
  }
);