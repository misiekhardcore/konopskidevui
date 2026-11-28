import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('opens the file picker from the attach control', async () => {
    const open = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    render(<Composer onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Attach files' }));

    expect(open).toHaveBeenCalledOnce();
    open.mockRestore();
  });

  it('leaves the attachments alone when the picker is cancelled', () => {
    const { container } = render(<Composer onSubmit={vi.fn()} />);

    fireEvent.change(fileInput(container));

    expect(screen.queryByRole('group', { name: 'Attachments' })).not.toBeInTheDocument();
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

/** One `SpeechRecognition` result, as the browser hands it over. */
type RecognitionEvent = {
  resultIndex: number;
  results: (ArrayLike<{ transcript: string }> & { isFinal: boolean })[];
};

/** The slice of `SpeechRecognition` the composer drives. */
class FakeSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onresult: ((event: RecognitionEvent) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    recognitions.push(this);
  }
}

let recognitions: FakeSpeechRecognition[] = [];

function provideSpeechRecognition() {
  recognitions = [];
  Object.defineProperty(window, 'SpeechRecognition', {
    configurable: true,
    value: FakeSpeechRecognition,
  });
}

function removeSpeechRecognition() {
  Reflect.deleteProperty(window, 'SpeechRecognition');
  Reflect.deleteProperty(window, 'webkitSpeechRecognition');
}

function dictate(recognition: FakeSpeechRecognition, transcript: string, isFinal = true) {
  act(() => {
    recognition.onresult?.({
      resultIndex: 0,
      results: [Object.assign([{ transcript }], { isFinal })],
    });
  });
}

function dictateResults(
  recognition: FakeSpeechRecognition,
  transcripts: string[],
  resultIndex: number,
) {
  act(() => {
    recognition.onresult?.({
      resultIndex,
      results: transcripts.map((transcript) => Object.assign([{ transcript }], { isFinal: true })),
    });
  });
}

describe('PromptInput voice input', () => {
  afterEach(() => {
    removeSpeechRecognition();
  });

  it('shows no microphone unless voice input is asked for', () => {
    provideSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /voice input/i })).not.toBeInTheDocument();
  });

  it('hides the microphone where the browser has no speech recognition', () => {
    removeSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} voiceInput />);

    expect(screen.queryByRole('button', { name: /voice input/i })).not.toBeInTheDocument();
  });

  it('dictates a final transcript into the draft and ignores interim ones', async () => {
    provideSpeechRecognition();
    const onValueChange = vi.fn();
    render(<Composer onSubmit={vi.fn()} onValueChange={onValueChange} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));

    expect(recognitions).toHaveLength(1);
    const [recognition] = recognitions;
    expect(recognition.start).toHaveBeenCalledOnce();
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);

    dictate(recognition, 'Kraków', false);
    expect(onValueChange).not.toHaveBeenCalled();

    dictate(recognition, 'Kraków');
    expect(onValueChange).toHaveBeenLastCalledWith('Kraków');

    dictate(recognition, 'forecast');
    expect(onValueChange).toHaveBeenLastCalledWith('Kraków forecast');
  });

  it('appends only the results a continuous session has not reported yet', async () => {
    provideSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));
    dictateResults(recognitions[0], ['Weather', 'tomorrow'], 1);

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('tomorrow');
  });

  it('accepts the webkit-prefixed recognition Safari ships', async () => {
    recognitions = [];
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      value: FakeSpeechRecognition,
    });
    render(<Composer onSubmit={vi.fn()} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));

    expect(recognitions).toHaveLength(1);
  });

  it('returns to idle when recognition reports an error', async () => {
    provideSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));
    act(() => recognitions[0].onerror?.());

    expect(screen.getByRole('button', { name: 'Start voice input' })).toBeInTheDocument();
  });

  it('continues a draft that already has text in it', async () => {
    provideSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} value="Weather" voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));
    dictate(recognitions[0], 'tomorrow');

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Weather tomorrow');
  });

  it('stops dictating when the microphone is pressed again', async () => {
    provideSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));

    const listening = screen.getByRole('button', { name: 'Stop voice input' });
    expect(listening).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(listening);

    expect(recognitions[0].stop).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Start voice input' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('goes back to idle when the browser ends the session on its own', async () => {
    provideSpeechRecognition();
    render(<Composer onSubmit={vi.fn()} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));
    act(() => recognitions[0].onend?.());

    expect(screen.getByRole('button', { name: 'Start voice input' })).toBeInTheDocument();
  });

  it('aborts the microphone when the composer unmounts', async () => {
    provideSpeechRecognition();
    const { unmount } = render(<Composer onSubmit={vi.fn()} voiceInput />);

    await userEvent.click(screen.getByRole('button', { name: 'Start voice input' }));
    unmount();

    expect(recognitions[0].abort).toHaveBeenCalledOnce();
  });
});

describe('PromptInput auto-read toggle', () => {
  it('shows no speaker unless the app takes the toggle', () => {
    render(<Composer onSubmit={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /reading responses aloud/i }),
    ).not.toBeInTheDocument();
  });

  it('shows no speaker for the state alone, because the app must act on it', () => {
    render(<Composer onSubmit={vi.fn()} readAloud />);

    expect(
      screen.queryByRole('button', { name: /reading responses aloud/i }),
    ).not.toBeInTheDocument();
  });

  it('asks the app to start reading responses aloud', async () => {
    const onReadAloudChange = vi.fn();
    render(<Composer onSubmit={vi.fn()} onReadAloudChange={onReadAloudChange} />);

    const speaker = screen.getByRole('button', { name: 'Read responses aloud' });
    expect(speaker).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(speaker);

    expect(onReadAloudChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('asks the app to stop when responses are already read aloud', async () => {
    const onReadAloudChange = vi.fn();
    render(<Composer onSubmit={vi.fn()} readAloud onReadAloudChange={onReadAloudChange} />);

    const speaker = screen.getByRole('button', { name: 'Stop reading responses aloud' });
    expect(speaker).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(speaker);

    expect(onReadAloudChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("follows the app's answer instead of toggling itself", async () => {
    const onReadAloudChange = vi.fn();

    render(
      <PromptInput
        value=""
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        readAloud={false}
        onReadAloudChange={onReadAloudChange}
      />,
    );

    const speaker = screen.getByRole('button', { name: 'Read responses aloud' });
    await userEvent.click(speaker);

    expect(onReadAloudChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(speaker).toHaveAttribute('aria-pressed', 'false');
  });

  it('names the speaker through labels', () => {
    render(
      <Composer
        onSubmit={vi.fn()}
        readAloud
        onReadAloudChange={() => {}}
        labels={{ read: 'Czytaj odpowiedzi', stopReading: 'Przestań czytać odpowiedzi' }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Przestań czytać odpowiedzi' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
