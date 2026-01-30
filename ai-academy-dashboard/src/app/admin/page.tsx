'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReviewForm } from '@/components/ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ShieldCheck, Clock, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { SubmissionWithDetails } from '@/lib/types';

export default function AdminPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPendingSubmissions = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('submissions')
      .select('*, participants(name, github_username, avatar_url, role, team), assignments(title, day, type)')
      .eq('status', 'submitted')
      .is('mentor_rating', null)
      .order('submitted_at', { ascending: true });

    if (!error && data) {
      setPendingSubmissions(data as SubmissionWithDetails[]);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPendingSubmissions();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Review pending submissions</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-[#0062FF]" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Review pending submissions</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {pendingSubmissions.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {pendingSubmissions.length === 0 ? (
                <span className="text-green-500">All caught up! 🎉</span>
              ) : (
                <span className="text-orange-500">Reviews pending</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">No pending reviews!</p>
              <p className="text-muted-foreground">All submissions have been reviewed.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Self Rating</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Link
                        href={`/participant/${sub.participants?.github_username}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sub.participants?.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {sub.participants?.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sub.participants?.name}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {sub.participants?.role}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {sub.participants?.team}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          Day {sub.assignments?.day}: {sub.assignments?.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {sub.assignments?.type === 'in_class' ? 'In-Class' : 'Homework'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.self_rating ? (
                        <span>{'⭐'.repeat(sub.self_rating)} ({sub.self_rating}/5)</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(sub.submitted_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ReviewForm
                          submissionId={sub.id}
                          participantName={sub.participants?.name || 'Unknown'}
                          assignmentTitle={`Day ${sub.assignments?.day}: ${sub.assignments?.title}`}
                          onReviewComplete={fetchPendingSubmissions}
                        />
                        {sub.commit_url && (
                          <a
                            href={sub.commit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
