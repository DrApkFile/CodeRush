// app/profile-setup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Alert from "../components/Alert";
import styles from "../signup/Auth.module.css";

export default function ProfileSetup() {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/signup"); // Redirect if not authenticated
    }
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview the image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      let profilePicUrl = "";
      if (profilePic) {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", profilePic);
        formData.append("upload_preset", "coderush_profiles"); // Create this preset in Cloudinary

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        profilePicUrl = data.url;
      }

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: user.displayName || "Anonymous", // From signup or Google
        email: user.email,
        bio: bio || "No bio yet",
        profilePicUrl: profilePicUrl || "",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      router.push("/dashboard");
    } catch (err: any) {
      setAlertMessage(err.message || "Failed to save profile. Try again.");
    }
  };

  return (
    <div className={styles.container}>
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}
      <h1 className={styles.title}>Set Up Your Profile</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.imageUpload}>
          <label htmlFor="profilePic" className={styles.imageLabel}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.preview} />
            ) : (
              "Upload Profile Picture"
            )}
          </label>
          <input
            type="file"
            id="profilePic"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />
        </div>
        <textarea
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={styles.textarea}
          maxLength={200}
        />
        <button type="submit" className={styles.button}>
          Save Profile
        </button>
      </form>
    </div>
  );
}