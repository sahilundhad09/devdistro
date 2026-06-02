import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: boolean;
  bordered?: boolean;
  compact?: boolean;
  flush?: boolean;
  children: React.ReactNode;
}

export function Card({
  interactive = false,
  glow = false,
  bordered = false,
  compact = false,
  flush = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    interactive && styles['card--interactive'],
    glow && styles['card--glow'],
    bordered && styles['card--bordered'],
    compact && styles['card--compact'],
    flush && styles['card--flush'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.card__header} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.card__body} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.card__footer} ${className}`} {...props}>
      {children}
    </div>
  );
}
