'use client';

import React from 'react';
import styles from './Input.module.css';

// ── Input ──────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function Input({
  label,
  hint,
  error,
  required,
  icon,
  action,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={styles.field}>
      {label && (
        <label
          htmlFor={inputId}
          className={`${styles.field__label} ${required ? styles['field__label--required'] : ''}`}
        >
          {label}
        </label>
      )}

      {icon || action ? (
        <div className={styles.inputWrapper}>
          {icon && <span className={styles.inputWrapper__icon}>{icon}</span>}
          <input
            id={inputId}
            className={`${styles.input} ${error ? styles['input--error'] : ''} ${className}`}
            {...props}
          />
          {action && <span className={styles.inputWrapper__action}>{action}</span>}
        </div>
      ) : (
        <input
          id={inputId}
          className={`${styles.input} ${error ? styles['input--error'] : ''} ${className}`}
          {...props}
        />
      )}

      {hint && !error && <span className={styles.field__hint}>{hint}</span>}
      {error && <span className={styles.field__error}>{error}</span>}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  required,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={styles.field}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`${styles.field__label} ${required ? styles['field__label--required'] : ''}`}
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={`${styles.textarea} ${error ? styles['textarea--error'] : ''} ${className}`}
        {...props}
      />

      {hint && !error && <span className={styles.field__hint}>{hint}</span>}
      {error && <span className={styles.field__error}>{error}</span>}
    </div>
  );
}
