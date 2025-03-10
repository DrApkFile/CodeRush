// app/components/Alert.tsx
"use client";

import styles from "./Alert.module.css";

interface AlertProps {
  message: string;
  onClose: () => void;
}

export default function Alert({ message, onClose }: AlertProps) {
  return (
    <div className={styles.alert}>
      <p>{message}</p>
      <button onClick={onClose} className={styles.closeButton}>
        ×
      </button>
    </div>
  );
}