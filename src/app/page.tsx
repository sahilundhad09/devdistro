'use client';

import Link from 'next/link';
import {
  Zap, Target, MessageSquare, CheckCircle2, Globe, Clock,
  Briefcase, ArrowRight, Check,
} from 'lucide-react';
import { Button, Card, CardBody, Badge } from '@/components/ui';
import DemoPreview from '@/components/marketing/DemoPreview';
import styles from './(marketing)/landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.landing}>

      {/* ═══════════════════════════════════════════════════════════
          VELORAH HERO SECTION — Fullscreen cinematic video hero
          ═══════════════════════════════════════════════════════════ */}
      <section
        className={styles.velorah}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'hsl(201 100% 13%)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* ── Video Background ── */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            type="video/mp4"
          />
        </video>

        {/* ── Glassmorphic Navigation ── */}
        <nav
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem 2rem',
            maxWidth: '80rem',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Logo */}
          <span
            style={{
              fontSize: '1.875rem',
              letterSpacing: '-0.025em',
              color: 'hsl(0 0% 100%)',
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            Velorah<sup style={{ fontSize: '0.75rem', verticalAlign: 'super' }}>®</sup>
          </span>

          {/* Nav links — hidden on mobile */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
            }}
            className={styles.velorah__navLinks}
          >
            {[
              { label: 'Home', active: true },
              { label: 'Studio', active: false },
              { label: 'About', active: false },
              { label: 'Journal', active: false },
              { label: 'Reach Us', active: false },
            ].map((link) => (
              <a
                key={link.label}
                href="#"
                style={{
                  fontSize: '0.875rem',
                  color: link.active ? 'hsl(0 0% 100%)' : 'hsl(240 4% 66%)',
                  textDecoration: 'none',
                  transition: 'color 200ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(0 0% 100%)';
                }}
                onMouseLeave={(e) => {
                  if (!link.active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(240 4% 66%)';
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className="liquid-glass"
            style={{
              borderRadius: '9999px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              color: 'hsl(0 0% 100%)',
              background: 'rgba(255,255,255,0.01)',
              cursor: 'pointer',
              transition: 'transform 200ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            Begin Journey
          </button>
        </nav>

        {/* ── Hero Content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            flex: 1,
            padding: '90px 1.5rem 10rem',
          }}
        >
          {/* H1 */}
          <h1
            className="animate-fade-rise"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(3rem, 9vw, 6rem)',
              lineHeight: 0.95,
              letterSpacing: '-2.46px',
              maxWidth: '80rem',
              fontWeight: 400,
              color: 'hsl(0 0% 100%)',
              margin: 0,
            }}
          >
            Where{' '}
            <em className="not-italic" style={{ color: 'hsl(240 4% 66%)', fontStyle: 'normal' }}>
              dreams
            </em>{' '}
            rise{' '}
            <em className="not-italic" style={{ color: 'hsl(240 4% 66%)', fontStyle: 'normal' }}>
              through the silence.
            </em>
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-rise-delay"
            style={{
              color: 'hsl(240 4% 66%)',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              maxWidth: '42rem',
              marginTop: '2rem',
              lineHeight: 1.7,
            }}
          >
            We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels. Amid
            the chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          {/* CTA Button */}
          <button
            className="liquid-glass animate-fade-rise-delay-2"
            style={{
              borderRadius: '9999px',
              padding: '1.25rem 3.5rem',
              fontSize: '1rem',
              color: 'hsl(0 0% 100%)',
              background: 'rgba(255,255,255,0.01)',
              cursor: 'pointer',
              marginTop: '3rem',
              transition: 'transform 200ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            Begin Journey
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          REST OF DEVDISTRO LANDING PAGE
          ═══════════════════════════════════════════════════════════ */}

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.nav__inner}>
          <Link href="/" className={styles.nav__logo}>
            <div className={styles.nav__logoIcon}>
              <Zap size={18} />
            </div>
            <span className={styles.nav__logoText}>DevDistro</span>
          </Link>
          <div className={styles.nav__links}>
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero (DevDistro original) */}
      <section className={styles.hero}>
        <div className={styles.hero__glow} />
        <div className={styles.hero__badge}>
          <Zap size={14} /> AI-Powered Distribution Plans
        </div>
        <h1 className={styles.hero__title}>
          Stop guessing where to{' '}
          <span className="gradient-text">distribute</span> your product
        </h1>
        <p className={styles.hero__subtitle}>
          Describe your app or service. Get a specific, actionable distribution plan
          with exact subreddits, groups, directories, and ready-to-use message templates.
        </p>
        <div className={styles.hero__cta}>
          <Link href="/signup">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              Generate Your Plan — Free
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="secondary" size="lg">
              See How It Works
            </Button>
          </Link>
        </div>
      </section>

      {/* Demo Preview */}
      <DemoPreview />

      {/* Features */}
      <section id="features" className={styles.features}>
        <h2 className={styles.features__title}>Not generic advice. Specific actions.</h2>
        <p className={styles.features__subtitle}>
          Every plan is tailored to your exact product, audience, and market.
        </p>
        <div className={styles.features__grid}>
          {[
            {
              icon: <Target size={24} />,
              title: 'Hyper-Targeted Communities',
              desc: 'Get exact subreddits, Facebook groups, and LinkedIn strategies — with subscriber counts and the right angle for each.',
            },
            {
              icon: <MessageSquare size={24} />,
              title: 'Ready-to-Use Templates',
              desc: "Copy-paste message templates tailored to each community's tone and rules. No more staring at a blank screen.",
            },
            {
              icon: <Globe size={24} />,
              title: '10+ Free Directories',
              desc: 'Direct submission links to Product Hunt, BetaList, SaaSHub, and more — curated for your product category.',
            },
            {
              icon: <CheckCircle2 size={24} />,
              title: 'Action Tracker',
              desc: 'Built-in checklist to track your progress. Mark items as done, skip, or save for later.',
            },
            {
              icon: <Briefcase size={24} />,
              title: 'Freelancer Mode',
              desc: 'Not just for apps — find where your potential clients hang out and how to reach them.',
            },
            {
              icon: <Clock size={24} />,
              title: 'Quick Wins',
              desc: 'Get 3-5 things you can do in the next 30 minutes to start distributing today.',
            },
          ].map((feature, i) => (
            <Card key={i} interactive>
              <CardBody>
                <div className={styles.featureCard__icon}>{feature.icon}</div>
                <h3 className={styles.featureCard__title}>{feature.title}</h3>
                <p className={styles.featureCard__desc}>{feature.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <h2 className={styles.pricing__title}>Simple pricing</h2>
        <div className={styles.pricing__grid}>
          <Card>
            <CardBody>
              <div className={styles.pricingCard}>
                <div className={styles.pricingCard__name}>Free</div>
                <div className={styles.pricingCard__price}>$0</div>
                <div className={styles.pricingCard__period}>forever</div>
                <ul className={styles.pricingCard__features}>
                  {[
                    '3 distribution plans per month',
                    'All 6 channels included',
                    'Ready-to-use templates',
                    'Action tracker',
                    'URL auto-reader',
                  ].map((f, i) => (
                    <li key={i} className={styles.pricingCard__feature}>
                      <Check size={16} className={styles.pricingCard__check} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant="secondary" fullWidth>Get Started</Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card glow bordered>
            <CardBody>
              <div className={styles.pricingCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <span className={styles.pricingCard__name}>Pro</span>
                  <Badge variant="accent">Popular</Badge>
                </div>
                <div className={styles.pricingCard__price}>
                  <span className="gradient-text">$9</span>
                </div>
                <div className={styles.pricingCard__period}>per month · or $79/year</div>
                <ul className={styles.pricingCard__features}>
                  {[
                    'Unlimited distribution plans',
                    'All 6 channels included',
                    'Ready-to-use templates',
                    'Action tracker',
                    'URL auto-reader',
                    'Plan versioning & history',
                    'Priority generation speed',
                  ].map((f, i) => (
                    <li key={i} className={styles.pricingCard__feature}>
                      <Check size={16} className={styles.pricingCard__check} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button fullWidth>Upgrade to Pro</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.cta__title}>
          Ready to stop guessing?
        </h2>
        <p className={styles.cta__subtitle}>
          Generate your first distribution plan in under 2 minutes. No credit card required.
        </p>
        <Link href="/signup">
          <Button size="lg" icon={<Zap size={18} />}>
            Generate Your Plan — Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} DevDistro. Built for indie developers and freelancers.</p>
      </footer>
    </div>
  );
}
