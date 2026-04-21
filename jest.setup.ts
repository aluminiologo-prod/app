/**
 * jest.setup.ts
 *
 * Runs after jest-expo loads the test environment but before each test file.
 * Establishes all global mocks needed by the project's test suite.
 *
 * Rules applied here:
 *  - jest.mock() factories must not reference out-of-scope variables.
 *    Variables used inside a factory must either be declared inside it, or
 *    (for jest.fn() spies) be prefixed with "mock" so the Babel hoisting
 *    rule allows them.
 *  - Stateful mocks (SecureStore, Supabase auth) expose their state via
 *    module-level variables that tests can import with jest.requireMock().
 */

// Skip @testing-library/react-native peer dep version check.
// react@19.1.0 and react-test-renderer@19.2.5 have a minor version mismatch
// (installed with --legacy-peer-deps) but are functionally compatible.
import '@testing-library/jest-native/extend-expect';

process.env['RNTL_SKIP_DEPS_CHECK'] = 'true';

// ---------------------------------------------------------------------------
// expo/src/winter — mock the ImportMetaRegistry and related shims that
// expo-sdk 54 installs lazily via installGlobal. Without this the jest-expo
// setup.js call to require('expo/src/winter') throws
// "You are trying to import a file outside of the scope of the test code"
// when the __ExpoImportMetaRegistry lazy getter resolves.
// ---------------------------------------------------------------------------
jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: { url: null },
}));

// @ungap/structured-clone is a polyfill expo requires for Hermes;
// Node.js already has structuredClone natively so we can just re-export it.
jest.mock('@ungap/structured-clone', () => ({
  __esModule: true,
  default: (val: unknown) => JSON.parse(JSON.stringify(val)),
}));

// expo/virtual/streams — the jest-expo setup conditionally requires this when
// `process.env.EXPO_OS !== 'web' && typeof window !== 'undefined'`.
// In the jest-expo test environment window is defined and EXPO_OS is 'ios',
// which causes the streams polyfill to crash Node's built-in stream internals.
// Mock the module to prevent this crash.
jest.mock('expo/virtual/streams', () => {});

// ---------------------------------------------------------------------------
// expo-router — file-based routing; tests must never navigate for real
// ---------------------------------------------------------------------------
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  useLocalSearchParams: jest.fn(() => ({})),
  Redirect: () => null,
  Link: ({ children }: { children: unknown }) => children,
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));

// ---------------------------------------------------------------------------
// @react-native-async-storage/async-storage — in-memory implementation
// ---------------------------------------------------------------------------
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) =>
        Promise.resolve(store.get(key) ?? null),
      ),
      setItem: jest.fn((key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  };
});

// ---------------------------------------------------------------------------
// expo-secure-store — in-memory implementation so nothing touches the keychain
// ---------------------------------------------------------------------------
// NOTE: the Map must be declared INSIDE the factory (jest.mock hoisting rule).
// We expose the factory's functions so tests can control them via
// jest.requireMock('expo-secure-store').
jest.mock('expo-secure-store', () => {
  // This closure is hoisted — declare state inside the factory.
  const store = new Map<string, string>();
  return {
    _store: store, // exposed for test helpers that need to seed state
    getItemAsync: jest.fn((key: string) =>
      Promise.resolve(store.get(key) ?? null),
    ),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

// Clear the in-memory secure store between tests
afterEach(() => {
  const secureStoreMock = jest.requireMock('expo-secure-store') as {
    _store: Map<string, string>;
    getItemAsync: jest.Mock;
    setItemAsync: jest.Mock;
    deleteItemAsync: jest.Mock;
  };
  secureStoreMock._store.clear();
  secureStoreMock.getItemAsync.mockClear();
  secureStoreMock.setItemAsync.mockClear();
  secureStoreMock.deleteItemAsync.mockClear();

  // Re-bind implementation after clear so the Map reference stays live
  secureStoreMock.getItemAsync.mockImplementation((key: string) =>
    Promise.resolve(secureStoreMock._store.get(key) ?? null),
  );
  secureStoreMock.setItemAsync.mockImplementation(
    (key: string, value: string) => {
      secureStoreMock._store.set(key, value);
      return Promise.resolve();
    },
  );
  secureStoreMock.deleteItemAsync.mockImplementation((key: string) => {
    secureStoreMock._store.delete(key);
    return Promise.resolve();
  });
});

// ---------------------------------------------------------------------------
// @supabase/supabase-js — mock createClient; tests control auth via
// jest.requireMock('@supabase/supabase-js').createClient.mock.results[0].value.auth
// ---------------------------------------------------------------------------
jest.mock('@supabase/supabase-js', () => {
  const mockSubscription = { unsubscribe: jest.fn() };
  const mockAuth = {
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: null }, error: null }),
    ),
    setSession: jest.fn(() =>
      Promise.resolve({ data: { session: null }, error: null }),
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: mockSubscription },
    })),
  };
  return {
    createClient: jest.fn(() => ({ auth: mockAuth })),
  };
});

// ---------------------------------------------------------------------------
// expo-haptics — prevent native module errors in tests
// ---------------------------------------------------------------------------
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

// ---------------------------------------------------------------------------
// react-native-toast-message — spy-able mock
// ---------------------------------------------------------------------------
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
    hide: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// @gorhom/bottom-sheet — render children inline so RTL can query them
// ---------------------------------------------------------------------------
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View, ScrollView } = require('react-native');

  const BottomSheet = React.forwardRef(
    (
      { children }: { children?: React.ReactNode },
      ref: React.Ref<unknown>,
    ) => {
      React.useImperativeHandle(ref, () => ({
        expand: jest.fn(),
        close: jest.fn(),
        snapToIndex: jest.fn(),
        collapse: jest.fn(),
      }));
      return React.createElement(View, { testID: 'bottom-sheet' }, children);
    },
  );
  BottomSheet.displayName = 'BottomSheet';

  const BottomSheetScrollView = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [k: string]: unknown;
  }) => React.createElement(ScrollView, props, children);

  const BottomSheetView = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [k: string]: unknown;
  }) => React.createElement(View, props, children);

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetScrollView,
    BottomSheetView,
  };
});

// ---------------------------------------------------------------------------
// nativewind — passthrough; the Tailwind transform is a Metro plugin that
// does not run in Node/Jest.
// ---------------------------------------------------------------------------
jest.mock('nativewind', () => ({
  styled: (component: unknown) => component,
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
  withExpoSnack: (c: unknown) => c,
}));

// ---------------------------------------------------------------------------
// react-i18next — return the translation key so assertions are deterministic
// ---------------------------------------------------------------------------
jest.mock('react-i18next', () => ({
  useTranslation: (_ns?: string) => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && typeof options.count === 'number') {
        return `${key}:${options.count}`;
      }
      return key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

// ---------------------------------------------------------------------------
// expo-localization — deterministic locale in tests
// ---------------------------------------------------------------------------
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
}));

// ---------------------------------------------------------------------------
// lucide-react-native — render a simple View stub for every icon
// ---------------------------------------------------------------------------
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Icon = ({ testID }: { testID?: string }) =>
          React.createElement(View, { testID: testID ?? prop });
        Icon.displayName = prop;
        return Icon;
      },
    },
  );
});

// ---------------------------------------------------------------------------
// react-native-svg — stub SVG primitives used by lucide
// ---------------------------------------------------------------------------
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    __esModule: true,
    default: stub,
    Svg: stub,
    Path: stub,
    G: stub,
    Circle: stub,
    Rect: stub,
    Defs: stub,
    Pattern: stub,
    LinearGradient: stub,
    Stop: stub,
    ClipPath: stub,
  };
});

// ---------------------------------------------------------------------------
// React Native Reanimated — use the provided test mock
// ---------------------------------------------------------------------------
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// ---------------------------------------------------------------------------
// react-native-safe-area-context
// ---------------------------------------------------------------------------
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
