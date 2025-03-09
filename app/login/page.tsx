// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import styles from "../signup/Auth.module.css";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, emailOrUsername, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailOrUsername) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailOrUsername);
      setResetSent(true);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Log In to Code Rush</h1>
      <form onSubmit={handleLogin} className={styles.form}>
        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>
          Log In
        </button>
      </form>
      <button onClick={handleGoogleLogin} className={styles.googleButton}>
        Log In with Google
      </button>
      <button onClick={handleForgotPassword} className={styles.forgotButton}>
        Forgot Password?
      </button>
      {resetSent && (
        <p className={styles.success}>Password reset email sent!</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.link}>
        Don’t have an account?{" "}
        <a href="/signup" className={styles.linkText}>
          Sign Up
        </a>
      </p>
    </div>
  );
}