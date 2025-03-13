'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../src/contexts/AuthContext';
import styles from './Onboarding.module.css';
import Image from 'next/image';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Debug logs
  useEffect(() => {
    console.log('Auth State:', { user, loading, animationComplete });
  }, [user, loading, animationComplete]);

  useEffect(() => {
    setShowContent(true);
    const duration = 10000;
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(progressInterval);
        setAnimationComplete(true);
      }
    }, interval);

    return () => clearInterval(progressInterval);
  }, []);

  // Handle redirection after animation completes
  useEffect(() => {
    if (animationComplete && !loading) {
      console.log('Ready to redirect:', { user: !!user });
      if (user) {
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        console.log('Redirecting to login...');
        router.push('/login');
      }
    }
  }, [animationComplete, loading, user, router]);

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${showContent ? styles.visible : ''}`}>
        <div className={styles.logo}>
          <Image
            src="/CodeRushLogo.jpg" // Make sure to add your logo file
            alt="Code Rush Logo"
            width={120}
            height={120}
            priority
            className={styles.logoImage}
          />
        </div>
        <h1 className={styles.title}>Code Rush</h1>
        <div className={styles.loadingBarContainer}>
          <div 
            className={styles.loadingBar} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={styles.loadingText}>
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
