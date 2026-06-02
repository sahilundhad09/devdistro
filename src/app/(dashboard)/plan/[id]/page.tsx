import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CHANNEL_LABELS } from '@/lib/utils/constants';
import PlanClientView from './PlanClientView';
import type { ChannelType } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from('plans')
    .select('project_id, projects(title)')
    .eq('id', id)
    .single();

  const rawProjects = plan?.projects;
  const projectObj = Array.isArray(rawProjects) ? rawProjects[0] : rawProjects;
  const projectTitle = (projectObj as { title: string } | null)?.title || 'Plan';

  return {
    title: `${projectTitle} — Distribution Plan — DevDistro`,
    description: `View the distribution plan for ${projectTitle}`,
  };
}

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch plan with channels and items
  const { data: plan, error } = await supabase
    .from('plans')
    .select(`
      *,
      projects(title, description, mode, target_audience),
      plan_channels(
        id, channel_type, sort_order,
        plan_items(*)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !plan) notFound();

  const rawProjects = plan.projects;
  const project = (Array.isArray(rawProjects) ? rawProjects[0] : rawProjects) as {
    title: string;
    description: string;
    mode: string;
    target_audience: string;
  } | null || {
    title: 'Plan',
    description: '',
    mode: 'app',
    target_audience: '',
  };

  // Organize channels
  const channels: Record<string, { items: typeof plan.plan_channels[0]['plan_items']; count: number }> = {};
  const channelOrder: ChannelType[] = ['reddit', 'facebook', 'twitter', 'newsletter', 'directory', 'linkedin'];

  for (const ch of (plan.plan_channels || [])) {
    channels[ch.channel_type] = {
      items: ch.plan_items || [],
      count: (ch.plan_items || []).length,
    };
  }

  // Compute tab data
  const tabs = channelOrder
    .filter(ct => channels[ct] && channels[ct].count > 0)
    .map(ct => ({
      key: ct,
      label: CHANNEL_LABELS[ct] || ct,
      count: channels[ct].count,
      items: channels[ct].items,
    }));

  return (
    <PlanClientView
      planId={plan.id}
      projectTitle={project.title}
      projectMode={project.mode}
      version={plan.version}
      createdAt={plan.created_at}
      tabs={tabs}
      quickWins={plan.quick_wins as string[] || []}
      producthuntChecklist={plan.producthunt_checklist as string[] || []}
    />
  );
}

