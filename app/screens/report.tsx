import React, { Suspense } from "react";
import { useRouter } from "expo-router";
import { ScreenLoading } from "@/components/ScreenLoading";

const ReportComponent = React.lazy(() =>
  import("@/components/lazy/ReportComponent").then(module => ({
    default: module.default
  }))
);

export default function ReportScreen() {
  const router = useRouter();

  return (
    <Suspense fallback={<ScreenLoading onBack={() => router.back()} />}>
      <ReportComponent />
    </Suspense>
  );
}

