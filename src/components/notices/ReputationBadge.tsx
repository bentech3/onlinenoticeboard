import { TrendingUp, Flame, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ReputationBadgeProps {
  score: number;
  tier: string;
  compact?: boolean;
}

export function ReputationBadge({ score, tier, compact = false }: ReputationBadgeProps) {
  if (score === 0) return null;

  const config = {
    high: { icon: Flame, label: 'High Impact', className: 'bg-destructive/15 text-destructive border-destructive/30' },
    medium: { icon: TrendingUp, label: 'Trending', className: 'bg-warning/15 text-warning border-warning/30' },
    low: { icon: Star, label: 'Engagement', className: 'bg-muted text-muted-foreground' },
  }[tier] || { icon: Star, label: '', className: '' };

  const Icon = config.icon;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={cn('gap-1 text-[10px]', config.className)}>
            <Icon className="h-3 w-3" />
            {score}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{config.label} • Score: {score}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label} ({score})
    </Badge>
  );
}
