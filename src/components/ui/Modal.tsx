'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  large?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, large, children, footer }: ModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${large ? styles['modal--lg'] : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className={styles.modal__header}>
            <h2 className={styles.modal__title}>{title}</h2>
            <button className={styles.modal__close} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <div className={styles.modal__body}>{children}</div>
        {footer && <div className={styles.modal__footer}>{footer}</div>}
      </div>
    </div>
  );
}
