# CLAUDE.md — Aluminiologo Mobile App

## Overview
React Native / Expo mobile app that mirrors the Aluminiologo web frontend. Same backend API (NestJS + Prisma + Supabase), same design tokens, same business logic. Targets STAFF/admin users (and eventually CLIENT users). Available for iOS and Android, including tablets (iPad, Android tablets).

## Stack
- **Runtime**: Expo SDK 54 + React Native 0.81
- **Routing**: Expo Router 6 (file-based, `app/` directory)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native) — same class names as web
- **Server state**: TanStack Query v5 (`@tanstack/react-query`)
- **HTTP client**: Axios — interceptors attach Bearer token, unwrap `response.data.data`
- **Auth**: Supabase JS v2 — custom SecureStore adapter (tokens in expo-secure-store, NOT AsyncStorage)
- **i18n**: i18next + react-i18next (EN/ES, namespaces mirror web)
- **Animations**: React Native Reanimated 3
- **Gestures**: React Native Gesture Handler
- **Bottom Sheets**: @gorhom/bottom-sheet
- **Icons**: lucide-react-native + react-native-svg
- **Fonts**: Inter via @expo-google-fonts/inter
- **Haptics**: expo-haptics
- **Toasts**: react-native-toast-message

## Commands
```bash
npx expo start            # Dev server (scan QR with Expo Go)
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo run:ios          # Native iOS build
npx expo run:android      # Native Android build
eas build --platform ios  # EAS Cloud build (iOS)
eas build --platform android # EAS Cloud build (Android)
```

## Environment Variables
Create `.env.local` at project root:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SUPABASE_URL=<supabase_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```
All env vars for Expo must be prefixed with `EXPO_PUBLIC_`.

## Design System

### Colors (match web `hero.ts` exactly)
```
primary:    #3874FF  (blue)
secondary:  #31374A  (slate)
success:    #25B003  (green)
warning:    #E5780B  (orange)
danger:     #EC1F00  (red)

Light mode:
  background: #FFFFFF  foreground: #11181C
  content1: #FFFFFF    content2: #F4F4F5
  content3: #E4E4E7    content4: #D4D4D8

Dark mode:
  background: #0F1117  foreground: #ECEDEE
  content1: #18191F    content2: #1F2028
  content3: #272831    content4: #30313A
  secondary: #9BA1B0
```

### Typography
- Font family: **Inter** (400, 500, 600, 700)
- Loaded via `@expo-google-fonts/inter` + `useFonts` in root layout

### Status Colors (TransferStatus)
- DRAFT      → secondary (gray)
- IN_TRANSIT → warning   (amber)
- RECEIVED   → success   (green)
- DISPATCHED → primary   (blue)
- CANCELLED  → danger    (red)

## Architecture

```
app/                        # Expo Router file-based routes
  _layout.tsx               # Root: fonts, providers (Query, Auth, i18n, Toast)
  (auth)/
    _layout.tsx             # Auth layout (no tabs, centered forms)
    login.tsx               # Email/password login
    login-otp.tsx           # Phone + 6-digit OTP (2-step)
    forgot-password.tsx     # Send reset email
    reset-password.tsx      # Deep link → new password
  (app)/
    _layout.tsx             # Auth guard → redirect if not authenticated
    (tabs)/
      _layout.tsx           # Bottom tab navigator
      in-transit.tsx        # In Transit module (ACTIVE)
      transfers.tsx         # Placeholder
      profile.tsx           # Logout + settings

src/
  config/
    module-codes.ts         # ModuleCode enum (mirror web)
    constants.ts            # API_URL, storage keys, phone country codes
  contexts/
    AuthContext.tsx          # Auth state, login/logout/OTP, SecureStore
  hooks/
    usePermissions.ts       # RBAC: hasPermission, canAccess, isAdmin
    useCrudList.ts          # TanStack Query list hook (pagination, search, filters)
    queries.ts              # useTransfer, useStoresList
  lib/
    axios.ts                # Axios instance + auth interceptor + unwrap
    supabase.ts             # Supabase client with SecureStore adapter
    queryKeys.ts            # Query key factory
    queryInvalidation.ts    # invalidateEntity helper
    toast.ts                # toastSuccess, toastError, toastApiError
  services/
    transfers.service.ts    # getTransfers, dispatchTransfer, receiveTransfer, etc.
    stores.service.ts       # getStores
  types/
    transfer.ts             # Transfer, TransferLine, TransferStatus, etc.
    common.ts               # Pagination, PaginatedResponse
    store.ts                # Store, StoreType
    role.ts                 # UserRole, Permission
    auth.ts                 # AuthUser, LoginResponse
  i18n/
    index.ts                # i18next init (resources inline)
  locales/
    en/transfers.json       # EN strings
    es/transfers.json       # ES strings
    en/common.json
    es/common.json
    en/auth.json
    es/auth.json
  components/
    ui/
      StatusChip.tsx        # Transfer status chip
      EmptyState.tsx        # Empty list view
      LoadingScreen.tsx     # Full-screen spinner
      FilterSheet.tsx       # Bottom sheet for filters
      ScreenHeader.tsx      # Reusable header with title + right actions
    transfers/
      TransferCard.tsx      # Single transfer card
      TransferCardGrid.tsx  # SectionList grouped by status
      TransferDetailSheet.tsx  # Bottom sheet: transfer detail
      TransferReceiveSheet.tsx # Bottom sheet: receive flow
    auth/
      AuthGuard.tsx         # Redirect to login if not authenticated
  theme/
    colors.ts               # Color constants (tokens for use in JS/StyleSheet)
    index.ts                # Theme exports
```

## Critical Rules

1. **TanStack Query MANDATORY**: Never raw `useEffect`+`fetch`/`axios` for API calls. Use `useQuery`/`useMutation` or the hooks in `src/hooks/`.
2. **Tokens in SecureStore ONLY**: Never store auth tokens in AsyncStorage. Use `expo-secure-store` via the Supabase SecureStore adapter.
3. **i18n**: All user-facing strings via `useTranslation('namespace')`. EN + ES. Keys mirror web JSON files.
4. **API types snake_case**: Mirror backend exactly — do NOT convert to camelCase.
5. **Filters are backend-side**: Never filter/sort arrays on the client. All filters as query params with 400ms debounce.
6. **No full-screen spinners on refetch**: Use `placeholderData: keepPreviousData` in TanStack Query. Spinner only on initial load.
7. **Optimistic updates**: Mutations MUST use `queryClient.setQueriesData` for instant feedback + snapshot rollback on error (see InTransitPage.tsx in web).
8. **Haptic feedback**: `expo-haptics impactAsync(Light)` on card press, `notificationAsync(Success/Error)` on action results.
9. **RBAC**: Every protected screen checks `usePermissions()`. Respect `canUpdate` before showing action buttons.
10. **Dark mode**: Use `useColorScheme()` + NativeWind dark: variant. Colors from `src/theme/colors.ts`.

## Backend API Reference
- Base URL: `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:3001/api`)
- Auth prefix: `@Public()` — no token needed
- All other endpoints require `Authorization: Bearer <token>`
- Response envelope: `{ data: <payload> }` — axios interceptor unwraps automatically

### Auth Endpoints
```
POST /auth/login           { email, password }
POST /auth/otp/request     { phone }          # E.164 format e.g. +584121234567
POST /auth/otp/verify      { phone, code }    # 6-digit code
POST /auth/forgot-password { email }
```
Login response: `{ access_token, refresh_token, expires_in, account_type, staff, client, user }`

### Transfer Endpoints
```
GET    /transferences               Query: search, statuses, from_store_id, to_store_id, orderBy, page, limit, dispatched_today, received_today
GET    /transferences/:id
PATCH  /transferences/:id/dispatch
PATCH  /transferences/:id/receive   Body: { lines?: [{line_id, quantity_received}], incident_notes? }
PATCH  /transferences/:id/complete
```

## Auth Flow
1. Login → `POST /auth/login` → backend returns tokens + account_type + staff/client
2. Frontend calls `supabase.auth.setSession({ access_token, refresh_token })`
3. Supabase SDK persists tokens via SecureStore adapter (auto-refresh enabled)
4. Every API request: axios interceptor calls `supabase.auth.getSession()` → attaches Bearer token
5. 401 on non-auth endpoint → `supabase.auth.signOut()` → redirect to login
6. Session restore: on app mount check `supabase.auth.getSession()` + restore user from SecureStore

## In Transit Module Logic
- Fetches ALL active statuses: `statuses=DRAFT,IN_TRANSIT,RECEIVED,DISPATCHED`
- Also sends `dispatched_today` + `received_today` (ISO date) to filter DISPATCHED/RECEIVED to today only
- Groups cards by status: DRAFT → IN_TRANSIT → RECEIVED → DISPATCHED
- DRAFT cards: "Set In Transit" button → confirm → `PATCH /dispatch` → optimistic update to IN_TRANSIT
- IN_TRANSIT cards: "Receive" button → TransferReceiveSheet → `PATCH /receive` → optimistic update to RECEIVED
- Optimistic update pattern: snapshot queryData → update cache → call API → on error rollback snapshot

## Skills Installed (Global ~/.claude/)
- **impeccable** (pbakaus/impeccable) — design quality commands: /audit, /polish, /critique, /animate, /bolder
- **emil-design-eng** (emilkowalski/skill) — UI polish and micro-interaction principles
- **senaiverse React Native agents** — 7 specialized agents:
  - @grand-architect, @design-token-guardian, @a11y-enforcer, @test-generator
  - @performance-enforcer, @performance-prophet, @security-specialist

## EAS Project
- Project ID: `804cb622-c924-40e8-904d-dc5457bf5068`
- GitHub: `git@github.com:aluminiologo-prod/app.git`
- iOS bundle: `com.aluminiologo.app`
- Android package: `com.aluminiologo.app`
