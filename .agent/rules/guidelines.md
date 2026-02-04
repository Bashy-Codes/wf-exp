# Development Guidelines

## Code Quality Standards

### File Organization
- **Feature-based structure**: Organize code by feature domain (communities, conversations, feed, etc.)
- **Separation of concerns**: Keep backend logic (convex/), frontend components (components/), hooks (hooks/), and types (types/) in separate directories
- **Nested organization**: Group related functionality in subdirectories (e.g., `convex/communities/`, `components/feed/`)
- **Index exports**: Use index files for clean imports and public API exposure

### Naming Conventions
- **Files**: Use camelCase for TypeScript/JavaScript files (e.g., `users.ts`, `createProfile.tsx`)
- **Components**: Use PascalCase for React components (e.g., `ThreadInput.tsx`, `CommunityCard.tsx`)
- **Functions**: Use camelCase for functions and methods (e.g., `getUserProfile`, `createCommunity`)
- **Constants**: Use camelCase for regular constants, UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: Use PascalCase for type definitions (e.g., `ThreadInputProps`, `Community`)
- **Database fields**: Use camelCase for all database field names (e.g., `userId`, `createdAt`, `profilePicture`)
- **Boolean fields**: Prefix with `is`, `has`, or `can` (e.g., `isAdmin`, `hasPendingRequest`, `canView`)

### Code Formatting
- **Indentation**: 2 spaces (consistent across all files)
- **Semicolons**: Always use semicolons to terminate statements
- **Quotes**: Use double quotes for strings in JSX/TSX, flexible in backend code
- **Line length**: Keep lines reasonable, break long lines for readability
- **Trailing commas**: Use trailing commas in multi-line objects and arrays
- **Arrow functions**: Prefer arrow functions for callbacks and functional components

### Documentation Standards
- **JSDoc comments**: Use JSDoc for complex functions, especially in backend code
- **Inline comments**: Minimal inline comments; code should be self-documenting
- **Function documentation**: Document purpose, parameters, and return values for public APIs
- **Example from codebase**:
```typescript
/**
 * Update user supporter status
 * This should be called when a user makes a purchase through RevenueCat
 */
export const updateSupporterStatus = mutation({
  handler: async (ctx) => {
    // Implementation
  },
});
```

## Semantic Patterns

### Backend Patterns (Convex)

#### Query and Mutation Structure
- **Import pattern**: Always import from generated server and use proper validators
```typescript
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
```

- **Authentication check**: Always verify user authentication at the start of handlers
```typescript
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
```

- **Argument validation**: Use Convex validators (v.string(), v.id(), v.array(), etc.)
```typescript
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

- **Error handling**: Throw descriptive errors for invalid states
```typescript
if (!user) throw new Error("User not found");
if (currentUserId === args.userId) {
  throw new Error("Cannot view own profile through this function");
}
```

#### Database Query Patterns
- **Index usage**: Always use indexes for efficient queries
```typescript
const profile = await ctx.db
  .query("profiles")
  .withIndex("by_userId", (q) => q.eq("userId", userId))
  .unique();
```

- **Compound indexes**: Use compound indexes for multi-field queries
```typescript
const membership = await ctx.db
  .query("communityMembers")
  .withIndex("by_communityId_userId", (q) =>
    q.eq("communityId", communityId).eq("userId", userId)
  )
  .first();
```

- **Filtering**: Use filter for additional conditions after index queries
```typescript
const blockedUserComments = await ctx.db
  .query("comments")
  .withIndex("by_postId", (q) => q.eq("postId", post._id))
  .filter((q) => q.eq(q.field("userId"), args.userId))
  .collect();
```

- **Pagination**: Use paginationOptsValidator for paginated queries
```typescript
export const getJoinedCommunities = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const result = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);
    
    return {
      ...result,
      page: communities,
    };
  },
});
```

#### Data Fetching Optimization
- **Parallel queries**: Use Promise.all for independent queries
```typescript
const [user, profile, userInfo] = await Promise.all([
  ctx.db.get(userId),
  ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique(),
  ctx.db
    .query("userInformation")
    .withIndex("by_userId", (q) => q.eq("userId\", userId))
    .unique(),
]);
```

- **Batch processing**: Process collections in loops with proper cleanup
```typescript
for (const post of userPosts) {
  const postComments = await ctx.db
    .query("comments")
    .withIndex("by_postId", (q) => q.eq("postId", post._id))
    .collect();
  
  for (const comment of postComments) {
    await ctx.db.delete(comment._id);
  }
}
```

- **Use Math.max**: Prevent negative counters
```typescript
reactionsCount: Math.max(0, post.reactionsCount - blockedUserReactions.length)
```

### Frontend Patterns (React/React Native)

#### Component Structure
- **Functional components**: Use functional components with hooks
- **Memo optimization**: Use React.memo for performance-critical components
```typescript
export const ThreadInput: React.FC<ThreadInputProps> = memo(({
  onSubmitThread,
  replyToThread,
  onCancelReply,
}) => {
  // Implementation
});

```

- **Props interface**: Define explicit TypeScript interfaces for props
```typescript
export interface ThreadInputProps {
  onSubmitThread: (text: string) => void;
  replyToThread?: Thread | null;
  onCancelReply?: () => void;
}
```

#### Hook Usage
- **Custom hooks**: Extract business logic into custom hooks
- **Hook composition**: Compose multiple hooks for complex functionality
- **Dependency arrays**: Always specify correct dependencies for useCallback and useEffect

#### State Management
- **Local state**: Use useState for component-local state
```typescript
const [threadText, setThreadText] = useState("");
```

- **Callbacks**: Use useCallback to memoize callbacks
```typescript
const handleSubmit = useCallback(() => {
  if (threadText.trim()) {
    onSubmitThread(threadText.trim());
    setThreadText("");
  }
}, [threadText, onSubmitThread]);
```

#### Styling Patterns
- **StyleSheet.create**: Always use StyleSheet.create for styles
- **Theme integration**: Use theme context for colors and styling
```typescript
const theme = useTheme();
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
  },
});
```

## Best Practices

### Security
- **Authentication first**: Always check authentication before processing requests
- **Authorization checks**: Verify user permissions before allowing actions
- **Block checks**: Check for blocked users before showing content
- **Privacy validation**: Use helper functions like checkUsersPrivacy for access control
- **Input validation**: Validate all user inputs with Zod schemas
- **SQL injection prevention**: Use Convex's type-safe queries (no raw SQL)

### Performance
- **Pagination**: Always paginate large data sets
- **Parallel queries**: Use Promise.all for independent database queries
- **Memoization**: Use React.memo and useCallback for expensive operations
- **Index optimization**: Create proper database indexes for all queries

### Data Integrity
- **Cascading deletes**: When deleting entities, clean up all related data
- **Counter updates**: Always update counters when modifying related data
- **Transaction-like operations**: Group related operations together
- **Null checks**: Always check for null/undefined before accessing properties
- **Error boundaries**: Handle errors gracefully with descriptive messages

### Code Reusability
- **Helper functions**: Extract common logic into helper functions (e.g., calculateAge, areFriends)
- **Custom hooks**: Create custom hooks for reusable data fetching logic
- **Shared components**: Build reusable UI components in common/ directory
- **Type definitions**: Centralize type definitions in types/ directory
- **Validation schemas**: Reuse validation schemas across forms

### Testing Considerations
- **Type safety**: Leverage TypeScript for compile-time error detection
- **Validation testing**: Test Zod schemas with edge cases
- **Error scenarios**: Handle and test error conditions
- **Edge cases**: Consider null, undefined, empty arrays, and boundary values

## Common Patterns Summary

### Backend (Convex)
1. Import from generated server and auth
2. Validate arguments with v validators
3. Check authentication immediately
4. Use indexed queries for performance
5. Use Promise.all for parallel operations
6. Update counters when modifying data
7. Clean up related data on deletes
8. Return structured, type-safe data

### Frontend (React Native)
1. Use functional components with TypeScript
2. Define explicit prop interfaces
3. Use memo for performance optimization
4. Extract logic into custom hooks
5. Use theme context for styling
6. Handle safe areas properly
7. Memoize callbacks with useCallback
8. Use StyleSheet.create for styles

### General
1. Maintain consistent naming conventions
2. Use descriptive variable and function names
3. Keep functions focused and single-purpose
4. Document complex logic with comments
5. Handle errors with descriptive messages
6. Optimize for performance and scalability
7. Follow the principle of least privilege
8. Write self-documenting code
