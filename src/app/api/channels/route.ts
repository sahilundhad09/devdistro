// Channels API — Create and delete custom channels
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST — Create a custom channel under a plan
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, channelType } = await request.json();

    if (!planId || !channelType) {
      return NextResponse.json({ error: 'planId and channelType are required' }, { status: 400 });
    }

    // Verify user owns the plan
    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Get next sort_order
    const { data: existing } = await supabase
      .from('plan_channels')
      .select('sort_order')
      .eq('plan_id', planId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from('plan_channels')
      .insert({
        plan_id: planId,
        channel_type: channelType,
        sort_order: nextOrder,
      })
      .select('id, channel_type, sort_order')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, channel: data });
  } catch (error) {
    console.error('Create channel error:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}

// DELETE — Remove a custom channel (and its items via cascade)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId, planId } = await request.json();

    if (!channelId || !planId) {
      return NextResponse.json({ error: 'channelId and planId are required' }, { status: 400 });
    }

    // Verify user owns the plan
    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('plan_channels')
      .delete()
      .eq('id', channelId)
      .eq('plan_id', planId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete channel error:', error);
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}
