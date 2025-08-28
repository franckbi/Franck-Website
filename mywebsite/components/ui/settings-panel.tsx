'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LowPowerToggle } from './low-power-toggle';
import { useTheme } from '@/lib/contexts/theme-context';
import { useSettingsStore } from '@/lib/stores/settings-store';

interface SettingsPanelProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export function SettingsPanel({
  className = '',
  variant = 'compact',
}: SettingsPanelProps) {
  const { theme, resolvedTheme } = useTheme();
  const { lowPowerMode, reducedMotion, performanceMode } = useSettingsStore();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <ThemeToggle />
        <LowPowerToggle />
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 p-4 border border-border rounded-lg bg-card ${className}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Settings className="h-4 w-4" />
        Settings
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <p className="text-xs text-muted-foreground">
              Current: {theme} ({resolvedTheme})
            </p>
          </div>
          <ThemeToggle variant="dropdown" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Performance</label>
            <p className="text-xs text-muted-foreground">
              {lowPowerMode ? 'Low power mode enabled' : 'Full performance'}
            </p>
          </div>
          <LowPowerToggle showLabel />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Reduced motion: {reducedMotion ? 'Yes' : 'No'}</div>
          <div>Performance mode: {performanceMode}</div>
        </div>
      </div>
    </div>
  );
}
