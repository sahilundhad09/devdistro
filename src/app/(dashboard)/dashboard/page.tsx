import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Zap, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Dashboard — DevDistro',
  description: 'View and manage your distribution plans.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch projects with plan counts
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      plans(id, created_at)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Fetch action stats per project
  const { data: actionStats } = await supabase
    .from('plan_items')
    .select('plan_id, status')
    .eq('user_id', user.id);

  // Build stats map
  const statsMap = new Map<string, { total: number; completed: number }>();
  if (actionStats) {
    for (const item of actionStats) {
      const existing = statsMap.get(item.plan_id) || { total: 0, completed: 0 };
      existing.total += 1;
      if (item.status === 'done') existing.completed += 1;
      statsMap.set(item.plan_id, existing);
    }
  }

  const hasProjects = projects && projects.length > 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <div className={styles.dashboard__headerLeft}>
          <h1 className={styles.dashboard__title}>Your Projects</h1>
          <p className={styles.dashboard__subtitle}>
            {hasProjects
              ? `${projects.length} project${projects.length === 1 ? '' : 's'}`
              : 'Get started by creating your first distribution plan'}
          </p>
        </div>
        <Link href="/new">
          <Button icon={<Plus size={18} />}>New Plan</Button>
        </Link>
      </div>

      {hasProjects ? (
        <div className={styles.dashboard__grid}>
          {projects.map((project, i) => {
            const plans = project.plans || [];
            const latestPlan = plans[plans.length - 1];
            const stats = latestPlan ? statsMap.get(latestPlan.id) : null;
            const progress = stats && stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0;

            return (
              <Link
                key={project.id}
                href={latestPlan ? `/plan/${latestPlan.id}` : `/new?project=${project.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card interactive className={`${styles.projectCard} animate-fadeInUp stagger-${Math.min(i + 1, 6)}`}>
                  <CardBody>
                    <div className={styles.projectCard__top}>
                      <div>
                        <h3 className={styles.projectCard__title}>{project.title}</h3>
                      </div>
                      <Badge variant={project.mode === 'freelance' ? 'accent' : 'info'} className={styles.projectCard__mode}>
                        {project.mode === 'freelance' ? 'Freelancer' : 'App'}
                      </Badge>
                    </div>
                    <p className={styles.projectCard__desc}>{project.description}</p>
                    <div className={styles.projectCard__stats}>
                      <span className={styles.projectCard__stat}>
                        <Zap size={14} />
                        {plans.length} plan{plans.length !== 1 ? 's' : ''}
                      </span>
                      {stats && (
                        <span className={styles.projectCard__stat}>
                          <CheckCircle2 size={14} />
                          {stats.completed}/{stats.total}
                          <div className={styles.progressBar}>
                            <div className={styles.progressBar__fill} style={{ width: `${progress}%` }} />
                          </div>
                        </span>
                      )}
                      {latestPlan && (
                        <span className={styles.projectCard__stat}>
                          <Calendar size={14} />
                          {new Date(latestPlan.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyState__icon}>
            <Zap size={32} />
          </div>
          <h2 className={styles.emptyState__title}>No projects yet</h2>
          <p className={styles.emptyState__desc}>
            Describe your app or service, and we&apos;ll generate a distribution plan
            with specific subreddits, groups, directories, and ready-to-use templates.
          </p>
          <Link href="/new">
            <Button icon={<Plus size={18} />} size="lg">
              Create Your First Plan
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
