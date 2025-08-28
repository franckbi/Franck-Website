import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { LowPowerToggle } from '@/components/ui/low-power-toggle';
import { useSettingsStore } from '@/lib/stores/settings-store';

describe('LowPowerToggle', () => {
  beforeEach(() => {
    // Reset store state
    useSettingsStore.setState({
      lowPowerMode: false,
      reducedMotion: false,
      performanceMode: 'high',
    });
  });

  it('should render with default state', () => {
    render(<LowPowerToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Enable low power mode');
  });

  it('should toggle low power mode on click', () => {
    render(<LowPowerToggle />);

    const button = screen.getByRole('button');

    // Initially should be disabled
    expect(button).toHaveAttribute('aria-label', 'Enable low power mode');

    // Click to enable
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Disable low power mode');

    // Click to disable
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Enable low power mode');
  });

  it('should show label when showLabel is true', () => {
    render(<LowPowerToggle showLabel />);

    expect(screen.getByText('Full Power')).toBeInTheDocument();

    // Click to enable low power mode
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Low Power')).toBeInTheDocument();
  });

  it('should not show label by default', () => {
    render(<LowPowerToggle />);

    expect(screen.queryByText('Full Power')).not.toBeInTheDocument();
    expect(screen.queryByText('Low Power')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<LowPowerToggle className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should reflect store state changes', async () => {
    render(<LowPowerToggle />);

    const button = screen.getByRole('button');

    // Manually update store state
    act(() => {
      useSettingsStore.getState().setLowPowerMode(true);
    });

    // Component should reflect the change
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Disable low power mode');
    });
  });
});
