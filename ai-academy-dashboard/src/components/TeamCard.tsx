'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { TeamType, Participant } from '@/lib/types';
import { TEAM_COLORS } from '@/lib/types';

interface TeamCardProps {
  team: TeamType;
  members: Participant[];
  totalPoints: number;
  avgSubmissions: number;
  rank: number;
}

export function TeamCard({ team, members, totalPoints, avgSubmissions, rank }: TeamCardProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 text-black">🥇 1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400 text-black">🥈 2nd</Badge>;
      case 3:
        return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>;
      default:
        return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${TEAM_COLORS[team]}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team {team}
          </CardTitle>
          {getRankBadge(rank)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-[#0062FF]" />
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          <div className="text-center p-3 bg-accent/50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{avgSubmissions.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Avg Submissions</p>
          </div>
        </div>

        {/* Members */}
        <div>
          <p className="text-sm font-medium mb-2">Members ({members.length})</p>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 6).map((member) => (
              <Link
                key={member.id}
                href={`/participant/${member.github_username}`}
                className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name.split(' ')[0]}</span>
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
              </Link>
            ))}
            {members.length > 6 && (
              <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                +{members.length - 6} more
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
