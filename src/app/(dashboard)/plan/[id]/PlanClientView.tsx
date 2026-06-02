'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy, Check, ExternalLink, Zap, ListChecks, Calendar,
  MessageCircle, Users, Send, Mail, Globe, Briefcase, Download, ChevronDown
} from 'lucide-react';
import { Button, Badge, Card, CardBody } from '@/components/ui';
import styles from './plan.module.css';

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  reddit: <MessageCircle size={16} />,
  facebook: <Users size={16} />,
  twitter: <Send size={16} />,
  newsletter: <Mail size={16} />,
  directory: <Globe size={16} />,
  linkedin: <Briefcase size={16} />,
};


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
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || 'reddit');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      projectTitle,
      projectMode,
      version,
      createdAt,
      tabs,
      quickWins,
      producthuntChecklist
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Channel', 'Title', 'Audience Size', 'URL', 'Angle', 'Description'];
    const rows = [];
    for (const tab of tabs) {
      for (const item of tab.items) {
        rows.push([
          tab.label,
          item.title || '',
          item.audience_size || '',
          item.url || '',
          item.angle || '',
          item.description || ''
        ]);
      }
    }
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_distribution_plan.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportMarkdown = () => {
    let md = `# Distribution Plan: ${projectTitle}\n\n`;
    md += `- **Mode**: ${projectMode === 'freelance' ? 'Freelancer outreach' : 'App launch'}\n`;
    md += `- **Version**: ${version}\n`;
    md += `- **Generated on**: ${new Date(createdAt).toLocaleDateString()}\n\n`;

    if (quickWins && quickWins.length > 0) {
      md += `## ⚡ Quick Wins\n\n`;
      quickWins.forEach((win, i) => {
        md += `${i + 1}. ${win}\n`;
      });
      md += `\n`;
    }

    if (producthuntChecklist && producthuntChecklist.length > 0) {
      const checklistTitle = projectMode === 'freelance' ? 'Client Acquisition Steps' : 'Product Hunt Checklist';
      md += `## 📋 ${checklistTitle}\n\n`;
      producthuntChecklist.forEach((step) => {
        md += `- [ ] ${step}\n`;
      });
      md += `\n`;
    }

    md += `## 🚀 Distribution Channels\n\n`;
    for (const tab of tabs) {
      md += `### ${tab.label} (${tab.count} target items)\n\n`;
      for (const item of tab.items) {
        md += `#### ${item.title}\n`;
        if (item.audience_size) md += `- **Audience Size**: ${item.audience_size}\n`;
        if (item.url) md += `- **Target URL**: ${item.url}\n`;
        if (item.angle) md += `- **Strategic Angle**: ${item.angle}\n`;
        if (item.description) md += `\n${item.description}\n`;
        if (item.template_title || item.template_body) {
          md += `\n**Template: ${item.template_title || 'Post Template'}**\n`;
          md += `\`\`\`text\n${item.template_body || ''}\n\`\`\`\n`;
        }
        md += `\n---\n\n`;
      }
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_distribution_plan.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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

      {/* Channel Tabs */}
      <div className={styles.tabs} role="tablist">
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

      {/* Channel Items */}
      <div className={styles.channelItems}>
        {activeItems.map((item, i) => (
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
                {item.audience_size && (
                  <span className={styles.itemCard__audience}>{item.audience_size}</span>
                )}
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
                        <><Copy size={12} /> Copy</>
                      )}
                    </button>
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
        ))}
      </div>

      {/* Quick Wins */}
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

      {/* Product Hunt Checklist */}
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
    </div>
  );
}
