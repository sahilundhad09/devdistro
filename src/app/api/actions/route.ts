// Actions API — Update plan item status
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, status, notes } = await request.json();

    if (!itemId || !status) {
      return NextResponse.json({ error: 'itemId and status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'done', 'skipped', 'saved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('plan_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update action error:', error);
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}

// POST — Create a custom action item
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId, planId, title, description, url } = await request.json();

    if (!channelId || !planId || !title) {
      return NextResponse.json({ error: 'channelId, planId, and title are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('plan_items')
      .insert({
        channel_id: channelId,
        plan_id: planId,
        user_id: user.id,
        title,
        description: description || null,
        url: url || null,
        status: 'pending',
      })
      .select('id, title, description, url, status')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Create action error:', error);
    return NextResponse.json({ error: 'Failed to create action' }, { status: 500 });
  }
}

// DELETE — Remove an action item
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('plan_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete action error:', error);
    return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
  }
}
