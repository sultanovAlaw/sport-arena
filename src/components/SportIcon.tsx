import {
  Award,
  Crown,
  Dumbbell,
  Flame,
  Shield,
  Target,
  Trophy,
  Volleyball,
} from 'lucide-react';
import type { SportType } from '../types';

export function SportIcon({
  sport,
  className = 'w-4 h-4',
}: {
  sport: SportType;
  className?: string;
}) {
  switch (sport) {
    case 'football':
      return <Trophy className={className} />;
    case 'basketball':
      return <Flame className={className} />;
    case 'volleyball':
      return <Volleyball className={className} />;
    case 'tennis':
      return <Target className={className} />;
    case 'wrestling':
      return <Dumbbell className={className} />;
    case 'boxing':
      return <Award className={className} />;
    case 'chess':
      return <Crown className={className} />;
    default:
      return <Shield className={className} />;
  }
}

export function TeamCrest({
  shortCode,
  color,
  size = 'md',
}: {
  shortCode: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims =
    size === 'lg'
      ? 'w-14 h-14 text-sm rounded-xl'
      : size === 'sm'
        ? 'w-8 h-8 text-[11px] rounded-lg'
        : 'w-10 h-10 text-xs rounded-lg';

  return (
    <div
      className={`${dims} shrink-0 flex items-center justify-center font-mono font-bold tracking-tight text-white border border-white/15 select-none`}
      style={{ backgroundColor: color || '#2563EB' }}
      aria-hidden="true"
    >
      {shortCode.slice(0, 3).toUpperCase()}
    </div>
  );
}
