import * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { PromptInput, type PromptInputProps } from './prompt-input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/PromptInput',
  component: PromptInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A chat composer: the draft is the app’s state, Enter submits and Shift+Enter inserts a newline, the send control becomes stop while the answer streams, and files chosen or pasted are previewed as attachments and handed back as browser `File`s. The textarea grows with its content up to a limit and then scrolls.',
      },
    },
  },
  argTypes: {
    value: { control: false, table: { category: 'Data' } },
    onValueChange: { control: false, table: { category: 'Handlers' } },
    onSubmit: { control: false, table: { category: 'Handlers' } },
    onStop: { control: false, table: { category: 'Handlers' } },
    status: {
      control: 'inline-radio',
      options: ['ready', 'submitted', 'streaming', 'error'],
      description: 'The chat status; `streaming` replaces send with stop.',
      table: { category: 'State', defaultValue: { summary: 'ready' } },
    },
    maxHeight: {
      control: { type: 'number' },
      description: 'The height the textarea grows to before it scrolls, in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '200' } },
    },
    voiceInput: {
      control: 'boolean',
      description:
        'Adds a microphone that dictates into the draft. Hidden where the browser has no speech recognition.',
      table: { category: 'Speech', defaultValue: { summary: 'false' } },
    },
    readAloud: {
      control: 'boolean',
      description:
        'Whether responses are read aloud automatically. Controlled by the app; providing `onReadAloudChange` renders the speaker.',
      table: { category: 'Speech', defaultValue: { summary: 'false' } },
    },
    onReadAloudChange: { control: false, table: { category: 'Handlers' } },
    labels: { control: 'object', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    value: '',
    onValueChange: () => {},
    onSubmit: () => {},
    status: 'ready',
    maxHeight: 200,
    voiceInput: false,
  },
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The draft, the send result and the stop request live in the app, so each
 * playground story is the same small harness an app would write.
 */
function ComposerPlayground({
  status,
  maxHeight,
  labels,
  onStop,
  voiceInput,
  readAloud,
}: Pick<
  PromptInputProps,
  'status' | 'maxHeight' | 'labels' | 'onStop' | 'voiceInput' | 'readAloud'
>) {
  const [value, setValue] = React.useState('');
  const [sent, setSent] = React.useState('');
  // The speaker is opt-in twice over: the app asks for one by owning the state,
  // and the app does the speaking, because only the app has the responses.
  const [autoRead, setAutoRead] = React.useState(readAloud ?? false);
  const speaker =
    readAloud === undefined ? {} : { readAloud: autoRead, onReadAloudChange: setAutoRead };

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <PromptInput
        value={value}
        onValueChange={setValue}
        onSubmit={({ text }) => {
          setSent(text);
          setValue('');
        }}
        onStop={onStop}
        status={status}
        maxHeight={maxHeight}
        labels={labels}
        voiceInput={voiceInput}
        {...speaker}
      />
      {sent ? (
        <p data-slot="sent-prompt" className="text-sm text-muted-foreground">
          Sent: {sent}
        </p>
      ) : null}
    </div>
  );
}

/** Enter submits the draft, and the app clears it. */
export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Message' });

    await userEvent.type(textarea, 'Forecast for Kraków?');
    await expect(canvas.getByRole('button', { name: 'Send message' })).toBeEnabled();

    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByText('Sent: Forecast for Kraków?')).toBeInTheDocument();
    await expect(textarea).toHaveValue('');
  },
};

/** Shift+Enter is a newline, so a prompt can be more than one line. */
export const Multiline: Story = {
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Message' });

    await userEvent.type(textarea, 'First line');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.keyboard('Second line');

    await expect(textarea).toHaveValue('First line\nSecond line');
    await expect(canvas.queryByText(/^Sent:/)).toBeNull();
  },
};

/** While the answer streams, the send control is a stop control instead. */
export const Streaming: Story = {
  args: { status: 'streaming', onStop: fn() },
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const stop = canvas.getByRole('button', { name: 'Stop generating' });

    await expect(canvas.queryByRole('button', { name: 'Send message' })).toBeNull();

    await userEvent.click(stop);

    await expect(args.onStop).toHaveBeenCalledOnce();
  },
};

/**
 * Opt-in speech controls: a microphone that dictates into the draft (where the
 * browser supports recognition) and a speaker that toggles whether the app reads
 * its responses aloud. The speaker exists here because the story owns its state;
 * speaking the responses belongs to the app.
 */
export const VoiceAndReadAloud: Story = {
  args: { voiceInput: true, readAloud: false },
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const off = canvas.getByRole('button', { name: 'Read responses aloud' });

    await expect(off).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(off);

    await expect(
      canvas.getByRole('button', { name: 'Stop reading responses aloud' }),
    ).toHaveAttribute('aria-pressed', 'true');

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      await expect(canvas.getByRole('button', { name: 'Start voice input' })).toBeInTheDocument();
    }
  },
};

/** Files chosen from the picker preview through `Attachment` and can be removed. */
export const Attachments: Story = {
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const picker = canvasElement.querySelector('input[type="file"]');
    const image = new File([new Uint8Array([137, 80, 78, 71])], 'cover.png', {
      type: 'image/png',
    });

    await userEvent.upload(picker as HTMLInputElement, image);

    await expect(canvas.getByText('cover.png')).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Attachments' })).toBeInTheDocument();

    const preview = canvasElement.querySelector('[data-slot="attachment-media"] img');
    await expect(preview?.getAttribute('src')?.startsWith('blob:')).toBe(true);

    await userEvent.click(canvas.getByRole('button', { name: 'Remove cover.png' }));

    await expect(canvas.queryByText('cover.png')).toBeNull();
  },
};

/** The textarea grows with the draft, then stops at `maxHeight` and scrolls. */
export const GrowsThenScrolls: Story = {
  args: { maxHeight: 120 },
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Message' });

    await expect(textarea.clientHeight).toBeLessThan(120);

    const lines = Array.from({ length: 12 }, (_, line) => `Line ${line}`);
    await userEvent.type(textarea, lines.map((line) => `${line}{Shift>}{Enter}{/Shift}`).join(''));

    // `max-height` is a border-box height, so the client box stays just under it.
    await waitFor(() => expect(textarea.clientHeight).toBeLessThanOrEqual(120));
    await expect(textarea.clientHeight).toBeGreaterThan(100);
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  },
};

/** Every string is a label, so the composer can be translated. */
export const CustomLabels: Story = {
  args: {
    labels: {
      message: 'Wiadomość',
      send: 'Wyślij wiadomość',
      stop: 'Zatrzymaj generowanie',
      attach: 'Dołącz pliki',
      attachments: 'Załączniki',
      remove: 'Usuń {name}',
      voice: 'Rozpocznij dyktowanie',
      stopVoice: 'Zatrzymaj dyktowanie',
      read: 'Czytaj odpowiedzi na głos',
      stopReading: 'Przestań czytać odpowiedzi',
    },
  },
  render: (args) => <ComposerPlayground {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox', { name: 'Wiadomość' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Dołącz pliki' })).toBeInTheDocument();
  },
};
