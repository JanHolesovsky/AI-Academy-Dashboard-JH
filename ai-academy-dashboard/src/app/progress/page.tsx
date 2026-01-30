import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ProgressMatrix } from '@/components/ProgressMatrix';
import type { ProgressMatrix as ProgressMatrixType } from '@/lib/types';

export const revalidate = 0;

export default async function ProgressPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('progress_matrix')
    .select('*');

  if (error) {
    console.error('Error fetching progress matrix:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Matrix</h1>
        <p className="text-muted-foreground">
          Completion rates by role and assignment
        </p>
      </div>
      <ProgressMatrix data={(data as ProgressMatrixType[]) ?? []} />
    </div>
  );
}
