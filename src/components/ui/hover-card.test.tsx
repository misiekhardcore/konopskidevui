import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';

describe('HoverCard', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Preview</HoverCardContent>
      </HoverCard>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Preview</HoverCardContent>
      </HoverCard>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('opens the preview on hover', async () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Preview</HoverCardContent>
      </HoverCard>,
    );

    await userEvent.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Preview')).toBeInTheDocument();
  });
});
