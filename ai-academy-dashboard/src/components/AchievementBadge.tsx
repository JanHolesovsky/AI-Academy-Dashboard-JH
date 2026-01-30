'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ACHIEVEMENT_ICONS } from '@/lib/types';
import type { Achievement } from '@/lib/types';

interface AchievementBadgeProps {
  achievement: Achievement;
  earnedAt?: string;
}

export function AchievementBadge({ achievement, earnedAt }: AchievementBadgeProps) {
  const icon = ACHIEVEMENT_ICONS[achievement.code] || '🏆';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-medium text-sm">{achievement.name}</p>
              {achievement.points_bonus > 0 && (
                <p className="text-xs text-[#0062FF]">+{achievement.points_bonus} pts</p>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{achievement.name}</p>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          {earnedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Earned: {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
