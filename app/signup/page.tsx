// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import styles from "./Auth.module.css";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      // Redirect to verify-email page instead of profile-setup directly
      router.push("/verify-email");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/profile-setup"); // Google users skip email verification
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign Up for Code Rush</h1>
      <form onSubmit={handleSignup} className={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Sign Up
        </button>
      </form>
      <button onClick={handleGoogleSignup} className={styles.googleButton}>
        Sign Up with Google
      </button>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.link}>
        Already have an account?{" "}
        <a href="/login" className={styles.linkText}>
          Log In
        </a>
      </p>
    </div>
  );
}