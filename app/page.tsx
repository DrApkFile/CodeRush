// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Onboarding from "./components/Onboarding";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (hasSeenOnboarding) {
      router.push("/login"); // Default to login if already seen
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
    }
  }, [router]);

  return <Onboarding />;
}