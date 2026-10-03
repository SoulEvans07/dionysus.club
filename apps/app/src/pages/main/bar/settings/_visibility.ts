import { Globe, Lock, type LucideIcon } from 'lucide-react';
import type { BarVisibility } from '@repo/dtos';

export const visibilityOptions: Record<BarVisibility, { icon: LucideIcon; label: string; description: string }> = {
  public: { icon: Globe, label: 'Public', description: 'Anyone can find and view this bar.' },
  private: { icon: Lock, label: 'Private', description: 'Only members can see this bar.' },
};
