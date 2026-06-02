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

      {/* Hero */}
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
