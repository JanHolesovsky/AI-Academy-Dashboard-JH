// /api/webhook/github.ts
// Vercel Edge Function - GitHub Webhook Handler

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string): boolean {
    const secret = process.env.GITHUB_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// Parse submission tag from README content
function parseSubmissionTag(content: string): { day: number; type: string } | null {
    const match = content.match(/<!-- submission:day-(\d+):(in-class|homework) -->/);
    if (match) {
        return { day: parseInt(match[1]), type: match[2].replace('-', '_') };
    }
    return null;
}

// Parse self-rating from README content
function parseSelfRating(content: string): number | null {
    const match = content.match(/\*\*Celkové hodnotenie:\*\* (\d)\/5/);
    return match ? parseInt(match[1]) : null;
}

// Detect folder from changed files
function detectSubmissionFolder(files: any[]): string | null {
    const submissionFolders = [
        'day-01-agent-foundations',
        'day-02-rag-basics',
        'day-03-multi-agent',
        'day-04-team-challenge',
        'day-05-mvp',
        'homework/day-01',
        'homework/day-02',
        'homework/day-03'
    ];
    
    for (const file of files) {
        for (const folder of submissionFolders) {
            if (file.filename?.startsWith(folder + '/')) {
                return folder;
            }
        }
    }
    return null;
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const payload = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // Verify signature
    if (!signature || !verifySignature(payload, signature)) {
        return new Response('Invalid signature', { status: 401 });
    }

    const event = req.headers.get('x-github-event');
    const data = JSON.parse(payload);

    // Only process push events
    if (event !== 'push') {
        return new Response('Ignored event', { status: 200 });
    }

    // Extract info
    const githubUsername = data.repository?.owner?.login;
    const commitSha = data.head_commit?.id;
    const commitMessage = data.head_commit?.message;
    const commitUrl = data.head_commit?.url;

    if (!githubUsername || !commitSha) {
        return new Response('Missing data', { status: 400 });
    }

    // Get participant
    const { data: participant, error: pError } = await supabase
        .from('participants')
        .select('id')
        .eq('github_username', githubUsername)
        .single();

    if (pError || !participant) {
        console.log(`Unknown participant: ${githubUsername}`);
        return new Response('Unknown participant', { status: 200 });
    }

    // Detect which folder was updated
    const modifiedFiles = data.head_commit?.modified || [];
    const addedFiles = data.head_commit?.added || [];
    const allFiles = [...modifiedFiles, ...addedFiles].map(f => ({ filename: f }));
    
    const folder = detectSubmissionFolder(allFiles);
    if (!folder) {
        return new Response('No submission folder detected', { status: 200 });
    }

    // Get assignment by folder
    const { data: assignment, error: aError } = await supabase
        .from('assignments')
        .select('id, day, type')
        .eq('folder_name', folder)
        .single();

    if (aError || !assignment) {
        console.log(`Unknown assignment folder: ${folder}`);
        return new Response('Unknown assignment', { status: 200 });
    }

    // Try to fetch README content from the repo
    let readmeContent = '';
    let selfRating = null;
    
    try {
        const readmeUrl = `https://raw.githubusercontent.com/${githubUsername}/ai-academy-2026/${data.ref?.replace('refs/heads/', '')}/${folder}/README.md`;
        const readmeResponse = await fetch(readmeUrl);
        if (readmeResponse.ok) {
            readmeContent = await readmeResponse.text();
            selfRating = parseSelfRating(readmeContent);
        }
    } catch (e) {
        console.log('Could not fetch README');
    }

    // Calculate points (base + on-time bonus)
    const now = new Date();
    const { data: assignmentFull } = await supabase
        .from('assignments')
        .select('max_points, due_at')
        .eq('id', assignment.id)
        .single();
    
    let points = assignmentFull?.max_points || 15;
    if (assignmentFull?.due_at && new Date(assignmentFull.due_at) < now) {
        points = Math.floor(points * 0.5); // 50% for late
    }

    // Upsert submission
    const { data: submission, error: sError } = await supabase
        .from('submissions')
        .upsert({
            participant_id: participant.id,
            assignment_id: assignment.id,
            commit_sha: commitSha,
            commit_message: commitMessage,
            commit_url: commitUrl,
            readme_content: readmeContent,
            self_rating: selfRating,
            points_earned: points,
            status: 'submitted',
            submitted_at: new Date().toISOString()
        }, {
            onConflict: 'participant_id,assignment_id'
        })
        .select()
        .single();

    if (sError) {
        console.error('Submission error:', sError);
        return new Response('Database error', { status: 500 });
    }

    // Check for achievements
    await checkAchievements(participant.id);

    return new Response(JSON.stringify({
        success: true,
        submission_id: submission.id,
        points_earned: points
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Check and award achievements
async function checkAchievements(participantId: string) {
    const { data: submissions } = await supabase
        .from('submissions')
        .select('submitted_at, assignment_id')
        .eq('participant_id', participantId);

    if (!submissions) return;

    const { data: existingAchievements } = await supabase
        .from('participant_achievements')
        .select('achievement_id, achievements(code)')
        .eq('participant_id', participantId);

    const earned = new Set(existingAchievements?.map(a => a.achievements?.code) || []);

    const achievementsToAward: string[] = [];

    // First Blood
    if (submissions.length === 1 && !earned.has('first_blood')) {
        achievementsToAward.push('first_blood');
    }

    // Streak
    if (submissions.length >= 3 && !earned.has('streak_3')) {
        achievementsToAward.push('streak_3');
    }
    if (submissions.length >= 5 && !earned.has('streak_5')) {
        achievementsToAward.push('streak_5');
    }

    // Early Bird / Night Owl
    const lastSubmission = new Date(submissions[submissions.length - 1].submitted_at);
    const hour = lastSubmission.getHours();
    if (hour < 9 && !earned.has('early_bird')) {
        achievementsToAward.push('early_bird');
    }
    if (hour >= 22 && !earned.has('night_owl')) {
        achievementsToAward.push('night_owl');
    }

    // Award achievements
    for (const code of achievementsToAward) {
        const { data: achievement } = await supabase
            .from('achievements')
            .select('id, points_bonus')
            .eq('code', code)
            .single();

        if (achievement) {
            await supabase
                .from('participant_achievements')
                .insert({
                    participant_id: participantId,
                    achievement_id: achievement.id
                });

            // Log activity
            await supabase
                .from('activity_log')
                .insert({
                    participant_id: participantId,
                    action: 'achievement',
                    details: { achievement_code: code }
                });
        }
    }
}
