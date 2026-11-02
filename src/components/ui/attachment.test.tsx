import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from './attachment';

function renderAttachment(props: React.ComponentProps<typeof Attachment> = {}) {
  return render(
    <Attachment {...props}>
      <AttachmentMedia>📄</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
        <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove sales-dashboard.pdf">✕</AttachmentAction>
      </AttachmentActions>
    </Attachment>,
  );
}

describe('Attachment', () => {
  it('publishes the upload state the title shimmers from', () => {
    const { container, rerender } = renderAttachment();

    expect(container.querySelector('[data-slot="attachment"]')).toHaveAttribute(
      'data-state',
      'done',
    );

    rerender(
      <Attachment state="error">
        <AttachmentContent>
          <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
        </AttachmentContent>
      </Attachment>,
    );

    expect(container.querySelector('[data-slot="attachment"]')).toHaveAttribute(
      'data-state',
      'error',
    );
  });

  it('publishes the size and orientation the media box scales from', () => {
    const { container } = renderAttachment({ size: 'sm', orientation: 'vertical' });

    const attachment = container.querySelector('[data-slot="attachment"]');
    expect(attachment).toHaveAttribute('data-size', 'sm');
    expect(attachment).toHaveAttribute('data-orientation', 'vertical');
  });

  it('keeps the file name and its metadata readable', () => {
    renderAttachment();

    expect(screen.getByText('sales-dashboard.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF · 2.4 MB')).toBeInTheDocument();
  });

  it('reports its action to the caller', async () => {
    const onClick = vi.fn();
    render(
      <Attachment>
        <AttachmentContent>
          <AttachmentTitle>notes.txt</AttachmentTitle>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove notes.txt" onClick={onClick}>
            ✕
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove notes.txt' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
