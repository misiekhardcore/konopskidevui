import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';

describe('HoverCard', () => {
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

  it('hides the preview when the pointer leaves', async () => {
    render(
      <HoverCard closeDelay={0}>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Preview</HoverCardContent>
      </HoverCard>,
    );

    await userEvent.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Preview')).toBeInTheDocument();

    await userEvent.unhover(screen.getByText('Hover me'));

    await waitFor(() => expect(screen.queryByText('Preview')).not.toBeInTheDocument());
  });
});
