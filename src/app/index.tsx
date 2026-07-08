

import { Redirect } from "expo-router";

// sprawdzić stan auth użytkownika

export default function Index() {
  return <Redirect href="/onboarding" />;
}