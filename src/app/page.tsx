'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap, Target, MessageSquare, CheckCircle2, Globe, Clock,
  Briefcase, ArrowRight, Check, Star, TrendingUp, Users, FileText,
} from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import TypewriterHeading from '@/components/marketing/TypewriterHeading';
import OrbitingCircles from '@/components/marketing/OrbitingCircles';
import LogoTicker from '@/components/marketing/LogoTicker';
import styles from './(marketing)/landing.module.css';

/* ── Testimonials data ─────────────────────────────────────────── */
const testimonials = [
  {
    quote: "Generated a plan in 2 minutes that took me to the front page of r/SideProject. 340 upvotes and 12 signups in 24 hours.",
    author: "Alex K.",
    role: "Solo founder, Notion template creator",
    avatar: "AK",
    avatarColor: "#7B5EA7",
    stars: 5,
  },
  {
    quote: "I kept posting randomly and getting zero traction. DevDistro told me exactly which subreddits, what to say, and even gave me the templates. Game changer.",
    author: "Priya M.",
    role: "Indie developer, SaaS tool",
    avatar: "PM",
    avatarColor: "#0A66C2",
    stars: 5,
  },
  {
    quote: "As a freelancer, I never knew where to find clients online. Now I have a specific list of communities and exact messages that actually work.",
    author: "Daniel R.",
    role: "Freelance full-stack developer",
    avatar: "DR",
    avatarColor: "#DA552F",
    stars: 5,
  },
  {
    quote: "Submitted to 11 directories in one afternoon using the direct links DevDistro gave me. Already getting organic traffic from 4 of them.",
    author: "Sofia W.",
    role: "Founder, productivity app",
    avatar: "SW",
    avatarColor: "#1DA1F2",
    stars: 5,
  },
];

/* ── Stats data ────────────────────────────────────────────────── */
const stats = [
  { icon: <FileText size={20} />, value: "1,200+", label: "Plans Generated" },
  { icon: <Users size={20} />, value: "800+", label: "Founders Using It" },
  { icon: <TrendingUp size={20} />, value: "50+", label: "Distribution Channels" },
  { icon: <Globe size={20} />, value: "2 min", label: "Avg. Plan Time" },
];

export default function LandingPage() {
  const [typingDone, setTypingDone] = useState(false);

  return (
    <div className={styles.landing}>
      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <div className={styles.nav__inner}>
          <Link href="/" className={styles.nav__logo}>
            <div className={styles.nav__logoIcon}>
              <Zap size={18} />
            </div>
            <span className={styles.nav__logoText}>DevDistro</span>
          </Link>

          <div className={styles.nav__center}>
            <a href="#features" className={styles.nav__link}>Features</a>
            <a href="#pricing" className={styles.nav__link}>Pricing</a>
            <a href="#testimonials" className={styles.nav__link}>Reviews</a>
          </div>

          <div className={styles.nav__links}>
            <Link href="/login" className={styles.nav__loginLink}>
              Sign In
            </Link>
            <div className="btn-border-wrap">
              <Link href="/signup" className={styles.nav__cta}>
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.hero__left}>
          <div className={styles.hero__badge}>
            <Zap size={14} /> AI-Powered Distribution Plans
          </div>

          <TypewriterHeading
            text="Stop guessing where to distribute your product — Let AI do it for you"
            splitAt={38}
            speed={35}
            delay={400}
            onComplete={() => setTypingDone(true)}
          />

          <p className={styles.hero__subtitle}>
            Describe your app or service. Get a specific, actionable distribution plan
            with exact subreddits, groups, directories, and ready-to-use message templates.
          </p>

          {/* ── Social proof mini-bar ── */}
          <div className={styles.hero__proof}>
            <div className={styles.hero__proofAvatars}>
              {['AK','PM','DR','SW','TL'].map((initials, i) => (
                <div
                  key={i}
                  className={styles.hero__proofAvatar}
                  style={{ background: ['#7B5EA7','#0A66C2','#DA552F','#1DA1F2','#A068FF'][i] }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className={styles.hero__proofText}>
              <div className={styles.hero__proofStars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#FFB800" color="#FFB800" />)}
              </div>
              <span>Trusted by <strong>800+</strong> founders & developers</span>
            </div>
          </div>

          <div
            className={styles.hero__cta}
            style={{
              opacity: typingDone ? 1 : 0,
              transform: typingDone ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className="btn-border-wrap">
              <Link href="/signup" className={styles.hero__ctaBtn}>
                Generate Your Plan — Free
                <ArrowRight size={18} />
              </Link>
            </div>
            <Link href="#features" className={styles.nav__loginLink}>
              See How It Works
            </Link>
          </div>
        </div>

        <div className={styles.hero__right}>
          <OrbitingCircles />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className={styles.statsBar}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statItem__icon}>{stat.icon}</div>
            <div className={styles.statItem__value}>{stat.value}</div>
            <div className={styles.statItem__label}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── Logo Ticker ── */}
      <LogoTicker />

      {/* ── Features ── */}
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
              desc: 'Copy-paste message templates tailored to each community\'s tone and rules. No more staring at a blank screen.',
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

      {/* ── Testimonials ── */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.testimonials__header}>
          <h2 className={styles.testimonials__title}>Real results from real founders</h2>
          <p className={styles.testimonials__subtitle}>
            Join hundreds of indie developers and freelancers already getting traction.
          </p>
        </div>
        <div className={styles.testimonials__grid}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.testimonialCard__stars}>
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} size={14} fill="#FFB800" color="#FFB800" />
                ))}
              </div>
              <p className={styles.testimonialCard__quote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.testimonialCard__author}>
                <div
                  className={styles.testimonialCard__avatar}
                  style={{ background: t.avatarColor }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className={styles.testimonialCard__name}>{t.author}</div>
                  <div className={styles.testimonialCard__role}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
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
                <Link href="/signup" style={{ display: 'block' }}>
                  <button
                    className={styles.nav__cta}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid rgba(160, 104, 255, 0.3)',
                    }}
                  >
                    Get Started
                  </button>
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
                <div className="btn-border-wrap" style={{ width: '100%', display: 'block' }}>
                  <Link href="/signup" style={{ display: 'block' }}>
                    <button className={styles.hero__ctaBtn} style={{ width: '100%' }}>
                      Upgrade to Pro
                    </button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <h2 className={styles.cta__title}>Ready to stop guessing?</h2>
        <p className={styles.cta__subtitle}>
          Generate your first distribution plan in under 2 minutes. No credit card required.
        </p>
        <div className="btn-border-wrap">
          <Link href="/signup" className={styles.hero__ctaBtn}>
            <Zap size={18} />
            Generate Your Plan — Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} DevDistro. Built for indie developers and freelancers.</p>
      </footer>
    </div>
  );
}
