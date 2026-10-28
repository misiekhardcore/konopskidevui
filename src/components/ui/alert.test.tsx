import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertTitle, AlertDescription, AlertAction } from './alert';

describe('Alert', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Draft saved</AlertTitle>
        <AlertDescription>Your changes are private until you publish them.</AlertDescription>
      </Alert>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Draft saved</AlertTitle>
        <AlertDescription>Your changes are private until you publish them.</AlertDescription>
      </Alert>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of ['default', 'destructive'] as const) {
      const { unmount } = render(
        <Alert variant={value}>
          <AlertTitle>Heads up</AlertTitle>
        </Alert>,
      );
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });

  it('exposes role="alert"so assistive tech announces it', async () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders its description and action', async () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Details</AlertDescription>
        <AlertAction>Undo</AlertAction>
      </Alert>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });
});
