import { Redirect } from "expo-router";

// The old blue onboarding lived here. Replaced by OnboardingScreen.tsx.
// This redirect ensures any navigation to (tabs)/index goes to the real onboarding.
export default function TabsIndex() {
  return <Redirect href="/OnboardingScreen" />;
}
