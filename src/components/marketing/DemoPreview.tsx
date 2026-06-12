'use client';

import React, { useState } from 'react';
import { Copy, Check, Zap, Globe, MessageSquare, Newspaper, Share2, Compass, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui';
import styles from './DemoPreview.module.css';

interface MockItem {
  id: string;
  title: string;
  audience_size: string;
  description: string;
  angle: string;
  template_title: string;
  template_body: string;
}

interface MockChannel {
  type: string;
  label: string;
  icon: React.ReactNode;
  items: MockItem[];
}

interface MockPlan {
  title: string;
  mode: 'app' | 'freelance';
  description: string;
  quickWin: string;
  channels: MockChannel[];
}

const DEVDISTRO_PLAN: MockPlan = {
  title: 'DevDistro (AI Distribution Planner)',
  mode: 'app',
  description: 'An AI-powered application that helps freelancers and indie hackers build tailored distribution lists, copy-paste templates, and track marketing actions in one place.',
  quickWin: 'Submit to 5 high-traffic developer directories to gain early high-authority backlinks within 24 hours.',
  channels: [
    {
      type: 'reddit',
      label: 'Reddit Communities',
      icon: <MessageSquare size={16} />,
      items: [
        {
          id: 'dd-r1',
          title: 'r/indiehackers',
          audience_size: '120k members',
          description: 'A community for developers and founders building profitable side-projects and businesses.',
          angle: 'Build-in-public post detailing how you automated your own tedious distribution planning work with AI.',
          template_title: 'Reddit Post - Build in Public Story',
          template_body: `Title: I got tired of spending 4 hours researching subreddits/directories for every launch, so I built an AI tool to do it in 20 seconds.

Hey everyone,

Like most devs here, I love building but absolutely dread marketing. Last week, I spent a whole evening listing down relevant directories, newsletters, and subreddits for my new project. It felt like a massive waste of dev time.

To solve this, I built a small wrapper that reads a landing page URL, extracts key details, and generates a structured marketing list with target subreddits, sizes, posting angles, and draft copy templates.

It runs on a free stack (Next.js, Supabase, Groq). Would love to get some feedback from fellow builders. Is automated distribution planning something you'd use, or do you prefer doing manual research?`
        },
        {
          id: 'dd-r2',
          title: 'r/SideProject',
          audience_size: '340k members',
          description: 'A platform for sharing side projects, receiving constructive feedback, and getting initial users.',
          angle: 'Showcase post focusing on the problem of "devs who hate marketing" and showing the tool in action.',
          template_title: 'Reddit Post - Showcase & Feedback Request',
          template_body: `Title: Show SideProject: An AI assistant that tells you exactly where to market your app (and drafts the copy for you)

Hi guys,

Most side projects die because developers build them, post once on Product Hunt, and then give up. Finding relevant subreddits, Facebook groups, and newsletters is tedious.

I built DevDistro to fix this. It scans your landing page and generates a complete checklist of target channels with audience size estimates, specific angles, and templates.

Here is a quick look at the stack: Next.js 15, Supabase, Groq API, and Vanilla CSS.

I'm offering it completely free right now. Let me know what you think, and if there are any specific channels (like Discord or Slack groups) I should add next!`
        }
      ]
    },
    {
      type: 'directories',
      label: 'Startup Directories',
      icon: <Globe size={16} />,
      items: [
        {
          id: 'dd-d1',
          title: 'Microlaunch.net',
          audience_size: '15k monthly visits',
          description: 'A directory dedicated to micro-startups, side projects, and small indie software tools.',
          angle: 'Submit with description emphasizing time saved for busy micro-founders.',
          template_title: 'Directory Submission - Short Pitch',
          template_body: `Tagline: Stop wasting hours on distribution. Let AI plan your launch.

Description: DevDistro helps indie builders and solo developers skip the tedious research phase of marketing. Just paste your landing page URL, and get a curated checklist of directories, subreddits, newsletters, and social channels tailored to your exact product, complete with pre-written templates and a tracker to monitor progress.`
        },
        {
          id: 'dd-d2',
          title: 'Kern.al',
          audience_size: '30k founders',
          description: 'A community platform to share startup ideas, build-in-public updates, and seek early signups.',
          angle: 'List as a build-in-public idea solving "The Marketing Tax" for developers.',
          template_title: 'Kern.al Idea Pitch',
          template_body: `Idea Title: DevDistro — The AI Marketing Copilot for Developers

The Problem: Solo founders are great at building but fail at distribution. They spend hours searching where to post, only to get banned for spamming the wrong subreddits.

The Solution: DevDistro analyzes your landing page to create a bespoke distribution blueprint. It finds where your audience hangs out, writes context-specific templates, and tracks your checklist progress.`
        }
      ]
    },
    {
      type: 'newsletters',
      label: 'Sponsorship & Placements',
      icon: <Newspaper size={16} />,
      items: [
        {
          id: 'dd-n1',
          title: 'Indie Bites Newsletter',
          audience_size: '8k subscribers',
          description: 'A weekly newsletter highlighting indie hackers building profitable side projects in short form.',
          angle: 'Pitch for founder interview or sponsor slot explaining how DevDistro saves 5+ hours of marketing setup.',
          template_title: 'Cold Outreach Pitch to Newsletter Author',
          template_body: `Subject: Quick idea for Indie Bites (marketing shortcut for developers)

Hey James,

Huge fan of Indie Bites. I loved your recent episode with the founder of FeedHive.

I built a free tool called DevDistro that helps developers find specific subreddits, directories, and outreach angles for their startups in seconds. Since your readers are indie builders looking to grow their apps, I thought they'd love this resource.

Would you be open to featuring a short spotlight or running a quick swap? I'd love to share a special guide or discount for your subscribers.

Thanks,
[Your Name]`
        }
      ]
    }
  ]
};

const DESIGNCRAFT_PLAN: MockPlan = {
  title: 'DesignCraft (Freelance Design Studio)',
  mode: 'freelance',
  description: 'Premium freelance web design and branding services tailored for B2B SaaS startups looking to double conversion.',
  quickWin: 'Post a design teardown on LinkedIn highlighting UX errors in popular B2B apps to drive inbound leads.',
  channels: [
    {
      type: 'linkedin',
      label: 'LinkedIn Professional',
      icon: <Share2 size={16} />,
      items: [
        {
          id: 'dc-l1',
          title: 'B2B SaaS Founder Network',
          audience_size: 'Startup Founders & VCs',
          description: 'Personal feed targeting B2B SaaS founders struggling with low conversion rates.',
          angle: 'Publish a UX visual teardown of a generic landing page compared to a high-converting version.',
          template_title: 'LinkedIn Post - Landing Page Teardown',
          template_body: `Most B2B SaaS landing pages make the exact same mistake.

They explain WHAT they built, instead of WHO it helps and HOW.

I did a quick design teardown of a typical startup homepage yesterday:
❌ Hero header: "The ultimate AI platform for business data" (Zero clarity)
❌ Three feature cards: "Analytics, Reports, Cloud sync" (Generic features)
❌ CTA: "Request a custom demo" (High friction)

Here is how I redesigned it to double conversions:
✅ Hero header: "Automatically sync your Snowflake data to Slack in 5 minutes" (Direct benefit)
✅ Social proof: "Trusted by 120+ teams" (Instant authority)
✅ CTA: "Try it free for 14 days — no credit card required" (Low friction)

A great design isn't just about pretty colors. It's about clear communication.

Is your landing page communicating, or just talking? DM me for a free 5-minute UX audit.`
        }
      ]
    },
    {
      type: 'directories',
      label: 'Freelance & Agency Portfolios',
      icon: <Compass size={16} />,
      items: [
        {
          id: 'dc-d1',
          title: 'Bento.me',
          audience_size: 'High design intent',
          description: 'A curated link-in-bio page popular among designers, startups, and creative services.',
          angle: 'A visual-first bio displaying case studies with clear business metrics (e.g. "Increased signups by 40%").',
          template_title: 'Bento.me Bio Configuration',
          template_body: `Bento Title: DesignCraft — Premium SaaS Design Studio

Bio: I design high-converting web apps and branding for B2B startups. 

Key Metrics Highlighted:
- 40% conversion rate increase for CloudMetrics
- Redesigned AuthFlow dashboard ($12M Series A)
- Modern, clean, fast-loading custom web design`
        }
      ]
    },
    {
      type: 'communities',
      label: 'Startup Groups',
      icon: <Globe size={16} />,
      items: [
        {
          id: 'dc-c1',
          title: 'Indie Hackers Design Group',
          audience_size: '45k users',
          description: 'A subgroup of Indie Hackers where founders ask design-related questions.',
          angle: 'Helpful reply or post offering free homepage layout reviews to build authority.',
          template_title: 'Indie Hackers Post - Free Design Reviews',
          template_body: `Subject: Reviewing 10 startup landing pages for free today (UX designer)

Hey guys,

I see a lot of great products on here that aren't getting signups simply because the homepage has high cognitive friction.

I run DesignCraft, and today I have a few hours to spare. Post your URL below, and I will write a quick bulleted review of:
1. First impression (clarity of copy)
2. Desktop/mobile visual layout
3. Call-to-Action placement

Just drop your link and a brief explanation of what your app does. No sales pitch, just honest feedback!`
        }
      ]
    }
  ]
};

export default function DemoPreview() {
  const [selectedPlan, setSelectedPlan] = useState<'devdistro' | 'designcraft'>('devdistro');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const plan = selectedPlan === 'devdistro' ? DEVDISTRO_PLAN : DESIGNCRAFT_PLAN;
  const channels = plan.channels;
  const activeChannel = channels[activeTab] || channels[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handlePlanChange = (type: 'devdistro' | 'designcraft') => {
    setSelectedPlan(type);
    setActiveTab(0);
  };

  return (
    <section className={styles.demoSection}>
      <h2 className={styles.sampleTitle}>
        See What <span className="gradient-text">DevDistro</span> Generates
      </h2>

      <div className={`${styles.demoContainer} glass`}>
        {/* Header toolbar */}
        <div className={styles.demoHeader}>
          <div className={styles.demoSelector}>
            <button
              onClick={() => handlePlanChange('devdistro')}
              className={`${styles.selectorBtn} ${selectedPlan === 'devdistro' ? styles.selectorBtnActive : ''}`}
            >
              🚀 SaaS Product (App)
            </button>
            <button
              onClick={() => handlePlanChange('designcraft')}
              className={`${styles.selectorBtn} ${selectedPlan === 'designcraft' ? styles.selectorBtnActive : ''}`}
            >
              💼 Freelancer Studio
            </button>
          </div>

          <div className={styles.demoMeta}>
            <Badge variant="accent">
              Mode: {plan.mode === 'app' ? 'App Launch' : 'Freelancer Outreach'}
            </Badge>
          </div>
        </div>

        {/* Content body */}
        <div className={styles.demoContent}>
          <div className={styles.productOverview}>
            <h3>{plan.title}</h3>
            <p>{plan.description}</p>
            <div className={styles.quickWins}>
              <AlertCircle size={16} />
              <span><strong>Quick Win:</strong> {plan.quickWin}</span>
            </div>
          </div>

          {/* Navigation channels */}
          <div className={styles.channelTabs}>
            {channels.map((ch, idx) => (
              <button
                key={ch.type}
                onClick={() => setActiveTab(idx)}
                className={`${styles.tabBtn} ${activeTab === idx ? styles.tabBtnActive : ''}`}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {ch.icon}
                  {ch.label}
                </span>
              </button>
            ))}
          </div>

          {/* Channel Content Pane */}
          <div className={styles.tabPane}>
            <div className={styles.itemsGrid}>
              {activeChannel.items.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemCardHeader}>
                    <div className={styles.itemTitle}>
                      <Zap size={14} style={{ color: 'var(--color-accent-primary)' }} />
                      {item.title}
                    </div>
                    <span className={styles.itemAudience}>{item.audience_size}</span>
                  </div>

                  <p className={styles.itemDesc}>{item.description}</p>

                  <div className={styles.itemAngle}>
                    <strong>Strategic Angle:</strong> {item.angle}
                  </div>

                  {/* Copyable template box */}
                  <div className={styles.templateBox}>
                    <div className={styles.templateHeader}>
                      <span className={styles.templateTitle}>{item.template_title}</span>
                      <button
                        onClick={() => handleCopy(item.template_body, item.id)}
                        className={`${styles.copyBtn} ${copiedId === item.id ? styles.copyBtnSuccess : ''}`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={12} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy Template
                          </>
                        )}
                      </button>
                    </div>
                    <pre className={styles.templateBody}>{item.template_body}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
