import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TrackerClientView from './TrackerClientView';

export async function generateMetadata() {
  return {
    title: 'Action Tracker — DevDistro',
    description: 'Track your distribution plan progress.',
  };
}

export default async function TrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch plan items with channel info
  const { data: plan } = await supabase
    .from('plans')
    .select(`
      id,
      projects(title),
      plan_channels(
        id,
        channel_type,
        plan_items(id, title, description, url, audience_size, status)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!plan) notFound();

  const rawProjects = plan.projects;
  const projectObj = Array.isArray(rawProjects) ? rawProjects[0] : rawProjects;
  const projectTitle = (projectObj as { title: string } | null)?.title || 'Plan';

  // Build channels list with IDs
  const channels = (plan.plan_channels || []).map(ch => ({
    id: ch.id,
    channel_type: ch.channel_type,
  }));

  // Flatten items with channel type and channel_id
  const items = (plan.plan_channels || []).flatMap(ch =>
    (ch.plan_items || []).map(item => ({
      ...item,
      channel_type: ch.channel_type,
      channel_id: ch.id,
    }))
  );

  return (
    <TrackerClientView
      planId={id}
      projectTitle={projectTitle}
      items={items}
      channels={channels}
    />
  );
}

