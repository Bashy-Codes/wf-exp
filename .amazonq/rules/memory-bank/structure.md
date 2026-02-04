# Project Structure - Nomad Pals

## Directory Organization

### `/app` - Application Routing (Expo Router)
File-based routing structure using Expo Router for navigation.

- **`(auth)/`**: Authentication flow screens
  - `auth.tsx`: Main authentication screen
  - `otp-verification.tsx`: OTP verification for login
  - `guidelines.tsx`: Community guidelines acceptance
  - `index.tsx`: Auth flow entry point

- **`(tabs)/`**: Main tab navigation screens
  - `index.tsx`: Swipe/Match screen (main discovery)
  - `matches.tsx`: Current matches list
  - `messages.tsx`: Conversations with matches
  - `builder-help.tsx`: Builder Q&A and help requests
  - `profile.tsx`: User profile

- **`screens/`**: Nested screens and detailed views
  - `conversation/`: Message thread screens
  - `user-profile/`: Other users' profile screens
  - `builder-help/`: Builder help detail screens
  - Standalone screens: `create-profile.tsx`, `edit-profile.tsx`, `settings.tsx`, etc.

### `/components` - React Components
Organized by feature domain with reusable UI components.

- **`common/`**: Shared utility components (modals, pickers, separators, loading states)
- **`swipe/`**: Swipe card components (user cards, swipe actions, filters)
- **`matches/`**: Match list components (match cards, match items)
- **`messages/`**: Messaging components (message bubbles, input, headers)
- **`builder-help/`**: Builder help components (question cards, answer threads, gig postings)
- **`profile/`**: Profile display components (van setup, travel info, verification badge)
- **`profile-management/`**: Profile creation/editing components
- **`skeletons/`**: Loading skeleton components
- **`ui/`**: Base UI components (buttons, dividers, chips, modals)

### `/hooks` - Custom React Hooks
Feature-specific hooks for data fetching and state management.

- **`swipe/`**: Swipe and matching hooks
- **`matches/`**: Match management hooks
- **`messages/`**: Messaging hooks
- **`builder-help/`**: Builder help Q&A hooks
- **`profile/`**: Profile data and user profile hooks
- **Standalone hooks**: `useCreateProfile`, `useEditProfile`, `useNotifications`, `useRevenueCat`, etc.

### `/types` - TypeScript Type Definitions
Centralized type definitions for domain models.

- `swipe.ts`: Swipe card and filter types
- `matches.ts`: Match and connection types
- `messages.ts`: Message and conversation types
- `builderHelp.ts`: Builder help question, answer, and gig types
- `profile.ts`: Profile, van setup, and travel info types

### `/validations` - Zod Schemas
Input validation schemas using Zod.

- `auth.ts`: Authentication validation
- `profile.ts`: Profile creation/editing validation
- `builderHelp.ts`: Builder help post validation

### `/constants` - Static Data
Application constants and configuration.

- `vanTypes.ts`: Van/RV types and build categories
- `interests.ts`: Van life interests and activities
- `guidelines.ts`: Community guidelines text
- `themes.ts`: Theme color schemes

### `/lib` - Core Libraries
Application-wide library configurations.

- `convex.ts`: Convex client setup
- `Theme.tsx`: Theme context and provider
- `RevenueCat.ts`: In-app purchases configuration
- `sentry.ts`: Error tracking setup

### `/providers` - React Context Providers
Global state and functionality providers.

- `ThemeProvider.tsx`: Theme management
- `PushNotificationsProvider.tsx`: Push notification handling
- `ToastConfig.tsx`: Toast notification configuration
- `GlobalPresenceProvider.tsx`: Online presence tracking

### `/utils` - Utility Functions
Helper functions and custom utilities.

- `chatTimeFormat.ts`: Chat timestamp formatting
- `formatTime.ts`: General time formatting
- `uploadImages.ts`: Image upload utilities
- `useDebounce.ts`: Debounce hook
- `common.ts`: Shared utility functions

### `/assets` - Static Assets
Images and media files.

- `images/`: Logo, placeholder images (user, van)

## Core Architectural Patterns

### Frontend Architecture
- **Expo Router**: File-based routing with nested layouts
- **React Native**: Cross-platform mobile UI
- **TypeScript**: Type-safe development
- **Custom Hooks**: Separation of business logic from UI
- **Component Composition**: Feature-based component organization
- **Context API**: Global state management (theme, notifications, presence)

### Backend Architecture
- **Convex**: Serverless backend with real-time subscriptions
- **Schema-driven**: Strongly typed database schema
- **Function-based**: Query, mutation, and action functions
- **Authentication**: Convex Auth with OTP verification
- **File Storage**: Convex R2 integration for images

### Data Flow
1. **UI Components** → Call custom hooks
2. **Custom Hooks** → Use Convex queries/mutations
3. **Convex Functions** → Access database and execute logic
4. **Real-time Updates** → Automatically propagate to UI via subscriptions

### Key Design Patterns
- **Feature Slicing**: Code organized by feature domain
- **Separation of Concerns**: UI, business logic, and data access separated
- **Type Safety**: End-to-end TypeScript with generated Convex types
- **Validation**: Zod schemas for input validation
- **Theme System**: Dynamic theming with light/dark modes
