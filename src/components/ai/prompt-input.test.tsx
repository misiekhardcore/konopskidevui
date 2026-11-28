import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PromptInput } from './prompt-input';

import type { PromptInputProps } from './prompt-input';

/**
 * The composer is controlled, so every suite drives it through the same
 * stateful harness an app would write: `onValueChange` is the only way the
 * value moves.
 */
function Composer(props: Partial<PromptInputProps> & Pick<PromptInputProps, 'onSubmit'>) {
  const [value, setValue] = React.useState(props.value ?? '');

  return (
    <PromptInput
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange?.(next);
      }}
    />
  );
}

/**
 * jsdom has no object URLs, so both halves are stubbed and the URLs are
 * readable: every assertion about revocation can then name the URL it expects.
 */
function stubObjectUrls() {
  const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
  const revokeObjectURL = vi.fn();
  const original = {
    createObjectURL: URL.createObjectURL,
    revokeObjectURL: URL.revokeObjectURL,
  };

  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;

  return {
    createObjectURL,
    revokeObjectURL,
    restore() {
      URL.createObjectURL = original.createObjectURL;
      URL.revokeObjectURL = original.revokeObjectURL;
    },
  };
}

let objectUrls: ReturnType<typeof stubObjectUrls>;

beforeEach(() => {
  objectUrls = stubObjectUrls();
});

afterEach(() => {
  objectUrls.restore();
});

const notes = () => new File(['notes'], 'notes.txt', { type: 'text/plain' });
const cover = () => new Uint8Array([137, 80, 78, 71]);

function fileInput(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) throw new Error('the composer has no file input');

  return input;
}

describe('PromptInput', () => {
  it('submits the typed text on Enter and leaves the value to the app', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(textarea, 'Forecast for Kraków?');
    await userEvent.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      text: 'Forecast for Kraków?',
      files: [],
    });
    expect(textarea).toHaveValue('Forecast for Kraków?');
  });

  it('inserts a newline on Shift+Enter instead of submitting', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(textarea, 'First line');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.keyboard('Second line');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('First line\nSecond line');
  });

  it('does not submit empty or whitespace-only input', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    await userEvent.type(textarea, '   ');
    await userEvent.keyboard('{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('stops the stream instead of submitting while the status is streaming', async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    render(<Composer onSubmit={onSubmit} onStop={onStop} status="streaming" value="Hello" />);

    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Stop generating' }));

    expect(onStop).toHaveBeenCalledOnce();

    await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('previews chosen files through the attachment component', async () => {
    const { container } = render(<Composer onSubmit={vi.fn()} />);

    await userEvent.upload(fileInput(container), [
      new File([cover()], 'cover.png', { type: 'image/png' }),
      notes(),
    ]);

    expect(screen.getByText('cover.png')).toBeInTheDocument();
    expect(screen.getByText('image/png · 4 B')).toBeInTheDocument();
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
    expect(screen.getByText('text/plain · 5 B')).toBeInTheDocument();

    // An image preview is the attachment's own media box, filled by an object URL.
    const preview = container.querySelector('[data-slot="attachment-media"] img');
    expect(preview).toHaveAttribute('src', 'blob:cover.png');
  });

  it('accepts a pasted file as an attachment', async () => {
    render(<Composer onSubmit={vi.fn()} />);

    fireEvent.paste(screen.getByRole('textbox', { name: 'Message' }), {
      clipboardData: { files: [notes()] },
    });

    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('removes an attachment and revokes the object URL it previewed with', async () => {
    const { container } = render(<Composer onSubmit={vi.fn()} />);

    await userEvent.upload(fileInput(container), notes());
    await userEvent.click(screen.getByRole('button', { name: 'Remove notes.txt' }));

    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
    expect(objectUrls.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:notes.txt');
  });

  it('reports submitted attachments as browser files and clears the previews', async () => {
    const onSubmit = vi.fn();
    const { container } = render(<Composer onSubmit={onSubmit} />);
    const file = notes();

    await userEvent.upload(fileInput(container), file);
    await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), 'Summarise this');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      text: 'Summarise this',
      files: [file],
    });
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:notes.txt');
  });

  it('revokes every object URL it created when it unmounts', async () => {
    const { container, unmount } = render(<Composer onSubmit={vi.fn()} />);

    await userEvent.upload(fileInput(container), [
      new File([cover()], 'cover.png', { type: 'image/png' }),
      notes(),
    ]);
    unmount();

    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:cover.png');
    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:notes.txt');
  });

  it('stops the textarea growing at the max height it is given', () => {
    const { unmount } = render(<Composer onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveStyle({ maxHeight: '200px' });
    unmount();

    render(<Composer onSubmit={vi.fn()} maxHeight={320} />);
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveStyle({ maxHeight: '320px' });
  });

  it('ignores Enter while an input method is still composing', () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} value="こんにち" />);

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), {
      key: 'Enter',
      isComposing: true,
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('stays usable with the keyboard alone', async () => {
    render(<Composer onSubmit={vi.fn()} value="Hello" />);

    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Attach files' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Send message' })).toHaveFocus();
  });

  it('takes a label for every control, so the composer can be translated', () => {
    render(
      <Composer
        onSubmit={vi.fn()}
        value="Dzień dobry"
        labels={{
          message: 'Wiadomość',
          send: 'Wyślij wiadomość',
          attach: 'Dołącz pliki',
          attachments: 'Załączniki',
          remove: 'Usuń {name}',
        }}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Wiadomość' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dołącz pliki' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wyślij wiadomość' })).toBeInTheDocument();
  });

  it('names an attachment group and its remove action', async () => {
    const { container } = render(<Composer onSubmit={vi.fn()} />);

    await userEvent.upload(fileInput(container), notes());

    expect(screen.getByRole('group', { name: 'Attachments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove notes.txt' })).toBeInTheDocument();
  });

  it('describes a file without a media type by its size alone', async () => {
    const { container } = render(<Composer onSubmit={vi.fn()} />);

    await userEvent.upload(fileInput(container), new File([new Uint8Array(2048)], 'archive.bin'));

    expect(screen.getByText('File · 2 KB')).toBeInTheDocument();
  });

  it('still previews an attachment where the browser has no object URLs', async () => {
    URL.createObjectURL = undefined as unknown as typeof URL.createObjectURL;
    const { container } = render(<Composer onSubmit={vi.fn()} />);

    await userEvent.upload(
      fileInput(container),
      new File([cover()], 'cover.png', { type: 'image/png' }),
    );

    expect(screen.getByText('cover.png')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove cover.png' }));
    expect(screen.queryByText('cover.png')).not.toBeInTheDocument();
    expect(objectUrls.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('leaves a text-only paste alone', async () => {
    render(<Composer onSubmit={vi.fn()} />);

    fireEvent.paste(screen.getByRole('textbox', { name: 'Message' }), {
      clipboardData: { files: [] },
    });

    expect(screen.queryByRole('group', { name: 'Attachments' })).not.toBeInTheDocument();
  });
});
