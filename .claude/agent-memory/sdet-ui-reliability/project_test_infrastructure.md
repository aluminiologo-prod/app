---
name: Test Infrastructure Setup
description: All decisions and quirks involved in bootstrapping Jest + RNTL for expo-sdk 54 + NativeWind v4
type: project
---

Jest + React Native Testing Library unit test suite established for aluminiologo-app (Expo SDK 54, RN 0.81, NativeWind v4).

**Why:** No test infrastructure existed at all. Established from scratch.

**How to apply:** All future test work builds on these decisions and known quirks.

## Package versions installed (April 2026)
- `jest@30` + `jest-expo@55` + `@testing-library/react-native@13` + `react-test-renderer@19.2.5`
- Installed with `--legacy-peer-deps` because `react-test-renderer@19.2.5` doesn't exactly match `react@19.1.0`
- `RNTL_SKIP_DEPS_CHECK=true` set in jest.setup.ts to bypass the peer dep version check

## Critical jest.config.js settings
- `preset: 'jest-expo'` — provides transform and basic RN mocks
- `setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']` — global mocks loaded after framework
- `moduleNameMapper: { '^expo/virtual/streams$': '<rootDir>/src/__mocks__/empty.js' }` — prevents a crash where expo/virtual/streams.js corrupts Node's stream internals in the jest environment
- `transformIgnorePatterns` starts with `/node_modules/` (NOT `node_modules/` without leading slash) — the preset uses the slash-prefixed form
- `--forceExit` in test scripts — TanStack Query keeps open handles that prevent graceful exit

## Known expo-sdk 54 / jest quirks
1. `expo/src/winter/ImportMetaRegistry` must be mocked in jest.setup.ts — otherwise jest throws "import outside scope" when the lazy `__ExpoImportMetaRegistry` global is accessed
2. `@ungap/structured-clone` must be mocked — expo's winter runtime requires it and the RN-specific import path fails in Node
3. `expo/virtual/streams` must be mapped to empty module via `moduleNameMapper` — it patches global ReadableStream in a way that crashes Node (must happen before jest-expo's setupFiles run, hence moduleNameMapper not jest.mock)

## Supabase mock access pattern
- `@supabase/supabase-js` is mocked in jest.setup.ts with a factory that returns `{ auth: mockAuth }`
- `supabase.ts` calls `createClient()` at module load time and caches the result
- To access `mockAuth` in tests: `import { supabase } from '../../lib/supabase'` then cast `supabase.auth as SupabaseAuthMock`
- Do NOT use `jest.requireMock('@supabase/supabase-js').createClient.mock.results[0].value.auth` — results[0] is undefined before the test body runs

## NativeWind v4 style assertions
- NativeWind wraps inline style objects into `{ sample: <styleObject>, inverse: false }` in the Jest environment
- `UNSAFE_getByProps({ style: expect.objectContaining({ backgroundColor: X }) })` will NOT match
- Instead, find the View via `UNSAFE_getAllByType(RN.View)` and check `v.props.style?.sample?.backgroundColor ?? v.props.style?.backgroundColor`

## NativeWind v4 event interaction
- NativeWind's css-interop wraps Pressable — `component.props.onPress` is not directly callable
- Always use `fireEvent.press(screen.getByTestId('id'))` instead of `screen.getByTestId('id').props.onPress()`
- `UNSAFE_getAllByType(require('react-native').Pressable)` may return no results — use text-based queries or testID queries instead

## test npm scripts
- `npm test` → `jest --forceExit`
- `npm run test:watch` → `jest --watch --forceExit`
- `npm run test:coverage` → `jest --coverage --forceExit`
