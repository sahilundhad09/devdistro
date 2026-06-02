// ================================================================
// DevDistro — Type Definitions
// ================================================================

// ── Database Types ─────────────────────────────────────────────

export type PlanTier = 'free' | 'pro';
export type ProjectMode = 'app' | 'freelance';
export type ChannelType = 'reddit' | 'facebook' | 'twitter' | 'newsletter' | 'directory' | 'linkedin';
export type ItemStatus = 'pending' | 'done' | 'skipped' | 'saved';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan_tier: PlanTier;
  plans_used_this_month: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_audience: string;
  landing_url: string | null;
  scraped_content: string | null;
  mode: ProjectMode;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  project_id: string;
  user_id: string;
  quick_wins: string[];
  producthunt_checklist: string[];
  version: number;
  created_at: string;
}

export interface PlanChannel {
  id: string;
  plan_id: string;
  channel_type: ChannelType;
  sort_order: number;
}

export interface PlanItem {
  id: string;
  channel_id: string;
  plan_id: string;
  user_id: string;
  title: string;
  description: string | null;
  url: string | null;
  audience_size: string | null;
  angle: string | null;
  template_title: string | null;
  template_body: string | null;
  status: ItemStatus;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  lemon_customer_id: string | null;
  lemon_subscription_id: string | null;
  status: SubscriptionStatus;
  plan_name: string | null;
  current_period_end: string | null;
  created_at: string;
}

// ── API Types ──────────────────────────────────────────────────

export interface GeneratePlanRequest {
  projectId?: string;
  title: string;
  description: string;
  targetAudience: string;
  landingUrl?: string;
  mode: ProjectMode;
}

export interface GeneratePlanResponse {
  planId: string;
  channels: Record<ChannelType, PlanItemData[]>;
  quickWins: string[];
  producthuntChecklist: string[];
}

export interface PlanItemData {
  title: string;
  description: string;
  url?: string;
  audience_size?: string;
  angle: string;
  template_title?: string;
  template_body?: string;
}

export interface ReadUrlRequest {
  url: string;
}

export interface ReadUrlResponse {
  title: string;
  description: string;
  content: string;
  success: boolean;
}

export interface UpdateActionRequest {
  itemId: string;
  status: ItemStatus;
  notes?: string;
}

// ── Composite Types (for frontend display) ──────────────────────

export interface PlanWithChannels extends Plan {
  channels: (PlanChannel & { items: PlanItem[] })[];
}

export interface ProjectWithPlans extends Project {
  plans: Plan[];
  latestPlan?: PlanWithChannels;
}

export interface DashboardProject extends Project {
  planCount: number;
  completedActions: number;
  totalActions: number;
  lastGeneratedAt: string | null;
}

// ── Component Props ────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
