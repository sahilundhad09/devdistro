'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, CardBody } from '@/components/ui';
import styles from '../auth.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <Card>
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--color-success-bg)', margin: '0 auto var(--space-5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-success)', fontSize: '24px',
                }}>✓</div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                  Check your email
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authCard__header}>
          <Link href="/" className={styles.authCard__logo}>
            <div className={styles.authCard__logoIcon}>
              <Zap size={22} />
            </div>
            <span className={styles.authCard__logoText}>DevDistro</span>
          </Link>
          <h1 className={styles.authCard__title}>Create your account</h1>
          <p className={styles.authCard__subtitle}>
            Start generating distribution plans for free
          </p>
        </div>

        <Card>
          <CardBody>
            <div className={styles.authCard__form}>
              <button type="button" className={styles.oauthBtn} onClick={handleGoogleSignup}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className={styles.authCard__divider}>or</div>

              <form onSubmit={handleSignup} className={styles.authCard__form}>
                {error && <div className={styles.authCard__error}>{error}</div>}
                <Input label="Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <Button type="submit" fullWidth loading={loading}>Create Account</Button>
              </form>
            </div>
          </CardBody>
        </Card>

        <div className={styles.authCard__footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
