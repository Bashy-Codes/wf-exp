# Convex Client Interaction Guide

## Overview
This guide covers how to interact with Convex backend from React/React Native client code using hooks and mutations.

## Setup

### Import Pattern
```typescript
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
```

## Query Types

### 1. Normal Queries (useQuery)

Used for fetching data that updates in real-time.

#### Basic Usage
```typescript
const profile = useQuery(api.users.queries.getCurrentProfile);
```

#### With Arguments
```typescript
const post = useQuery(api.feed.posts.getPostDetails, { postId });
```

#### Loading State
```typescript
const profile = useQuery(api.users.queries.getCurrentProfile);
const isLoading = profile === undefined;
```

#### Pattern
- Returns `undefined` while loading
- Returns data once loaded
- Automatically updates when backend data changes (real-time)
- Check for `undefined` to determine loading state

### 2. Paginated Queries (usePaginatedQuery)

Used for large datasets that need pagination.

#### Basic Structure
```typescript
const {
  results,
  status,
  loadMore,
  isLoading,
} = usePaginatedQuery(
  api.feed.posts.getFeedPosts,
  {},
  { initialNumItems: 10 }
);
```

#### With Arguments
```typescript
const {
  results: messages,
  status,
  loadMore,
  isLoading,
} = usePaginatedQuery(
  api.conversations.queries.getConversationMessages,
  { conversationGroupId },
  { initialNumItems: 10 }
);
```

#### Status Values
- `"LoadingFirstPage"`: Initial load
- `"CanLoadMore"`: More data available
- `"LoadingMore"`: Currently loading more
- `"Exhausted"`: No more data

#### Load More Pattern
```typescript
const handleLoadMore = useCallback(() => {
  if (status === "CanLoadMore") {
    loadMore(10);
  }
}, [status, loadMore]);
```

#### Complete Example
```typescript
export const useFriends = () => {
  const {
    results: friendsData,
    status: friendsStatus,
    loadMore: loadMoreFriends,
  } = usePaginatedQuery(
    api.friendships.queries.getUserFriends,
    {},
    { initialNumItems: 10 }
  );

  const loadMore = () => {
    if (friendsStatus === "CanLoadMore") {
      loadMoreFriends(10);
    }
  };

  return {
    friendsData: friendsData || [],
    friendsLoading: friendsStatus === "LoadingFirstPage",
    loadMoreFriends: loadMore,
  };
};
```

### 3. Conditional Queries

Queries can be conditionally executed by passing `"skip"`.

```typescript
// Query will not execute if userId is null
const userProfile = useQuery(
  userId ? api.users.queries.getUserProfile : "skip",
  userId ? { userId } : undefined
);
```

## Mutations

### Basic Usage
```typescript
const createPost = useMutation(api.feed.posts.createPost);
const deletePost = useMutation(api.feed.posts.deletePost);
```

### Calling Mutations

#### Simple Call
```typescript
await createPost({ content: "Hello World" });
```

#### With Arguments
```typescript
await deletePost({ postId });
```

#### With Error Handling
```typescript
const handleDeletePost = useCallback(async (postId: Id<"posts">) => {
  try {
    await deletePost({ postId });
    Toast.show({
      type: "success",
      text1: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete post:", error);
    Toast.show({
      type: "error",
      text1: "Failed to delete post",
    });
  }
}, [deletePost]);
```

#### With Callback
```typescript
const handleDeletePost = useCallback(
  async (postId: Id<"posts">, onSuccess?: () => void) => {
    try {
      await deletePost({ postId });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  },
  [deletePost]
);
```

### Multiple Mutations
```typescript
const acceptRequestMutation = useMutation(api.friendships.mutations.acceptFriendRequest);
const rejectRequestMutation = useMutation(api.friendships.mutations.rejectFriendRequest);

const handleAcceptRequest = async () => {
  await acceptRequestMutation({ requestId });
};

const handleRejectRequest = async () => {
  await rejectRequestMutation({ requestId });
};
```

### Sequential Mutations
```typescript
const onSubmit = async (data: ProfileCreationData) => {
  try {
    // First mutation
    const uploadResult = await generateProfileUploadUrl();
    
    // Second mutation
    await syncMetadata({ key: uploadResult.key });
    
    // Third mutation
    await createProfile({
      name: data.name,
      profilePicture: uploadResult.key,
    });
  } catch (error) {
    console.error("Profile creation failed:", error);
  }
};
```

## Common Patterns

### 1. Loading States
```typescript
// Normal query
const data = useQuery(api.module.function);
const loading = data === undefined;

// Paginated query
const { results, status } = usePaginatedQuery(api.module.function, {}, { initialNumItems: 10 });
const loading = status === "LoadingFirstPage";
const loadingMore = status === "LoadingMore";
```

### 2. Data Transformation
```typescript
const { results } = usePaginatedQuery(
  api.conversations.queries.getConversationMessages,
  { conversationGroupId },
  { initialNumItems: 10 }
);

const transformedMessages = (results || []).map((msg) => ({
  messageId: msg.messageId,
  content: msg.content,
  sender: msg.sender,
}));
```

### 3. Sorting Results
```typescript
const sortedData = useMemo(() => {
  return (results || []).sort((a, b) => a.name.localeCompare(b.name));
}, [results]);
```

### 4. Filtering with Arguments
```typescript
const queryArgs = useMemo(() => {
  if (hasActiveFilters) {
    return {
      country: filterState.country || undefined,
      spokenLanguage: filterState.spokenLanguage || undefined,
    };
  }
  return {};
}, [hasActiveFilters, filterState]);

const { results } = usePaginatedQuery(
  api.discover.getUsersForDiscovery,
  queryArgs,
  { initialNumItems: 10 }
);
```

### 5. Mutation with Loading State
```typescript
const [isAccepting, setIsAccepting] = useState(false);
const acceptRequest = useMutation(api.friendships.mutations.acceptFriendRequest);

const handleAccept = async () => {
  try {
    setIsAccepting(true);
    await acceptRequest({ requestId });
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    setIsAccepting(false);
  }
};
```