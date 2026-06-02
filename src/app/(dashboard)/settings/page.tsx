'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { getCheckoutUrl } from '@/lib/payments/lemonsqueezy';

export default function SettingsPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tier, setTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser && authUser.email) {
        setUser({ id: authUser.id, email: authUser.email });

        // Fetch user's profile tier
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

  const handleUpgrade = () => {
    if (!user) return;
    const checkoutUrl = getCheckoutUrl(user.id, user.email);
    window.open(checkoutUrl, '_blank');
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 600 }}>
        {/* Account */}
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
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
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

        {/* Billing */}
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
                marginBottom: 'var(--space-4)',
                lineHeight: 'var(--line-height-relaxed)',
              }}>
                Thank you for supporting DevDistro! You are currently on the <strong>Pro</strong> plan with unlimited distribution plans.
              </p>
            ) : (
              <>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  marginBottom: 'var(--space-4)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}>
                  You&apos;re currently on the <strong>Free</strong> plan with 3 distribution plans per month.
                  Upgrade to <strong>Pro</strong> for unlimited plans.
                </p>
                <Button variant="accent" icon={<CreditCard size={16} />} onClick={handleUpgrade}>
                  Upgrade to Pro — $9/mo
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

