'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, ArrowLeft, SkipForward, Bookmark, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button, Badge, Card, Modal, Input } from '@/components/ui';
import { CHANNEL_LABELS } from '@/lib/utils/constants';
import styles from './track.module.css';

interface TrackerItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  audience_size: string | null;
  status: string;
  channel_type: string;
  channel_id: string;
}

interface ChannelInfo {
  id: string;
  channel_type: string;
}

interface TrackerClientViewProps {
  planId: string;
  projectTitle: string;
  items: TrackerItem[];
  channels: ChannelInfo[];
}

type FilterType = 'all' | 'pending' | 'done' | 'skipped' | 'saved';

export default function TrackerClientView({ planId, projectTitle, items: initialItems, channels: initialChannels }: TrackerClientViewProps) {
  const [items, setItems] = useState(initialItems);
  const [channels, setChannels] = useState(initialChannels);
  const [filter, setFilter] = useState<FilterType>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [, startTransition] = useTransition();

  // Modal states
  const [addItemModal, setAddItemModal] = useState<{ open: boolean; channelId: string; channelType: string }>({
    open: false, channelId: '', channelType: ''
  });
  const [addChannelModal, setAddChannelModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [saving, setSaving] = useState(false);

  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'done').length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Get unique channel types
  const channelTypes = [...new Set(items.map(i => i.channel_type))];

  // Filter items
  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (channelFilter !== 'all' && item.channel_type !== channelFilter) return false;
    return true;
  });

  // Group by channel
  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.channel_type]) acc[item.channel_type] = [];
    acc[item.channel_type].push(item);
    return acc;
  }, {} as Record<string, TrackerItem[]>);

  const updateStatus = async (itemId: string, newStatus: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus } : item
    ));

    startTransition(async () => {
      try {
        await fetch('/api/actions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, status: newStatus }),
        });
      } catch {
        setItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, status: items.find(i => i.id === itemId)?.status || 'pending' } : item
        ));
      }
    });
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: addItemModal.channelId,
          planId,
          title: newItemTitle.trim(),
          description: newItemDesc.trim() || undefined,
          url: newItemUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.item) {
        setItems(prev => [...prev, {
          ...data.item,
          audience_size: null,
          channel_type: addItemModal.channelType,
          channel_id: addItemModal.channelId,
        }]);
      }

      // Reset form
      setNewItemTitle('');
      setNewItemDesc('');
      setNewItemUrl('');
      setAddItemModal({ open: false, channelId: '', channelType: '' });
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const previous = items;
    setItems(prev => prev.filter(i => i.id !== itemId));

    try {
      const res = await fetch('/api/actions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
    } catch {
      setItems(previous); // Revert
    }
  };

  const handleAddChannel = async () => {
    if (!newChannelName.trim() || saving) return;
    setSaving(true);

    const channelType = newChannelName.trim().toLowerCase().replace(/\s+/g, '_');

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, channelType }),
      });

      const data = await res.json();
      if (data.success && data.channel) {
        setChannels(prev => [...prev, {
          id: data.channel.id,
          channel_type: data.channel.channel_type,
        }]);
      }

      setNewChannelName('');
      setAddChannelModal(false);
    } catch (err) {
      console.error('Failed to add channel:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    const prevChannels = channels;
    const prevItems = items;
    setChannels(prev => prev.filter(c => c.id !== channelId));
    setItems(prev => prev.filter(i => i.channel_id !== channelId));

    try {
      const res = await fetch('/api/channels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, planId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
    } catch {
      setChannels(prevChannels);
      setItems(prevItems);
    }
  };

  return (
    <div className={styles.tracker}>
      {/* Header */}
      <div className={styles.tracker__header}>
        <div>
          <Link href={`/plan/${planId}`}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
              Back to Plan
            </Button>
          </Link>
          <h1 className={styles.tracker__title}>{projectTitle}</h1>
          <p className={styles.tracker__subtitle}>Track your distribution progress</p>
        </div>
      </div>

      {/* Progress */}
      <Card className={styles.tracker__progress}>
        <div className={styles.tracker__progressHeader}>
          <span className={styles.tracker__progressLabel}>
            Overall Progress
          </span>
          <span className={styles.tracker__progressCount}>
            {completedItems} of {totalItems} completed ({progress}%)
          </span>
        </div>
        <div className={styles.tracker__progressBar}>
          <div className={styles.tracker__progressFill} style={{ width: `${progress}%` }} />
        </div>
      </Card>

      {/* Filters */}
      <div className={styles.tracker__filters}>
        {(['all', 'pending', 'done', 'skipped', 'saved'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles['filterBtn--active'] : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && ` (${items.filter(i => i.status === f).length})`}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 var(--space-2)' }} />
        <button
          className={`${styles.filterBtn} ${channelFilter === 'all' ? styles['filterBtn--active'] : ''}`}
          onClick={() => setChannelFilter('all')}
        >
          All Channels
        </button>
        {channelTypes.map(ct => (
          <button
            key={ct}
            className={`${styles.filterBtn} ${channelFilter === ct ? styles['filterBtn--active'] : ''}`}
            onClick={() => setChannelFilter(ct)}
          >
            {CHANNEL_LABELS[ct] || ct}
          </button>
        ))}
        <button
          className={styles.addChannelBtn}
          onClick={() => setAddChannelModal(true)}
          title="Add custom channel"
        >
          <Plus size={14} /> Channel
        </button>
      </div>

      {/* Checklist */}
      {Object.entries(grouped).map(([channelType, channelItems]) => {
        const channel = channels.find(c => c.channel_type === channelType);
        return (
          <div key={channelType} className={styles.checklistGroup}>
            <div className={styles.checklistGroup__header}>
              <h3 className={styles.checklistGroup__title}>
                {CHANNEL_LABELS[channelType] || channelType}
                <Badge variant="default">{channelItems.length}</Badge>
              </h3>
              <div className={styles.checklistGroup__actions}>
                {channel && (
                  <button
                    className={styles.checklistGroup__addBtn}
                    onClick={() => setAddItemModal({ open: true, channelId: channel.id, channelType })}
                    title="Add item to this channel"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                )}
              </div>
            </div>
            {channelItems.map(item => (
              <div
                key={item.id}
                className={`${styles.checkItem} ${item.status === 'done' ? styles['checkItem--done'] : ''}`}
              >
                <button
                  className={`${styles.checkItem__checkbox} ${item.status === 'done' ? styles['checkItem__checkbox--checked'] : ''}`}
                  onClick={() => updateStatus(item.id, item.status === 'done' ? 'pending' : 'done')}
                  aria-label={item.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                >
                  {item.status === 'done' && <Check size={14} />}
                </button>
                <div className={styles.checkItem__content}>
                  <div className={styles.checkItem__title}>
                    {item.title}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6 }}>
                        <ExternalLink size={12} style={{ verticalAlign: 'middle', opacity: 0.5 }} />
                      </a>
                    )}
                  </div>
                  {item.audience_size && (
                    <div className={styles.checkItem__meta}>{item.audience_size}</div>
                  )}
                </div>
                <div className={styles.checkItem__actions}>
                  <button
                    className={styles.checkItem__actionBtn}
                    onClick={() => updateStatus(item.id, 'skipped')}
                    title="Skip"
                  >
                    <SkipForward size={14} />
                  </button>
                  <button
                    className={styles.checkItem__actionBtn}
                    onClick={() => updateStatus(item.id, 'saved')}
                    title="Save for later"
                  >
                    <Bookmark size={14} />
                  </button>
                  <button
                    className={styles.checkItem__actionBtn}
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Empty channels (no items yet) */}
      {channels
        .filter(c => !grouped[c.channel_type])
        .filter(() => channelFilter === 'all')
        .map(channel => (
          <div key={channel.id} className={styles.checklistGroup}>
            <div className={styles.checklistGroup__header}>
              <h3 className={styles.checklistGroup__title}>
                {CHANNEL_LABELS[channel.channel_type] || channel.channel_type}
                <Badge variant="default">0</Badge>
              </h3>
              <div className={styles.checklistGroup__actions}>
                <button
                  className={styles.checklistGroup__addBtn}
                  onClick={() => setAddItemModal({ open: true, channelId: channel.id, channelType: channel.channel_type })}
                  title="Add item to this channel"
                >
                  <Plus size={14} /> Add Item
                </button>
                <button
                  className={styles.checklistGroup__deleteBtn}
                  onClick={() => handleDeleteChannel(channel.id)}
                  title="Delete this channel"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No items yet. Click &quot;Add Item&quot; to get started.
            </div>
          </div>
        ))}

      {filteredItems.length === 0 && channels.filter(c => !grouped[c.channel_type]).length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--color-text-muted)' }}>
          No items match your current filters.
        </div>
      )}

      {/* Add Item Modal */}
      <Modal
        open={addItemModal.open}
        onClose={() => { setAddItemModal({ open: false, channelId: '', channelType: '' }); setNewItemTitle(''); setNewItemDesc(''); setNewItemUrl(''); }}
        title={`Add Item — ${CHANNEL_LABELS[addItemModal.channelType] || addItemModal.channelType}`}
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setAddItemModal({ open: false, channelId: '', channelType: '' })}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} loading={saving} icon={<Plus size={16} />}>
              Add Item
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Title"
            placeholder="e.g., r/webdev, ProductHunt, My Blog"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            required
          />
          <Input
            label="Description (optional)"
            placeholder="What this channel is about"
            value={newItemDesc}
            onChange={(e) => setNewItemDesc(e.target.value)}
          />
          <Input
            label="URL (optional)"
            placeholder="https://..."
            value={newItemUrl}
            onChange={(e) => setNewItemUrl(e.target.value)}
          />
        </div>
      </Modal>

      {/* Add Channel Modal */}
      <Modal
        open={addChannelModal}
        onClose={() => { setAddChannelModal(false); setNewChannelName(''); }}
        title="Add Custom Channel"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setAddChannelModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChannel} loading={saving} icon={<Plus size={16} />}>
              Add Channel
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Channel Name"
            placeholder="e.g., Hacker News, Discord, Indie Hackers"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            required
          />
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Add a custom distribution channel to track. You can then add individual action items to it.
          </p>
        </div>
      </Modal>
    </div>
  );
}
