import { Redirect } from 'expo-router';

// Root index — immediately redirect into the app shell.
// The auth guard in app/(app)/_layout.tsx handles the login redirect
// if the user is not authenticated.
export default function Index() {
  return <Redirect href="/(app)/(tabs)/in-transit" />;
}
