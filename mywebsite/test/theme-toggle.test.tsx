import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/lib/contexts/theme-context';

function renderWithThemeProvider(
  component: React.ReactElement,
  theme = 'system'
) {
  return render(
    <ThemeProvider defaultTheme={theme as any}>{component}</ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  it('should render button variant by default', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('should render dropdown variant', () => {
    renderWithThemeProvider(<ThemeToggle variant="dropdown" />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Select theme');
  });

  it('should cycle through themes on button click', () => {
    renderWithThemeProvider(<ThemeToggle />, 'light');

    const button = screen.getByRole('button');

    // Should start with light theme
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');

    // Click to go to dark
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to system theme');

    // Click to go to system
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('should change theme via dropdown', () => {
    renderWithThemeProvider(<ThemeToggle variant="dropdown" />);

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'dark' } });
    expect(select).toHaveValue('dark');

    fireEvent.change(select, { target: { value: 'light' } });
    expect(select).toHaveValue('light');
  });

  it('should display correct icons for each theme', () => {
    const { rerender } = renderWithThemeProvider(<ThemeToggle />, 'light');

    // Light theme should show sun icon
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    );

    // Dark theme should show moon icon
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>
    );

    // System theme should show monitor icon
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    renderWithThemeProvider(<ThemeToggle className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
