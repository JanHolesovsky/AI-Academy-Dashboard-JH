'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Grid3X3 } from 'lucide-react';
import type { ProgressMatrix as ProgressMatrixType, RoleType, AssignmentType } from '@/lib/types';

// Install tooltip component
// npx shadcn@latest add tooltip

interface ProgressMatrixProps {
  data: ProgressMatrixType[];
}

const ROLES: RoleType[] = ['FDE', 'AI-SE', 'AI-PM', 'AI-DA', 'AI-DS', 'AI-SEC', 'AI-FE', 'AI-DX'];
const DAYS = [1, 2, 3, 4, 5];
const TYPES: AssignmentType[] = ['in_class', 'homework'];

function getCompletionColor(pct: number): string {
  if (pct === 0) return 'bg-muted';
  if (pct < 50) return 'bg-red-500/70';
  if (pct < 80) return 'bg-yellow-500/70';
  return 'bg-green-500/70';
}

function getCompletionTextColor(pct: number): string {
  if (pct === 0) return 'text-muted-foreground';
  return 'text-white';
}

export function ProgressMatrix({ data }: ProgressMatrixProps) {
  // Create a lookup map for quick access
  const matrixMap = new Map<string, ProgressMatrixType>();
  data.forEach((item) => {
    const key = `${item.role}-${item.day}-${item.type}`;
    matrixMap.set(key, item);
  });

  const getCell = (role: RoleType, day: number, type: AssignmentType) => {
    const key = `${role}-${day}-${type}`;
    return matrixMap.get(key);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-[#0062FF]" />
          Progress Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground">Role</th>
                  {DAYS.map((day) => (
                    <th key={day} colSpan={2} className="p-2 text-center font-medium">
                      Day {day}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="p-2"></th>
                  {DAYS.map((day) => (
                    <>
                      <th key={`${day}-ic`} className="p-1 text-center text-xs text-muted-foreground">
                        IC
                      </th>
                      <th key={`${day}-hw`} className="p-1 text-center text-xs text-muted-foreground">
                        HW
                      </th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((role) => (
                  <tr key={role} className="border-t border-border">
                    <td className="p-2">
                      <Badge variant="outline">{role}</Badge>
                    </td>
                    {DAYS.map((day) => (
                      <>
                        {TYPES.map((type) => {
                          const cell = getCell(role, day, type);
                          const pct = cell?.completion_pct ?? 0;
                          const submitted = cell?.submitted ?? 0;
                          const total = cell?.total ?? 0;

                          // Skip homework for day 4 and 5
                          if ((day === 4 || day === 5) && type === 'homework') {
                            return (
                              <td key={`${day}-${type}`} className="p-1">
                                <div className="w-12 h-8 bg-muted/30 rounded flex items-center justify-center text-xs text-muted-foreground">
                                  -
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={`${day}-${type}`} className="p-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-12 h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${getCompletionColor(pct)} ${getCompletionTextColor(pct)}`}
                                  >
                                    {pct}%
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{role} - Day {day} {type === 'in_class' ? 'In-Class' : 'Homework'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {submitted} / {total} submitted ({pct}%)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                          );
                        })}
                      </>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TooltipProvider>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <span className="text-xs text-muted-foreground">0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/70"></div>
            <span className="text-xs text-muted-foreground">&lt;50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/70"></div>
            <span className="text-xs text-muted-foreground">50-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/70"></div>
            <span className="text-xs text-muted-foreground">&gt;80%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
