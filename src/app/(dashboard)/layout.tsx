import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import styles from '@/components/layout/Sidebar.module.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name, avatar_url, plan_tier')
    .eq('id', user.id)
    .single();

  const sidebarUser = profile ? {
    name: profile.name,
    email: user.email || '',
    avatar_url: profile.avatar_url,
    plan_tier: profile.plan_tier,
  } : {
    name: null,
    email: user.email || '',
    avatar_url: null,
    plan_tier: 'free',
  };

  return (
    <>
      <Sidebar user={sidebarUser} />
      <main className={styles.main}>
        <div className={styles.main__content}>
          {children}
        </div>
      </main>
    </>
  );
}
