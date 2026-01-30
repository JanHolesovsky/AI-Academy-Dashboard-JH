import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, mentor_rating, mentor_notes } = body;

    // Validate required fields
    if (!submission_id || !mentor_rating) {
      return NextResponse.json(
        { error: 'submission_id and mentor_rating are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (mentor_rating < 1 || mentor_rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();

    // Update submission with review
    const { data: submission, error } = await supabase
      .from('submissions')
      .update({
        mentor_rating,
        mentor_notes: mentor_notes || null,
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission_id)
      .select('participant_id')
      .single();

    if (error) {
      console.error('Review error:', error);
      return NextResponse.json(
        { error: 'Failed to save review' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      participant_id: submission.participant_id,
      action: 'review',
      details: {
        submission_id,
        mentor_rating,
      },
    });

    // Check for mentor_favorite achievement (5/5 rating)
    if (mentor_rating === 5) {
      const { data: existingAchievement } = await supabase
        .from('participant_achievements')
        .select('id')
        .eq('participant_id', submission.participant_id)
        .eq('achievement_id', (
          await supabase
            .from('achievements')
            .select('id')
            .eq('code', 'mentor_favorite')
            .single()
        ).data?.id)
        .single();

      if (!existingAchievement) {
        const { data: achievement } = await supabase
          .from('achievements')
          .select('id')
          .eq('code', 'mentor_favorite')
          .single();

        if (achievement) {
          await supabase.from('participant_achievements').insert({
            participant_id: submission.participant_id,
            achievement_id: achievement.id,
          });

          await supabase.from('activity_log').insert({
            participant_id: submission.participant_id,
            action: 'achievement',
            details: { achievement_code: 'mentor_favorite' },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
