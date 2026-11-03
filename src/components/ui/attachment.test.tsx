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
  AttachmentTrigger,
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

  it('publishes every upload state the card is painted from', () => {
    for (const state of ['idle', 'uploading', 'processing', 'error', 'done'] as const) {
      const { container, unmount } = render(
        <Attachment state={state}>
          <AttachmentContent>
            <AttachmentTitle>notes.txt</AttachmentTitle>
          </AttachmentContent>
        </Attachment>,
      );

      expect(container.querySelector('[data-slot="attachment"]')).toHaveAttribute(
        'data-state',
        state,
      );
      unmount();
    }
  });

  it('defaults to a finished, horizontally laid out card of the default size', () => {
    const { container } = renderAttachment();
    const attachment = container.querySelector('[data-slot="attachment"]');

    expect(attachment).toHaveAttribute('data-state', 'done');
    expect(attachment).toHaveAttribute('data-size', 'default');
    expect(attachment).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('publishes the media variant, so a thumbnail can fill the box', () => {
    const { container } = render(
      <Attachment>
        <AttachmentMedia variant="image">
          <img alt="preview" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
        </AttachmentMedia>
      </Attachment>,
    );

    expect(container.querySelector('[data-slot="attachment-media"]')).toHaveAttribute(
      'data-variant',
      'image',
    );
  });

  it('paints its action with the variant it is given', () => {
    render(
      <AttachmentActions>
        <AttachmentAction variant="destructive" aria-label="Remove" />
      </AttachmentActions>,
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute(
      'data-variant',
      'destructive',
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('data-size', 'icon-xs');
  });

  it('makes the whole card clickable without ever submitting a form', () => {
    const { container, unmount } = render(
      <Attachment>
        <AttachmentTrigger aria-label="Open notes.txt" />
      </Attachment>,
    );

    expect(container.querySelector('button')).toHaveAttribute('type', 'button');
    unmount();

    const { container: submitView, unmount: unmountSubmit } = render(
      <Attachment>
        <AttachmentTrigger type="submit" aria-label="Upload" />
      </Attachment>,
    );
    expect(submitView.querySelector('button')).toHaveAttribute('type', 'submit');
    unmountSubmit();

    const { container: linkView } = render(
      <Attachment>
        <AttachmentTrigger asChild aria-label="Open notes.txt">
          <a href="/notes.txt">notes.txt</a>
        </AttachmentTrigger>
      </Attachment>,
    );
    expect(linkView.querySelector('a')).not.toHaveAttribute('type');
  });
});
