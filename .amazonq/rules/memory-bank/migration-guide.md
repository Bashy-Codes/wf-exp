# Migration Guide: WorldFriends → Nomad Pals

## Overview
This guide covers the migration from WorldFriends to Nomad Pals for the Shipyard contest submission.

## Key Changes

### Branding & Naming
- **App Name**: WorldFriends → Nomad Pals
- **Target Audience**: General international friends → Van-lifers and nomads
- **Value Proposition**: Language/culture exchange → Van life connections (friends, romance, builder help)

### Core Feature Adjustments

#### Profile Structure
**Add to existing profiles:**
- `vanSetup`: Van/RV details (photos, build type, rig size, conversion details)
- `currentLocation`: Current region/location
- `travelRoute`: Planned or current travel route
- `onTheRoadStatus`: Boolean for "currently traveling"
- `travelStyle`: Solo, couple, with pets, with kids, full-time, part-time
- `availability`: Duration in current region (e.g., "Southwest US for 2 months")
- `vanLifeInterests`: Hiking, surfing, boondocking, climbing, photography, etc.

**Keep from WorldFriends:**
- Basic profile fields (name, bio, photos)
- Verification system
- Privacy settings

#### Matching System
**Modify existing swipe system:**
- Add `matchIntent` filter: "friendship", "romance", or "both"
- Add location/route-based matching
- Add lifestyle compatibility (travel style, van life commitment)
- Add activity-based matching (group hikes, meetups, camping)

**Keep from WorldFriends:**
- Swipe mechanics
- Match creation logic
- Block/report functionality

#### Builder Help Section (NEW)
**Add new feature:**
- Q&A forum for van build questions
- Expert consultations (direct messaging)
- Gig postings (request/offer help)
- Premium access via RevenueCat (priority responses, verified experts)

#### Messaging
**Keep existing:**
- Private DMs
- Real-time chat
- Online presence
- Conversation management

### Database Schema Changes

#### New Tables
```typescript
// vanSetups table
{
  userId: v.id("users"),
  photos: v.array(v.string()),
  buildType: v.string(), // "DIY", "Professional", "Partial"
  rigSize: v.string(), // "Van", "Sprinter", "RV", "Bus", "Truck"
  conversionDetails: v.optional(v.string()),
  features: v.array(v.string()), // Solar, shower, kitchen, etc.
}

// builderHelp table
{
  authorId: v.id("users"),
  type: v.string(), // "question", "gig"
  title: v.string(),
  content: v.string(),
  category: v.string(), // "electrical", "plumbing", "insulation", etc.
  isPremium: v.boolean(),
  status: v.string(), // "open", "answered", "closed"
}

// builderAnswers table
{
  questionId: v.id("builderHelp"),
  authorId: v.id("users"),
  content: v.string(),
  isExpertAnswer: v.boolean(),
}
```

#### Modified Tables
```typescript
// profiles table - ADD fields
{
  // ... existing fields
  currentLocation: v.optional(v.string()),
  travelRoute: v.optional(v.string()),
  isOnTheRoad: v.boolean(),
  travelStyle: v.array(v.string()),
  availability: v.optional(v.string()),
  vanLifeInterests: v.array(v.string()),
}

// matches table - ADD field
{
  // ... existing fields
  matchIntent: v.string(), // "friendship", "romance", "both"
}
```

### Monetization Strategy

#### RevenueCat Integration (Required for Contest)
**Premium Features:**
- Unlimited swipes/matches (free tier: limited daily)
- Advanced filters (location radius, travel dates, specific interests)
- Builder help priority access
- Verified expert consultations
- Ad-free experience
- See who liked you

**Pricing Tiers:**
- Free: Basic matching, limited swipes, view builder help Q&A
- Premium Monthly: $9.99/month - All features
- Premium Annual: $79.99/year - All features + discount

### UI/UX Changes

#### Navigation Structure
**Keep:**
- Tab-based navigation
- Swipe screen as main tab
- Matches tab
- Messages tab
- Profile tab

**Add:**
- Builder Help tab (new main tab)

#### Visual Identity
**Update:**
- App name and logo
- Color scheme (van life aesthetic - earthy tones, adventure vibes)
- Onboarding flow (emphasize van life verification)
- Profile cards (showcase van setup prominently)

### Migration Steps

#### Phase 1: Database & Backend (Week 1)
1. Add new schema tables (vanSetups, builderHelp, builderAnswers)
2. Modify existing tables (profiles, matches)
3. Create builder help queries/mutations
4. Update profile queries to include van setup
5. Modify matching logic for van life compatibility

#### Phase 2: Core Features (Week 2)
1. Update profile creation/editing for van setup
2. Modify swipe cards to show van info
3. Add match intent filtering
4. Build builder help Q&A interface
5. Integrate RevenueCat for premium features

#### Phase 3: Polish & Testing (Week 3)
1. Update onboarding flow
2. Add van life verification process
3. Implement premium feature gates
4. Test payment flows
5. Refine matching algorithm

#### Phase 4: Submission Prep (Week 4)
1. Final testing
2. Create demo video
3. Prepare contest submission materials
4. Deploy to TestFlight/Play Store beta

### Files to Update

#### High Priority
- `convex/schema.ts` - Add new tables, modify existing
- `app/(auth)/create-profile.tsx` - Add van setup fields
- `components/swipe/SwipeCard.tsx` - Show van info
- `app/(tabs)/builder-help.tsx` - New screen
- `lib/RevenueCat.ts` - Configure premium offerings
- `constants/vanTypes.ts` - Van-specific constants
- `constants/interests.ts` - Van life interests

#### Medium Priority
- `hooks/swipe/` - Update matching logic
- `components/profile/` - Add van setup display
- `types/profile.ts` - Add van setup types
- `validations/profile.ts` - Add van setup validation

#### Low Priority (Post-MVP)
- Map view for location discovery
- Group events/meetups
- Community feed

### What to Keep from WorldFriends

✅ **Keep:**
- Authentication system
- Profile verification
- Swipe/match mechanics
- Messaging infrastructure
- Real-time presence
- Push notifications
- Image upload system
- Block/report functionality
- Theme system

❌ **Remove/Modify:**
- Language exchange features
- Country/language filters (replace with location/route)
- Cultural exchange messaging
- Generic interests (replace with van life specific)

### Contest-Specific Considerations

1. **RevenueCat Integration**: Must be functional and demonstrable
2. **4-Week Timeline**: Focus on MVP features only
3. **Demo Video**: Showcase unique van life features
4. **Differentiation**: Emphasize niche focus vs generic apps
5. **Monetization**: Clear premium value proposition

## Quick Start Checklist

- [ ] Update app name in app.json and package.json
- [ ] Create new Convex project or migrate schema
- [ ] Set up RevenueCat account and configure products
- [ ] Update branding assets (logo, colors)
- [ ] Implement van setup in profiles
- [ ] Add builder help section
- [ ] Configure premium features
- [ ] Test payment flows
- [ ] Prepare demo content
- [ ] Submit to contest
