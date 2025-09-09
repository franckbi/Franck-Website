'use client';

import React from 'react';
import { Battery, BatteryLow } from 'lucide-react';
import { useSettingsStore } from '@/lib/stores/settings-store';

interface LowPowerToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function LowPowerToggle({
  className = '',
  showLabel = false,
}: LowPowerToggleProps) {
  const { lowPowerMode, toggleLowPowerMode } = useSettingsStore();

  return (
    <button
      onClick={toggleLowPowerMode}
      data-testid="low-power-toggle"
      className={`inline-flex items-center justify-center gap-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      aria-label={
        lowPowerMode ? 'Disable low power mode' : 'Enable low power mode'
      }
      title={lowPowerMode ? 'Disable low power mode' : 'Enable low power mode'}
    >
      {lowPowerMode ? (
        <BatteryLow className="h-4 w-4" />
      ) : (
        <Battery className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="text-xs">
          {lowPowerMode ? 'Low Power' : 'Full Power'}
        </span>
      )}
      <span className="sr-only">
        {lowPowerMode ? 'Disable low power mode' : 'Enable low power mode'}
      </span>
    </button>
  );
}
