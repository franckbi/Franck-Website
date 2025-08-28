/**
 * Accessibility utilities for the 3D portfolio website
 * Provides comprehensive support for screen readers, keyboard navigation, and ARIA
 */

// Live region types for screen reader announcements
export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

/**
 * Announces a message to screen readers using ARIA live regions
 */
export function announceToScreenReader(
  message: string,
  politeness: LiveRegionPoliteness = 'polite',
  atomic: boolean = true
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', atomic.toString());
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Clean up after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Creates a focus trap for modal dialogs and panels
 */
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Manages focus restoration after modal/panel closes
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  restoreFocus(): void {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }

  clear(): void {
    this.previousFocus = null;
  }
}

/**
 * Keyboard navigation utilities for 3D scenes
 */
export class KeyboardNavigationManager {
  private items: Array<{ id: string; element?: HTMLElement; data?: any }> = [];
  private currentIndex = -1;
  private onSelectionChange?: (item: any, index: number) => void;
  private onActivate?: (item: any, index: number) => void;

  constructor(
    onSelectionChange?: (item: any, index: number) => void,
    onActivate?: (item: any, index: number) => void
  ) {
    this.onSelectionChange = onSelectionChange;
    this.onActivate = onActivate;
  }

  setItems(
    items: Array<{ id: string; element?: HTMLElement; data?: any }>
  ): void {
    this.items = items;
    this.currentIndex = -1;
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (this.items.length === 0) return false;

    let handled = false;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.moveToPrevious();
        handled = true;
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.moveToNext();
        handled = true;
        break;

      case 'Home':
        event.preventDefault();
        this.moveToFirst();
        handled = true;
        break;

      case 'End':
        event.preventDefault();
        this.moveToLast();
        handled = true;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrent();
        handled = true;
        break;

      case 'Escape':
        event.preventDefault();
        this.clearSelection();
        handled = true;
        break;
    }

    return handled;
  }

  private moveToPrevious(): void {
    this.currentIndex =
      this.currentIndex <= 0 ? this.items.length - 1 : this.currentIndex - 1;
    this.notifySelectionChange();
  }

  private moveToNext(): void {
    this.currentIndex =
      this.currentIndex >= this.items.length - 1 ? 0 : this.currentIndex + 1;
    this.notifySelectionChange();
  }

  private moveToFirst(): void {
    this.currentIndex = 0;
    this.notifySelectionChange();
  }

  private moveToLast(): void {
    this.currentIndex = this.items.length - 1;
    this.notifySelectionChange();
  }

  private activateCurrent(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      const item = this.items[this.currentIndex];
      this.onActivate?.(item.data, this.currentIndex);
    }
  }

  private clearSelection(): void {
    this.currentIndex = -1;
    this.onSelectionChange?.(null, -1);
  }

  private notifySelectionChange(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      const item = this.items[this.currentIndex];
      this.onSelectionChange?.(item.data, this.currentIndex);
    }
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrentItem(): any {
    return this.currentIndex >= 0 ? this.items[this.currentIndex]?.data : null;
  }
}

/**
 * Generates descriptive text for 3D content for screen readers
 */
export function describe3DContent(projects: any[]): string {
  const count = projects.length;
  const featuredCount = projects.filter(p => p.featured).length;

  const projectText = count === 1 ? 'project' : 'projects';
  const navigationText = count === 1 ? 'the project' : 'projects';

  return `Interactive 3D scene containing ${count} ${projectText}, ${featuredCount} featured. Use arrow keys to navigate between ${navigationText}, Enter to select, and Escape to reset view.`;
}

/**
 * Creates semantic equivalents for 3D interactions
 */
export function createSemanticEquivalent(
  container: HTMLElement,
  projects: any[],
  onProjectSelect: (project: any) => void
): HTMLElement {
  const semanticContainer = document.createElement('div');
  semanticContainer.className = 'sr-only';
  semanticContainer.setAttribute('role', 'region');
  semanticContainer.setAttribute('aria-label', 'Project showcase navigation');

  const list = document.createElement('ul');
  list.setAttribute('role', 'list');

  projects.forEach((project, index) => {
    const listItem = document.createElement('li');
    listItem.setAttribute('role', 'listitem');

    const button = document.createElement('button');
    button.textContent = `${project.title} - ${project.tagline}`;
    button.setAttribute('aria-describedby', `project-${project.slug}-desc`);
    button.addEventListener('click', () => onProjectSelect(project));

    const description = document.createElement('div');
    description.id = `project-${project.slug}-desc`;
    description.className = 'sr-only';
    description.textContent = `${project.description}. Technologies: ${project.stack.join(', ')}.`;

    listItem.appendChild(button);
    listItem.appendChild(description);
    list.appendChild(listItem);
  });

  semanticContainer.appendChild(list);
  container.appendChild(semanticContainer);

  return semanticContainer;
}

/**
 * Detects if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects if user is using a screen reader
 */
export function isUsingScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for common screen reader indicators
  return !!(
    window.navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack|Dragon/i) ||
    window.speechSynthesis ||
    document.querySelector('[aria-live]')
  );
}

/**
 * Creates accessible loading announcements
 */
export function announceLoadingState(
  state: 'loading' | 'loaded' | 'error',
  context?: string
): void {
  const messages = {
    loading: `Loading ${context || 'content'}...`,
    loaded: `${context || 'Content'} loaded successfully.`,
    error: `Failed to load ${context || 'content'}. Please try again.`,
  };

  announceToScreenReader(
    messages[state],
    state === 'error' ? 'assertive' : 'polite'
  );
}

/**
 * Manages ARIA expanded states for collapsible content
 */
export function toggleAriaExpanded(element: HTMLElement): boolean {
  const isExpanded = element.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;
  element.setAttribute('aria-expanded', newState.toString());
  return newState;
}

/**
 * Creates accessible tooltips with proper ARIA relationships
 */
export function createAccessibleTooltip(
  trigger: HTMLElement,
  content: string,
  id?: string
): HTMLElement {
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.className = 'sr-only';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = content;

  trigger.setAttribute('aria-describedby', tooltipId);
  trigger.parentElement?.appendChild(tooltip);

  return tooltip;
}
