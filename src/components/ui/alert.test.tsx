import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertTitle, AlertDescription, AlertAction } from './alert';

describe('Alert', () => {
  it('is an alert: one live region the reader is told about', () => {
    render(
      <Alert>
        <AlertTitle>Draft saved</AlertTitle>
        <AlertDescription>Your changes are private until you publish them.</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the title, the description and the action inside it', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Details</AlertDescription>
        <AlertAction>Undo</AlertAction>
      </Alert>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Heads up');
    expect(alert).toHaveTextContent('Details');
    expect(alert).toHaveTextContent('Undo');
  });

  it('publishes the variant the stylesheet paints with', () => {
    const { rerender } = render(
      <Alert>
        <AlertTitle>Saved</AlertTitle>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toHaveAttribute('data-slot', 'alert');

    rerender(
      <Alert variant="destructive">
        <AlertTitle>Failed</AlertTitle>
      </Alert>,
    );

    // The variant is a class, and the role is what assistive tech reads: both
    // have to survive a change of tone.
    expect(screen.getByRole('alert').className).toContain('text-destructive');
  });

  it('keeps the title as a heading-level element of its own', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    );

    expect(screen.getByText('Heads up')).toHaveAttribute('data-slot', 'alert-title');
  });
});
