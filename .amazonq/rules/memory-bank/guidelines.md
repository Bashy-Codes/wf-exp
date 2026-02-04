# Development Guidelines for Nomad Pals

## Code Quality Standards

### File Organization
- **Feature-based structure**: Organize code by feature domain (swipe, matches, messages, builder-help, etc.)
- **Separation of concerns**: Keep backend logic (convex/), frontend components (components/), hooks (hooks/), and types (types/) in separate directories
- **Nested organization**: Group related functionality in subdirectories (e.g., `convex/swipe/`, `components/matches/`)
- **Index exports**: Use index files for clean imports and public API exposure

### Naming Conventions
- **Files**: Use camelCase for TypeScript/JavaScript files (e.g., `users.ts`, `createProfile.tsx`)
- **Components**: Use PascalCase for React components (e.g., `SwipeCard.tsx`, `MatchItem.tsx`)
- **Functions**: Use camelCase for functions and methods (e.g., `getUserProfile`, `createMatch`)
- **Constants**: Use camelCase for regular constants, UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: Use PascalCase for type definitions (e.g., `SwipeCardProps`, `Match`)
- **Database fields**: Use camelCase for all database field names (e.g., `userId`, `createdAt`, `vanType`, `rigSize`)
- **Boolean fields**: Prefix with `is`, `has`, or `can` (e.g., `isVerified`, `hasMatched`, `canMessage`, `isOnTheRoad`)

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
- **Example**:
```typescript
/**
 * Create a match between two users
 * Called when both users swipe right on each other
 */
export const createMatch = mutation({
  handler: async (ctx, args) => {
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
if (!profile.isVerified) {
  throw new Error("Profile must be verified to match");
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
const match = await ctx.db
  .query("matches")
  .withIndex("by_user1_user2", (q) =>
    q.eq("user1Id", user1Id).eq("user2Id", user2Id)
  )
  .first();
```

- **Filtering**: Use filter for additional conditions after index queries
```typescript
const nearbyUsers = await ctx.db
  .query("profiles")
  .withIndex("by_location", (q) => q.eq("region", region))
  .filter((q) => q.eq(q.field("isVerified"), true))
  .collect();
```

- **Pagination**: Use paginationOptsValidator for paginated queries
```typescript
export const getMatches = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const result = await ctx.db
      .query("matches")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);
    
    return {
      ...result,
      page: matches,
    };
  },
});
```

#### Data Fetching Optimization
- **Parallel queries**: Use Promise.all for independent queries
```typescript
const [user, profile, vanSetup] = await Promise.all([
  ctx.db.get(userId),
  ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique(),
  ctx.db
    .query("vanSetups")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique(),
]);
```

- **Batch processing**: Process collections in loops with proper cleanup
```typescript
for (const match of userMatches) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_matchId", (q) => q.eq("matchId", match._id))
    .collect();
  
  for (const message of messages) {
    await ctx.db.delete(message._id);
  }
}
```

- **Use Math.max**: Prevent negative counters
```typescript
matchCount: Math.max(0, user.matchCount - 1)
```

### Frontend Patterns (React/React Native)

#### Component Structure
- **Functional components**: Use functional components with hooks
- **Memo optimization**: Use React.memo for performance-critical components
```typescript
export const SwipeCard: React.FC<SwipeCardProps> = memo(({
  profile,
  onSwipeLeft,
  onSwipeRight,
}) => {
  // Implementation
});
```

- **Props interface**: Define explicit TypeScript interfaces for props
```typescript
export interface SwipeCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}
```

#### Hook Usage
- **Custom hooks**: Extract business logic into custom hooks
- **Hook composition**: Compose multiple hooks for complex functionality
- **Dependency arrays**: Always specify correct dependencies for useCallback and useEffect

#### State Management
- **Local state**: Use useState for component-local state
```typescript
const [currentIndex, setCurrentIndex] = useState(0);
```

- **Callbacks**: Use useCallback to memoize callbacks
```typescript
const handleSwipeRight = useCallback(() => {
  createMatch({ targetUserId });
  setCurrentIndex(prev => prev + 1);
}, [targetUserId, createMatch]);
```

#### Styling Patterns
- **StyleSheet.create**: Always use StyleSheet.create for styles
- **Theme integration**: Use theme context for colors and styling
```typescript
const theme = useTheme();
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
  },
});
```

## Best Practices

### Security
- **Authentication first**: Always check authentication before processing requests
- **Authorization checks**: Verify user permissions before allowing actions
- **Block checks**: Check for blocked users before showing profiles
- **Privacy validation**: Respect user privacy settings for location and profile visibility
- **Input validation**: Validate all user inputs with Zod schemas
- **Verification checks**: Ensure users are verified before allowing certain actions

### Performance
- **Pagination**: Always paginate large data sets
- **Parallel queries**: Use Promise.all for independent database queries
- **Memoization**: Use React.memo and useCallback for expensive operations
- **Index optimization**: Create proper database indexes for all queries
- **Gesture optimization**: Use worklets for smooth swipe animations

### Data Integrity
- **Cascading deletes**: When deleting entities, clean up all related data
- **Counter updates**: Always update counters when modifying related data
- **Transaction-like operations**: Group related operations together
- **Null checks**: Always check for null/undefined before accessing properties
- **Error boundaries**: Handle errors gracefully with descriptive messages

### Code Reusability
- **Helper functions**: Extract common logic into helper functions
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
6. Handle gestures smoothly with worklets
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
