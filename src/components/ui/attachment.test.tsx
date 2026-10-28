import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
} from './attachment';

describe('Attachment', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Attachment>
        <AttachmentMedia>
          <span aria-hidden="true">📄</span>
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>PDF · 1 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Attachment>
        <AttachmentMedia>
          <span aria-hidden="true">📄</span>
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>PDF · 1 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of ['idle', 'uploading', 'processing', 'error', 'done'] as const) {
      const { unmount } = render(
        <Attachment state={value}>
          <AttachmentContent>
            <AttachmentTitle>file.pdf</AttachmentTitle>
          </AttachmentContent>
        </Attachment>,
      );
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });

  it('exposes the upload state on the root', async () => {
    render(
      <Attachment state="uploading">
        <AttachmentTitle>file.pdf</AttachmentTitle>
      </Attachment>,
    );

    expect(document.querySelector('[data-slot="attachment"]')).toHaveAttribute(
      'data-state',
      'uploading',
    );
  });
});
