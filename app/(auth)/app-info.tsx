import React, { Suspense } from "react";
import { useRouter } from "expo-router";
import { ScreenLoading } from "@/components/ScreenLoading";

const AppInfoComponent = React.lazy(() =>
  import("@/components/lazy/AppInfoComponent").then(module => ({
    default: module.AppInfoComponent
  }))
);
export default function AppInfoScreen() {
  const router = useRouter();

  return (
    <Suspense fallback={<ScreenLoading onBack={() => router.back()} />}>
      <AppInfoComponent />
    </Suspense>
  );
}