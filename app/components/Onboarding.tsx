// app/components/Onboarding.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import styles from "./Onboarding.module.css";

export default function Onboarding() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading progress over 10 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; // Increment by 1% every 100ms (10s total)
      });
    }, 100);

    // Check authentication state after loading completes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (progress === 100) {
        if (user) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [progress, router]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img
          src="/coderush.png" // Placeholder for your logo
          alt="Code Rush Logo"
          className={styles.logo}
        />
        <h1 className={styles.title}>Code Rush</h1>
      </div>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressCounter}>{progress}%</span>
      </div>
    </div>
  );
}