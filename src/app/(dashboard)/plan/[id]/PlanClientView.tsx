'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy, Check, ExternalLink, Zap, ListChecks, Calendar,
  MessageCircle, Users, Send, Mail, Globe, Briefcase, Download,
  ChevronDown, LayoutDashboard, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { Button, Badge, Card, CardBody } from '@/components/ui';
import styles from './plan.module.css';

/* ── Channel meta ─────────────────────────────────────────────── */
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  reddit:     <MessageCircle size={16} />,
  facebook:   <Users size={16} />,
  twitter:    <Send size={16} />,
  newsletter: <Mail size={16} />,
  directory:  <Globe size={16} />,
  linkedin:   <Briefcase size={16} />,
};

const CHANNEL_COLOR: Record<string, string> = {
  reddit:     '#FF4500',
  facebook:   '#1877F2',
  twitter:    '#1DA1F2',
  newsletter: '#7B5EA7',
  directory:  '#A068FF',
  linkedin:   '#0A66C2',
};

/* ── Deep-link helpers ─────────────────────────────────────────── */
function getDeepLink(channelKey: string, item: PlanItem): string | null {
  if (item.url) return item.url;
  switch (channelKey) {
    case 'reddit':     return 'https://reddit.com/submit';
    case 'facebook':   return 'https://www.facebook.com/groups/';
    case 'twitter':    return 'https://twitter.com/compose/tweet';
    case 'linkedin':   return 'https://www.linkedin.com/feed/';
    case 'newsletter': return null;
    default:           return null;
  }
}

function getDeepLinkLabel(channelKey: string): string {
  switch (channelKey) {
    case 'reddit':     return 'Open & Post';
    case 'facebook':   return 'Open Group';
    case 'twitter':    return 'Compose Tweet';
    case 'linkedin':   return 'Open LinkedIn';
    case 'directory':  return 'Submit Now';
    case 'newsletter': return 'Open Pitch';
    default:           return 'Open';
  }
}

/* ── Types ─────────────────────────────────────────────────────── */
interface PlanItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  audience_size: string | null;
  angle: string | null;
  template_title: string | null;
  template_body: string | null;
  status: string;
}

interface TabData {
  key: string;
  label: string;
  count: number;
  items: PlanItem[];
}

interface PlanClientViewProps {
  planId: string;
  projectTitle: string;
  projectMode: string;
  version: number;
  createdAt: string;
  tabs: TabData[];
  quickWins: string[];
  producthuntChecklist: string[];
}

/* ── Overview stat card ─────────────────────────────────────────── */
function OverviewStatCard({ tab }: { tab: TabData }) {
  const color = CHANNEL_COLOR[tab.key] || '#A068FF';
  return (
    <div className={styles.overviewCard} style={{ borderTopColor: color }}>
      <div className={styles.overviewCard__icon} style={{ color }}>
        {CHANNEL_ICONS[tab.key]}
      </div>
      <div className={styles.overviewCard__count}>{tab.count}</div>
      <div className={styles.overviewCard__label}>{tab.label}</div>
      <div className={styles.overviewCard__sub}>opportunities</div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function PlanClientView({
  planId,
  projectTitle,
  projectMode,
  version,
  createdAt,
  tabs,
  quickWins,
  producthuntChecklist,
}: PlanClientViewProps) {
  // Default to overview tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── Export helpers (unchanged) ── */
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      projectTitle, projectMode, version, createdAt, tabs, quickWins, producthuntChecklist
    }, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_plan.json`);
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Channel', 'Title', 'Audience Size', 'URL', 'Angle', 'Description'];
    const rows: string[][] = [];
    for (const tab of tabs) {
      for (const item of tab.items) {
        rows.push([tab.label, item.title || '', item.audience_size || '', item.url || '', item.angle || '', item.description || '']);
      }
    }
    const csv = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    const a = document.createElement("a");
    a.setAttribute("href", encodeURI(csv));
    a.setAttribute("download", `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_distribution_plan.csv`);
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleExportMarkdown = () => {
    let md = `# Distribution Plan: ${projectTitle}\n\n`;
    md += `- **Mode**: ${projectMode === 'freelance' ? 'Freelancer outreach' : 'App launch'}\n`;
    md += `- **Version**: ${version}\n`;
    md += `- **Generated on**: ${new Date(createdAt).toLocaleDateString()}\n\n`;
    if (quickWins?.length) { md += `## ⚡ Quick Wins\n\n`; quickWins.forEach((w,i) => { md += `${i+1}. ${w}\n`; }); md += '\n'; }
    if (producthuntChecklist?.length) {
      md += `## 📋 ${projectMode === 'freelance' ? 'Client Acquisition Steps' : 'Product Hunt Checklist'}\n\n`;
      producthuntChecklist.forEach(s => { md += `- [ ] ${s}\n`; }); md += '\n';
    }
    md += `## 🚀 Distribution Channels\n\n`;
    for (const tab of tabs) {
      md += `### ${tab.label} (${tab.count} targets)\n\n`;
      for (const item of tab.items) {
        md += `#### ${item.title}\n`;
        if (item.audience_size) md += `- **Audience**: ${item.audience_size}\n`;
        if (item.url) md += `- **URL**: ${item.url}\n`;
        if (item.angle) md += `- **Angle**: ${item.angle}\n`;
        if (item.description) md += `\n${item.description}\n`;
        if (item.template_title || item.template_body) {
          md += `\n**Template: ${item.template_title || 'Post Template'}**\n`;
          md += `\`\`\`text\n${item.template_body || ''}\n\`\`\`\n`;
        }
        md += `\n---\n\n`;
      }
    }
    const a = document.createElement('a');
    a.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(md));
    a.setAttribute("download", `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_plan.md`);
    document.body.appendChild(a); a.click(); a.remove();
  };

  /* ── Total count ── */
  const totalOpportunities = tabs.reduce((sum, t) => sum + t.count, 0);

  const activeItems = tabs.find(t => t.key === activeTab)?.items || [];

  return (
    <div className={styles.planPage}>
      {/* Header */}
      <div className={styles.planPage__header}>
        <div className={styles.planPage__headerLeft}>
          <h1 className={styles.planPage__title}>{projectTitle}</h1>
          <div className={styles.planPage__meta}>
            <Badge variant={projectMode === 'freelance' ? 'accent' : 'info'}>
              {projectMode === 'freelance' ? 'Freelancer' : 'App'}
            </Badge>
            <span>Version {version}</span>
            <span>
              <Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            <span className={styles.planPage__total}>
              <TrendingUp size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {totalOpportunities} total opportunities
            </span>
          </div>
        </div>
        <div className={styles.planPage__actions}>
          <div className={styles.exportDropdown}>
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={() => setExportOpen(!exportOpen)}
            >
              Export <ChevronDown size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
            </Button>
            {exportOpen && (
              <div className={styles.exportMenu}>
                <button className={styles.exportItem} onClick={() => { handleExportMarkdown(); setExportOpen(false); }}>
                  Markdown (.md)
                </button>
                <button className={styles.exportItem} onClick={() => { handleExportCSV(); setExportOpen(false); }}>
                  CSV (.csv)
                </button>
                <button className={styles.exportItem} onClick={() => { handleExportJSON(); setExportOpen(false); }}>
                  JSON (.json)
                </button>
              </div>
            )}
          </div>
          <Link href={`/plan/${planId}/track`}>
            <Button icon={<ListChecks size={16} />}>
              Track Actions
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs — Overview first, then channel tabs */}
      <div className={styles.tabs} role="tablist">
        {/* Overview tab */}
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles['tab--active'] : ''}`}
          onClick={() => setActiveTab('overview')}
          role="tab"
          aria-selected={activeTab === 'overview'}
        >
          <LayoutDashboard size={16} />
          Overview
          <span className={styles.tab__count}>{totalOpportunities}</span>
        </button>

        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles['tab--active'] : ''}`}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
          >
            {CHANNEL_ICONS[tab.key]}
            {tab.label}
            <span className={styles.tab__count}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Overview Panel */}
      {activeTab === 'overview' && (
        <div className={styles.overview}>
          {/* Stats grid */}
          <div className={styles.overview__statsGrid}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={styles.overviewCard}
                style={{ borderTopColor: CHANNEL_COLOR[tab.key] || '#A068FF' }}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className={styles.overviewCard__icon} style={{ color: CHANNEL_COLOR[tab.key] }}>
                  {CHANNEL_ICONS[tab.key]}
                </div>
                <div className={styles.overviewCard__count}>{tab.count}</div>
                <div className={styles.overviewCard__label}>{tab.label}</div>
                <div className={styles.overviewCard__sub}>
                  Click to explore <ArrowUpRight size={11} style={{ verticalAlign: 'middle' }} />
                </div>
              </button>
            ))}
          </div>

          {/* Quick wins inline on overview */}
          {quickWins.length > 0 && (
            <div className={styles.quickWins} style={{ marginTop: 'var(--space-8)' }}>
              <h2 className={styles.quickWins__title}>
                <Zap size={20} /> Do These Right Now (30-min wins)
              </h2>
              <ul className={styles.quickWins__list}>
                {quickWins.map((win, i) => (
                  <li key={i} className={styles.quickWins__item}>
                    <span className={styles.quickWins__bullet}>{i + 1}</span>
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PH checklist inline on overview */}
          {producthuntChecklist.length > 0 && (
            <div className={styles.quickWins} style={{ marginTop: 'var(--space-6)' }}>
              <h2 className={styles.quickWins__title}>
                <ListChecks size={20} />
                {projectMode === 'freelance' ? 'Client Acquisition Steps' : 'Product Hunt Launch Checklist'}
              </h2>
              <ul className={styles.quickWins__list}>
                {producthuntChecklist.map((step, i) => (
                  <li key={i} className={styles.quickWins__item}>
                    <span className={styles.quickWins__bullet}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Channel Items Panel */}
      {activeTab !== 'overview' && (
        <>
          <div className={styles.channelItems}>
            {activeItems.map((item, i) => {
              const deepLink = getDeepLink(activeTab, item);
              const linkLabel = getDeepLinkLabel(activeTab);

              return (
                <Card key={item.id} className={`${styles.itemCard} animate-fadeInUp stagger-${Math.min(i + 1, 6)}`}>
                  <CardBody>
                    <div className={styles.itemCard__header}>
                      <h3 className={styles.itemCard__title}>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.itemCard__titleLink}
                          >
                            {item.title}
                            <ExternalLink size={14} style={{ marginLeft: 6, verticalAlign: 'middle', opacity: 0.5 }} />
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <div className={styles.itemCard__actions}>
                        {item.audience_size && (
                          <span className={styles.itemCard__audience}>{item.audience_size}</span>
                        )}
                        {deepLink && (
                          <a
                            href={deepLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.itemCard__deepLink}
                          >
                            {linkLabel} <ArrowUpRight size={13} style={{ verticalAlign: 'middle' }} />
                          </a>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className={styles.itemCard__desc}>{item.description}</p>
                    )}

                    {item.angle && (
                      <div className={styles.itemCard__angle}>
                        <strong>Angle:</strong> {item.angle}
                      </div>
                    )}

                    {(item.template_title || item.template_body) && (
                      <div className={styles.template}>
                        <div className={styles.template__header}>
                          <span className={styles.template__label}>Ready-to-use Template</span>
                          <div className={styles.template__headerActions}>
                            {deepLink && (
                              <a
                                href={deepLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.template__openBtn}
                              >
                                Open {activeTab === 'reddit' ? 'Reddit' : activeTab === 'twitter' ? 'X' : activeTab === 'linkedin' ? 'LinkedIn' : 'Platform'}
                                <ArrowUpRight size={12} style={{ verticalAlign: 'middle', marginLeft: 3 }} />
                              </a>
                            )}
                            <button
                              className={styles.template__copy}
                              onClick={() => handleCopy(
                                `${item.template_title || ''}\n\n${item.template_body || ''}`.trim(),
                                item.id
                              )}
                            >
                              {copiedId === item.id ? (
                                <><Check size={12} /> Copied!</>
                              ) : (
                                <><Copy size={12} /> Copy All</>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className={styles.template__body}>
                          {item.template_title && (
                            <div className={styles.template__title}>{item.template_title}</div>
                          )}
                          {item.template_body && (
                            <div className={styles.template__text}>{item.template_body}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Quick wins at bottom of each channel tab too */}
          {quickWins.length > 0 && (
            <div className={styles.quickWins}>
              <h2 className={styles.quickWins__title}>
                <Zap size={20} /> Quick Wins (Do These Now)
              </h2>
              <ul className={styles.quickWins__list}>
                {quickWins.map((win, i) => (
                  <li key={i} className={styles.quickWins__item}>
                    <span className={styles.quickWins__bullet}>{i + 1}</span>
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {producthuntChecklist.length > 0 && (
            <div className={styles.quickWins} style={{ marginTop: 'var(--space-6)' }}>
              <h2 className={styles.quickWins__title}>
                <ListChecks size={20} />
                {projectMode === 'freelance' ? 'Client Acquisition Steps' : 'Product Hunt Checklist'}
              </h2>
              <ul className={styles.quickWins__list}>
                {producthuntChecklist.map((step, i) => (
                  <li key={i} className={styles.quickWins__item}>
                    <span className={styles.quickWins__bullet}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
