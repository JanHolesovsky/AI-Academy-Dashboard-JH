import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Leaderboard } from '@/components/Leaderboard';
import type { LeaderboardView } from '@/lib/types';

export const revalidate = 0; // Always fetch fresh data

export default async function LeaderboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('rank');

  if (error) {
    console.error('Error fetching leaderboard:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          Track participant rankings, points, and achievements
        </p>
      </div>
      <Leaderboard initialData={(data as LeaderboardView[]) ?? []} />
    </div>
  );
}
