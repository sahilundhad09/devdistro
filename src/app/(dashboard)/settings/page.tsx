'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, User, CreditCard, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardBody, CardHeader, Badge } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tier, setTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  // Read PayPal redirect feedback from query params
  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser && authUser.email) {
        setUser({ id: authUser.id, email: authUser.email });

        const { data: profile } = await supabase
          .from('users')
          .select('plan_tier')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setTier(profile.plan_tier);
        }
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  /**
   * Initiates the PayPal subscription flow.
   * Calls our server route which creates a PayPal subscription and
   * returns an approval URL. We then redirect the user to PayPal.
   */
  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);

    try {
      const res = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data.approvalUrl) {
        alert(`Could not initiate PayPal checkout: ${data.error || 'Unknown error'}`);
        setUpgrading(false);
        return;
      }

      // Redirect user to PayPal-hosted approval page
      window.location.href = data.approvalUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${message}`);
      setUpgrading(false);
    }
  };

  // ── Dev-only webhook simulator ──────────────────────────────────
  const [simulating, setSimulating] = useState(false);

  const handleSimulateWebhook = async (action: 'upgrade' | 'cancel') => {
    if (!user) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/dev/simulate-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, action }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          `Simulation successful: ${
            action === 'upgrade' ? 'Upgraded to Pro' : 'Cancelled subscription'
          }. Refreshing...`
        );
        window.location.reload();
      } else {
        alert(`Simulation failed: ${data.error}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error during simulation: ${message}`);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="skeleton" style={{ width: 100, height: 20 }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-2)',
        }}>
          Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage your account and subscription
        </p>
      </div>

      {/* ── PayPal Return Status Banners ── */}
      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--color-success-bg)',
          border: '2px solid var(--color-success)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
          color: 'var(--color-success)',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} />
          You&apos;re now on the Pro plan! Thank you for subscribing.
        </div>
      )}

      {cancelled && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--color-warning-bg)',
          border: '2px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
          color: 'var(--color-warning)',
          fontWeight: 600,
        }}>
          <XCircle size={18} />
          Payment cancelled. No charges were made.
        </div>
      )}

      {errorParam && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--color-error-bg)',
          border: '2px solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
          color: 'var(--color-error)',
          fontWeight: 600,
        }}>
          <AlertCircle size={18} />
          Something went wrong during checkout ({errorParam}). Please try again or contact support.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 600 }}>

        {/* Account Card */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <User size={18} />
              <span style={{ fontWeight: 600 }}>Account</span>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Logged in as:
              </p>
              <strong style={{ fontSize: 'var(--font-size-base)' }}>{user?.email}</strong>
            </div>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--space-4)',
            }}>
              Your account is managed through Supabase Authentication.
            </p>
            <Button
              variant="danger"
              icon={<LogOut size={16} />}
              loading={loggingOut}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </CardBody>
        </Card>

        {/* Billing Card */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CreditCard size={18} />
              <span style={{ fontWeight: 600 }}>Billing</span>
            </div>
            <Badge variant={tier === 'pro' ? 'accent' : 'default'}>
              {tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </Badge>
          </CardHeader>
          <CardBody>
            {tier === 'pro' ? (
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 'var(--line-height-relaxed)',
              }}>
                Thank you for supporting DevDistro! You are on the <strong>Pro</strong> plan
                with unlimited distribution plans. Your subscription is managed through PayPal —
                you can cancel anytime from your PayPal account.
              </p>
            ) : (
              <>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: 'var(--space-4)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}>
                  You&apos;re on the <strong>Free</strong> plan with 3 distribution plans per month.
                  Upgrade to <strong>Pro</strong> for unlimited plans at <strong>$9/month</strong>.
                  Payments are processed securely via PayPal.
                </p>
                <Button
                  variant="accent"
                  icon={<CreditCard size={16} />}
                  loading={upgrading}
                  onClick={handleUpgrade}
                >
                  Upgrade to Pro — $9/mo via PayPal
                </Button>
              </>
            )}
          </CardBody>
        </Card>

        {/* Developer Webhook Simulator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 600 }}>🛠️ Developer Webhook Simulator</span>
              </div>
            </CardHeader>
            <CardBody>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-4)',
                lineHeight: 'var(--line-height-relaxed)',
              }}>
                Test the PayPal integration locally without a real PayPal account.
                Sends a mock webhook payload to your local PayPal webhook endpoint.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button
                  variant={tier === 'pro' ? 'ghost' : 'primary'}
                  onClick={() => handleSimulateWebhook('upgrade')}
                  loading={simulating}
                >
                  Simulate Pro Upgrade
                </Button>
                {tier === 'pro' && (
                  <Button
                    variant="danger"
                    onClick={() => handleSimulateWebhook('cancel')}
                    loading={simulating}
                  >
                    Simulate Cancellation
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        )}

      </div>
    </div>
  );
}
