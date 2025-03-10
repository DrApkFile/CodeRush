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
import Alert from "../components/Alert";
import styles from "./Auth.module.css";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  const getCustomErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in!";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Your password is too weak. Use at least 6 characters.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      router.push("/verify-email");
    } catch (err: any) {
      setAlertMessage(getCustomErrorMessage(err.code));
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/profile-setup");
    } catch (err: any) {
      setAlertMessage("Google signup failed. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}
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
      <p className={styles.link}>
        Already have an account?{" "}
        <a href="/login" className={styles.linkText}>
          Log In
        </a>
      </p>
    </div>
  );
}