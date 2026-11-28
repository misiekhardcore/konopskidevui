import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TypingIndicator } from './typing-indicator';

describe('TypingIndicator', () => {
  it('announces a pending response once while the turn is submitted', () => {
    render(<TypingIndicator status="submitted" />);

    const status = screen.getAllByRole('status');

    expect(status).toHaveLength(1);
    expect(status[0]).toHaveTextContent('Waiting for a response');
  });

  it('keeps the animated part out of the announcement', () => {
    const { container } = render(<TypingIndicator status="submitted" />);

    // The announcement is one static sentence; the dots are decoration and sit
    // outside the accessibility tree, so no animation frame can repeat it.
    expect(screen.getByRole('status').textContent).toBe('Waiting for a response');
    expect(container.querySelectorAll('[data-slot="typing-indicator-dot"]')).toHaveLength(3);
    expect(container.querySelector('[data-slot="typing-indicator-dots"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('keeps waiting while the turn streams with nothing rendered yet', () => {
    render(<TypingIndicator status="streaming" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it.each(['submitted', 'streaming'] as const)(
    'renders nothing when the message already has content while %s',
    (status) => {
      const { container } = render(<TypingIndicator status={status} hasContent />);

      expect(container).toBeEmptyDOMElement();
    },
  );

  it.each(['ready', 'error'] as const)('renders nothing once the turn is %s', (status) => {
    const { container } = render(<TypingIndicator status={status} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('stops waiting the moment content arrives during a stream', () => {
    const { container, rerender } = render(<TypingIndicator status="streaming" />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<TypingIndicator status="streaming" hasContent />);

    expect(container).toBeEmptyDOMElement();
  });

  it('translates the announcement', () => {
    render(<TypingIndicator status="submitted" labels={{ waiting: 'Czekam na odpowiedź' }} />);

    expect(screen.getByRole('status')).toHaveTextContent('Czekam na odpowiedź');
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(<TypingIndicator status="submitted" />);

    expect(view).toContain('Waiting for a response');
  });
});
