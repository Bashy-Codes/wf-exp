# Technology Stack

## Programming Languages
- **TypeScript 5.9.2**: Primary language for type-safe development
- **JavaScript**: For configuration files (babel, metro)
- **JSON**: For translations and configuration

## Frontend Framework & Runtime
- **React 19.1.0**: UI library
- **React Native 0.81.5**: Cross-platform mobile framework
- **Expo SDK 54.0.6**: Development platform and tooling
- **Expo Router 6.0.3**: File-based navigation

## Backend & Database
- **Convex 1.28.0**: Serverless backend platform
  - Automatic by Default Real-time database with subscriptions
  - Serverless functions (queries, mutations, actions)
  - Built-in authentication
  - File storage integration
- **Convex Auth 0.0.87**: Authentication system
- **Convex R2 0.7.1**: File storage (R2 integration)
- **Convex Expo Push Notifications 0.2.6**: Push notification integration

## State Management & Data Fetching
- **Convex React**: Real-time queries and mutations
- **React Context API**: Global state (theme, notifications)
- **React Hook Form 7.60.0**: Form state management
- **Custom Hooks**: Feature-specific data fetching and handling

## Validation & Type Safety
- **Zod 4.0.5**: Runtime type validation and schema definition
- **Hookform Resolvers 5.1.1**: Zod integration with React Hook Form
- **TypeScript**: Compile-time type checking
- **Convex Generated Types**: Auto-generated API types

## Internationalization
- **i18next 25.3.6**: Internationalization framework
- **react-i18next 15.6.1**: React bindings for i18next
- **expo-localization 17.0.7**: Device locale detection
- **10 Language Files**: en, es, fr, de, it, ja, ko, ru, tr, zh

## Authentication & Security
- **Convex Auth 0.0.87**: Authentication provider
- **Auth Core 0.37.0**: Core authentication utilities
- **Oslo 1.2.1 & @oslojs/crypto 1.0.1**: Cryptographic utilities
- **Expo Secure Store 15.0.7**: Secure credential storage
- **Expo Auth Session 7.0.8**: OAuth session management
- **Expo Web Browser 15.0.7**: In-app browser for OAuth

## Performance Optimization
- **Shopify Flash List 2.0.2**: High-performance list component
- **React Native Worklets 0.5.1**: JavaScript worklets for animations
- **Expo Metro Runtime 6.1.2**: Metro bundler runtime

## Error Tracking & Monitoring
- **Sentry React Native 7.2.0**: Error tracking and performance monitoring

## Key Technical Decisions
1. **Expo over bare React Native**: Faster development, managed workflow, easier updates
2. **Convex over traditional backend**: Real-time by default, serverless, type-safe
3. **Expo Router over React Navigation**: File-based routing, better DX, type-safe routes
4. **Zod for validation**: Runtime type safety, schema reuse, excellent TypeScript integration
5. **Flash List over FlatList**: Better performance for large lists
6. **i18next for i18n**: Mature, flexible, extensive ecosystem
7. **RevenueCat for IAP**: Cross-platform purchase management, analytics
8. **Sentry for monitoring**: Comprehensive error tracking, performance insights
