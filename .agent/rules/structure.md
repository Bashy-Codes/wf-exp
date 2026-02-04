# Project Structure

## Directory Organization

### `/app` - Application Routing (Expo Router)
File-based routing structure using Expo Router for navigation.

- **`(auth)/`**: Authentication flow screens
  - `auth.tsx`: Main authentication screen
  - `otp-verification.tsx`: OTP verification for login
  - `guidelines.tsx`: Community guidelines acceptance
  - `index.tsx`: Auth flow entry point

- **`(tabs)/`**: Main tab navigation screens
  - `index.tsx`: Home feed
  - `communities.tsx`: Communities list
  - `conversations.tsx`: Conversations list
  - `discover.tsx`: User discovery
  - `friends.tsx`: Friends and requests
  - `letters.tsx`: Letters inbox/outbox
  - `profile.tsx`: User profile

- **`screens/`**: Nested screens and detailed views
  - `collection/`: Collection detail screens
  - `community/`: Community detail screens
  - `conversation/`: Conversation detail screens
  - `discussion/`: Discussion thread screens
  - `letter/`: Letter detail screens
  - `post/`: Post detail screens
  - `user-profile/`: Other users' profile screens
  - Standalone screens: `create-profile.tsx`, `edit-profile.tsx`, `settings.tsx`, `store.tsx`, `study.tsx`, etc.

### `/components` - React Components
Organized by feature domain with reusable UI components.

- **`common/`**: Shared utility components (modals, pickers, separators, loading states)
- **`communities/`**: Community-related components (cards, sections, member items)
- **`conversations/`**: Messaging components (message bubbles, input, headers)
- **`discussions/`**: Discussion thread components (cards, thread items, input)
- **`discover/`**: User discovery components (filters, user cards)
- **`feed/`**: Post feed components (post cards, comments, reactions, collections)
- **`friends/`**: Friend management components (request cards, friend lists)
- **`inventory/`**: Store inventory components (owned products, gifts)
- **`letters/`**: Letter components (letter cards, scheduling)
- **`profile/`**: Profile display components (sections, photo grids)
- **`profile-management/`**: Profile creation/editing components
- **`skeletons/`**: Loading skeleton components
- **`store/`**: Virtual store components (product cards, gift viewers)
- **`study/`**: Language learning components (flashcards, quizzes)
- **`ui/`**: Base UI components (buttons, dividers, chips, modals)

### `/hooks` - Custom React Hooks
Feature-specific hooks for data fetching and state management.

- **`communities/`**: Community and discussion hooks
- **`conversations/`**: Messaging hooks
- **`feed/`**: Post and collection hooks
- **`letters/`**: Letter composition and management hooks
- **`profile/`**: Profile data and user profile hooks
- **`store/`**: Store and inventory hooks
- **Standalone hooks**: `useCreateProfile`, `useEditProfile`, `useDiscover`, `useFriends`, `useFriendRequests`, `useNotifications`, `useFlashcards`, `useTranslation`, `useRevenueCat`, etc.

### `/types` - TypeScript Type Definitions
Centralized type definitions for domain models.

- `communities.ts`: Community and member types
- `conversations.ts`: Message and conversation types
- `discussions.ts`: Discussion thread types
- `discover.ts`: User discovery filter types
- `feed.ts`: Post, comment, reaction types
- `friendships.ts`: Friend request types
- `store.ts`: Product and gift types
- `study.ts`: Flashcard and quiz types

### `/validations` - Zod Schemas
Input validation schemas using Zod.

- `auth.ts`: Authentication validation
- `profile.ts`: Profile creation/editing validation

### `/constants` - Static Data
Application constants and configuration.

- `geographics.ts`: Countries and regions data
- `guidelines.ts`: Community guidelines text
- `products.ts`: Virtual store product definitions
- `themes.ts`: Theme color schemes

### `/lib` - Core Libraries
Application-wide library configurations.

- `convex.ts`: Convex client setup
- `Theme.tsx`: Theme context and provider
- `i18n.ts`: Internationalization setup
- `RevenueCat.ts`: In-app purchases configuration
- `sentry.ts`: Error tracking setup

### `/providers` - React Context Providers
Global state and functionality providers.

- `ThemeProvider.tsx`: Theme management
- `PushNotificationsProvider.tsx`: Push notification handling
- `ToastConfig.tsx`: Toast notification configuration

### `/utils` - Utility Functions
Helper functions and custom utilities.

- `chatTimeFormat.ts`: Chat timestamp formatting
- `formatTime.ts`: General time formatting
- `uploadImages.ts`: Image upload utilities
- `useDebounce.ts`: Debounce hook
- `common.ts`: Shared utility functions

### `/languages` - Internationalization
JSON translation files for 10 supported languages.

- `en.json`, `es.json`, `fr.json`, `de.json`, `it.json`, `ja.json`, `ko.json`, `ru.json`, `tr.json`, `zh.json`

### `/assets` - Static Assets
Images and media files.

- `images/`: Logo, placeholder images (user, photo)

## Core Architectural Patterns

### Frontend Architecture
- **Expo Router**: File-based routing with nested layouts
- **React Native**: Cross-platform mobile UI
- **TypeScript**: Type-safe development
- **Custom Hooks**: Separation of business logic from UI
- **Component Composition**: Feature-based component organization
- **Context API**: Global state management (theme, notifications)

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
- **Internationalization**: i18next for multi-language support
- **Theme System**: Dynamic theming with light/dark modes
