// app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import styles from "../signup/Auth.module.css";

export default function VerifyEmail() {
  const [message, setMessage] = useState("Please check your email to verify your account.");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/signup"); // Redirect if no user is signed in
      return;
    }

    // Poll for email verification status every 2 seconds
    const interval = setInterval(async () => {
      await user.reload(); // Refresh user data
      if (user.emailVerified) {
        clearInterval(interval);
        router.push("/profile-setup");
      }
    }, 2000);

    // Handle resend cooldown
    if (resendCooldown > 0) {
      const cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(cooldownTimer);
    }

    return () => clearInterval(interval);
  }, [router, resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage("Verification email resent! Please check your inbox.");
        setResendCooldown(60); // 60-second cooldown
      }
    } catch (err) {
      setMessage(`Error resending email: ${(err as Error).message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Verify Your Email</h1>
      <p className={styles.message}>{message}</p>
      <button
        onClick={handleResend}
        className={styles.button}
        disabled={resendCooldown > 0}
      >
        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification Email"}
      </button>
      <p className={styles.link}>
        <a href="/login" className={styles.linkText}>
          Back to Login
        </a>
      </p>
    </div>
  );
}