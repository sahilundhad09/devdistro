'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  Settings,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { Badge } from '@/components/ui';

interface SidebarProps {
  user?: {
    name: string | null;
    email: string;
    avatar_url: string | null;
    plan_tier: string;
  } | null;
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new', label: 'New Plan', icon: Plus },
];

const bottomLinks = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <>
      {/* Mobile toggle */}
      <button
        className={styles.sidebar__toggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className={`${styles.sidebar__backdrop} ${styles['sidebar__backdrop--visible']}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles['sidebar--open'] : ''}`}>
        {/* Logo */}
        <div className={styles.sidebar__header}>
          <Link href="/dashboard" className={styles.sidebar__logo}>
            <div className={styles.sidebar__logoIcon}>
              <Zap size={18} />
            </div>
            <span className={styles.sidebar__logoText}>DevDistro</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebar__nav}>
          <div className={styles.sidebar__section}>Menu</div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.sidebar__link} ${isActive ? styles['sidebar__link--active'] : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.sidebar__linkIcon}>
                  <Icon size={18} />
                </span>
                {link.label}
              </Link>
            );
          })}

          <div className={styles.sidebar__divider} />
          <div className={styles.sidebar__section}>Account</div>
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.sidebar__link} ${isActive ? styles['sidebar__link--active'] : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.sidebar__linkIcon}>
                  <Icon size={18} />
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className={styles.sidebar__footer}>
            <div className={styles.sidebar__user}>
              <div className={styles.sidebar__avatar}>
                {user.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatar_url} alt={user.name || 'Avatar'} />
                ) : (
                  initials
                )}
              </div>
              <div className={styles.sidebar__userInfo}>
                <div className={styles.sidebar__userName}>{user.name || user.email}</div>
                <Badge variant={user.plan_tier === 'pro' ? 'accent' : 'default'}>
                  {user.plan_tier === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
