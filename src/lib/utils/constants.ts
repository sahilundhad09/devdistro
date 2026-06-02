// ================================================================
// DevDistro — App Constants
// ================================================================

export const APP_NAME = 'DevDistro';
export const APP_DESCRIPTION = 'Describe your app or service. Get an exact distribution plan ready to execute today.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ── Plan Limits ──
export const FREE_PLAN_LIMIT = 3; // plans per month
export const FREE_TIER_NAME = 'Free';
export const PRO_TIER_NAME = 'Pro';
export const PRO_PRICE_MONTHLY = 9;
export const PRO_PRICE_YEARLY = 79;

// ── Rate Limiting ──
export const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
export const RATE_LIMIT_FREE = 2;      // requests per window
export const RATE_LIMIT_PRO = 20;      // requests per window

// ── AI ──
export const AI_MODEL = 'llama-3.3-70b-versatile';
export const AI_MAX_TOKENS = 4096;
export const AI_TEMPERATURE = 0.7;
export const AI_MAX_RETRIES = 2;

// ── URL Scraper ──
export const SCRAPER_MAX_CONTENT_LENGTH = 2000;
export const SCRAPER_TIMEOUT = 10000; // 10 seconds

// ── Channel Display Names ──
export const CHANNEL_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  facebook: 'Facebook Groups',
  twitter: 'Twitter / X',
  newsletter: 'Newsletters',
  directory: 'Directories',
  linkedin: 'LinkedIn',
};

// ── Channel Icons (Lucide icon names) ──
export const CHANNEL_ICONS: Record<string, string> = {
  reddit: 'MessageCircle',
  facebook: 'Users',
  twitter: 'Twitter',
  newsletter: 'Mail',
  directory: 'Globe',
  linkedin: 'Linkedin',
};

// ── Status Labels ──
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  done: 'Done',
  skipped: 'Skipped',
  saved: 'Saved for Later',
};

// ── Navigation Links ──
export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/new', label: 'New Plan', icon: 'Plus' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];
