'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Globe, Briefcase, Rocket, Loader2, Link2, Eye, EyeOff, Edit3 } from 'lucide-react';
import { Button, Input, Textarea, Card, CardBody } from '@/components/ui';
import type { ProjectMode } from '@/types';
import styles from './new.module.css';

export default function NewPlanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ProjectMode>('app');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [landingUrl, setLandingUrl] = useState('');
  const [urlData, setUrlData] = useState<{ title: string; description: string; content: string } | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [error, setError] = useState('');
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [scrapedContent, setScrapedContent] = useState('');
  const [showScrapedContent, setShowScrapedContent] = useState(false);
  const [editingScraped, setEditingScraped] = useState(false);

  const handleUrlRead = useCallback(async () => {
    if (!landingUrl || urlLoading) return;
    setUrlLoading(true);
    setUrlData(null);

    try {
      const res = await fetch('/api/read-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: landingUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setUrlData(data);
        setScrapedContent(data.content || '');
        setShowScrapedContent(true);
        // Auto-fill description if empty
        if (!description && data.description) {
          setDescription(data.description);
        }
        if (!title && data.title) {
          setTitle(data.title);
        }
      }
    } catch {
      // Silently fail — URL reading is optional
    } finally {
      setUrlLoading(false);
    }
  }, [landingUrl, urlLoading, description, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPaymentRequired(false);
    setGenerating(true);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          targetAudience,
          landingUrl: landingUrl || undefined,
          mode,
          customScrapedContent: scrapedContent || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to generate plan. Please try again.');
        if (res.status === 402) {
          setIsPaymentRequired(true);
        }
        setGenerating(false);
        return;
      }

      const data = await res.json();
      router.push(`/plan/${data.planId}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setGenerating(false);
    }
  };

  // Advance step indicators while generating
  useEffect(() => {
    if (!generating) { setGeneratingStep(0); return; }
    const timings = [2000, 5000, 9000]; // ms after start to advance each step
    const timers = timings.map((delay, i) =>
      setTimeout(() => setGeneratingStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [generating]);

  if (generating) {
    const steps = [
      { emoji: '⚡', label: 'Analyzing your project...' },
      { emoji: '🔍', label: 'Scanning 50+ distribution channels...' },
      { emoji: '✍️', label: 'Writing custom templates...' },
      { emoji: '🎯', label: 'Finalizing your strategy...' },
    ];
    return (
      <div className={styles.genScreen}>
        <div className={styles.genScreen__ambient} />
        {/* Pulsing orb */}
        <div className={styles.genOrb}>
          <div className={styles.genOrb__ring1} />
          <div className={styles.genOrb__ring2} />
          <div className={styles.genOrb__ring3} />
          <div className={styles.genOrb__core} />
        </div>
        {/* Steps */}
        <div className={styles.genSteps}>
          {steps.map((step, i) => {
            const done = i < generatingStep;
            const active = i === generatingStep;
            const pending = i > generatingStep;
            return (
              <div
                key={i}
                className={[
                  styles.genStep,
                  done ? styles['genStep--done'] : '',
                  active ? styles['genStep--active'] : '',
                  pending ? styles['genStep--pending'] : '',
                ].join(' ')}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={styles.genStep__icon}>
                  {done && <span className={styles.genStep__check}>✓</span>}
                  {active && <span className={styles.genStep__spinner} />}
                  {pending && <span className={styles.genStep__dot} />}
                </div>
                <span className={styles.genStep__emoji}>{step.emoji}</span>
                <span className={styles.genStep__label}>{step.label}</span>
              </div>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className={styles.genProgress}>
          <div className={styles.genProgress__bar} />
        </div>
        <span className={styles.genScreen__hint}>Usually takes 10–20 seconds</span>
      </div>
    );
  }

  return (
    <div className={styles.newPlan}>
      <div className={styles.newPlan__header}>
        <h1 className={styles.newPlan__title}>
          Create a Distribution Plan
        </h1>
        <p className={styles.newPlan__subtitle}>
          Describe your project and we&apos;ll generate a specific, actionable distribution strategy.
        </p>
      </div>

      <div className={styles.newPlan__form}>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className={styles.newPlan__formInner}>
              {error && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-error-bg)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-error)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}>
                  <span>{error}</span>
                  {isPaymentRequired && (
                    <Link href="/settings">
                      <Button variant="accent" size="sm" style={{ width: 'fit-content' }}>
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Mode Toggle */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}>
                  What are you distributing?
                </label>
                <div className={styles.modeToggle}>
                  <button
                    type="button"
                    className={`${styles.modeToggle__option} ${mode === 'app' ? styles['modeToggle__option--active'] : ''}`}
                    onClick={() => setMode('app')}
                  >
                    <Rocket size={16} /> App / Product
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeToggle__option} ${mode === 'freelance' ? styles['modeToggle__option--active'] : ''}`}
                    onClick={() => setMode('freelance')}
                  >
                    <Briefcase size={16} /> Freelance Service
                  </button>
                </div>
              </div>

              <Input
                label={mode === 'app' ? 'Project Name' : 'Your Service'}
                placeholder={mode === 'app' ? 'e.g., DevDistro' : 'e.g., Full-stack Web Development'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Textarea
                label={mode === 'app' ? 'What does it do? Who is it for?' : 'Describe your services and expertise'}
                placeholder={
                  mode === 'app'
                    ? 'e.g., DevDistro generates specific, actionable distribution plans for indie developers. It tells you exactly where to post, what to say, and gives you ready-to-use templates.'
                    : 'e.g., I build custom web applications for small businesses using React and Node.js. I specialize in e-commerce and SaaS platforms.'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                hint="Be specific — the more detail, the better your plan."
              />

              <Input
                label="Target Audience"
                placeholder={
                  mode === 'app'
                    ? 'e.g., Indie hackers, solopreneurs, freelance developers'
                    : 'e.g., Small business owners in retail, e-commerce startups'
                }
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
              />

              <Input
                label="Landing Page URL"
                placeholder="https://your-site.com"
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                hint="Optional — we'll read your page to improve the plan"
                icon={<Link2 size={16} />}
                action={
                  landingUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUrlRead}
                      loading={urlLoading}
                    >
                      <Globe size={14} /> Read
                    </Button>
                  )
                }
              />

              {urlLoading && (
                <div className={styles.urlPreview}>
                  <div className={styles.urlPreview__loading}>
                    <Loader2 size={16} className="animate-spin" /> Reading your page...
                  </div>
                </div>
              )}

              {urlData && (
                <div className={styles.urlPreview}>
                  <div className={styles.urlPreview__header}>
                    <div>
                      <div className={styles.urlPreview__title}>{urlData.title}</div>
                      <div className={styles.urlPreview__desc}>{urlData.description}</div>
                    </div>
                    <div className={styles.urlPreview__actions}>
                      <button
                        type="button"
                        className={styles.urlPreview__toggleBtn}
                        onClick={() => setShowScrapedContent(!showScrapedContent)}
                        title={showScrapedContent ? 'Hide scraped content' : 'Show scraped content'}
                      >
                        {showScrapedContent ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showScrapedContent ? 'Hide' : 'Preview'}
                      </button>
                      {showScrapedContent && (
                        <button
                          type="button"
                          className={styles.urlPreview__toggleBtn}
                          onClick={() => setEditingScraped(!editingScraped)}
                          title={editingScraped ? 'Lock editing' : 'Edit scraped content'}
                        >
                          <Edit3 size={14} />
                          {editingScraped ? 'Lock' : 'Edit'}
                        </button>
                      )}
                    </div>
                  </div>

                  {showScrapedContent && (
                    <div className={styles.scrapedContent}>
                      <label className={styles.scrapedContent__label}>
                        Scraped Page Content — This is what the AI will read
                      </label>
                      {editingScraped ? (
                        <textarea
                          className={styles.scrapedContent__editor}
                          value={scrapedContent}
                          onChange={(e) => setScrapedContent(e.target.value)}
                          rows={10}
                        />
                      ) : (
                        <div className={styles.scrapedContent__preview}>
                          {scrapedContent
                            ? scrapedContent.slice(0, 2000) + (scrapedContent.length > 2000 ? '…' : '')
                            : 'No content was extracted. The page might be JavaScript-rendered.'}
                        </div>
                      )}
                      <div className={styles.scrapedContent__hint}>
                        {scrapedContent.length.toLocaleString()} characters extracted.
                        {editingScraped && ' Edit freely — this will be sent to the AI instead of re-scraping.'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.newPlan__submit}>
                <Button type="submit" size="lg" icon={<Zap size={18} />}>
                  Generate Plan
                </Button>
                <span className={styles.newPlan__submitHint}>
                  Takes ~15 seconds
                </span>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
