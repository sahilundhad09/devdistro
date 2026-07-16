'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './TypewriterHeading.module.css';

interface TypewriterHeadingProps {
  text: string;
  /** Number of characters to show in white (rest will be accent color) */
  splitAt: number;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export default function TypewriterHeading({
  text,
  splitAt,
  speed = 35,
  delay = 400,
  onComplete,
}: TypewriterHeadingProps) {
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  // Track if onComplete has been fired to prevent double-calls
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start typing after delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(true);
      intervalRef.current = setInterval(() => {
        // Only increment — no side effects inside updater
        setCharIndex((prev) => Math.min(prev + 1, text.length));
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect to detect completion — safe place for side effects
  useEffect(() => {
    if (charIndex >= text.length && isTyping && !completedRef.current) {
      completedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTyping(false);
      setIsDone(true);
      onComplete?.();
    }
  }, [charIndex, isTyping, text.length, onComplete]);

  const whiteText = text.slice(0, Math.min(charIndex, splitAt));
  const accentText = charIndex > splitAt ? text.slice(splitAt, charIndex) : '';
  const showCursor = !isDone;

  return (
    <h1 className={styles.heading} suppressHydrationWarning>
      <span className={styles.white}>{whiteText}</span>
      <span className={styles.accent}>{accentText}</span>
      {showCursor && <span className={styles.cursor} />}
    </h1>
  );
}
