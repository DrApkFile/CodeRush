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
import Alert from "../components/Alert";
import styles from "../signup/Auth.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const getCustomErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Wrong password. Try again or reset it.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";
      default:
        return "Login failed. Please try again.";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setAlertMessage(getCustomErrorMessage(err.code));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setAlertMessage("Google login failed. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAlertMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setAlertMessage(""); // Clear any error
    } catch (err: any) {
      setAlertMessage("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}
      <h1 className={styles.title}>Log In to Code Rush</h1>
      <form onSubmit={handleLogin} className={styles.form}>
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
      <p className={styles.link}>
        Don’t have an account?{" "}
        <a href="/signup" className={styles.linkText}>
          Sign Up
        </a>
      </p>
    </div>
  );
}