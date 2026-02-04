import React, { Suspense } from "react";
import { ScreenLoading } from "@/components/ScreenLoading";
import { useRouter } from "expo-router";

const EditProfileComponent = React.lazy(() => 
  import("@/components/lazy/EditProfileComponent").then(module => ({
    default: module.EditProfileComponent
  }))
);

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <Suspense fallback={<ScreenLoading onBack={() => router.back()} />}>
      <EditProfileComponent />
    </Suspense>
  );
}