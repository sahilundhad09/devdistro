import React from 'react';
import styles from './Badge.module.css';
import type { BadgeVariant } from '@/types';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${variant}`]} ${className}`}>
      {dot && <span className={styles.badge__dot} />}
      {children}
    </span>
  );
}
