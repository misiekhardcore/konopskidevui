'use client';

import { cn } from 'cn';
import {
  FileIcon,
  MicIcon,
  MicOffIcon,
  PaperclipIcon,
  SendIcon,
  SquareIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from 'lucide-react';
import * as React from 'react';

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '../ui/attachment';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

/** The chat status the composer reads: `streaming` turns send into stop. */
export type PromptInputStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/** Every user-facing string, so the composer can be translated without a fork. */
export type PromptInputLabels = {
  /** The textarea's accessible name. */
  message: string;
  /** The submit control's accessible name. */
  send: string;
  /** The stop control's accessible name, shown while the status is streaming. */
  stop: string;
  /** The attach control's accessible name. */
  attach: string;
  /** The attachment row's accessible name. */
  attachments: string;
  /** An attachment's remove action; `{name}` is where the file's name goes. */
  remove: string;
  /** The microphone's accessible name while dictation is idle. */
  voice: string;
  /** The microphone's accessible name while dictation is listening. */
  stopVoice: string;
  /** The speaker's accessible name while responses are not read automatically. */
  read: string;
  /** The speaker's accessible name while responses are read automatically. */
  stopReading: string;
};

const DEFAULT_LABELS: PromptInputLabels = {
  message: 'Message',
  send: 'Send message',
  stop: 'Stop generating',
  attach: 'Attach files',
  attachments: 'Attachments',
  remove: 'Remove {name}',
  voice: 'Start voice input',
  stopVoice: 'Stop voice input',
  read: 'Read responses aloud',
  stopReading: 'Stop reading responses aloud',
};

/** What the app receives on submit: plain text and the browser's own files. */
export type PromptInputSubmission = {
  text: string;
  files: File[];
};

/** How tall the textarea may grow before it scrolls, in pixels. */
const DEFAULT_MAX_HEIGHT = 200;

/** One chosen file and the object URL its preview reads. */
type PromptAttachment = {
  id: string;
  file: File;
  url: string;
};

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** A file's size in the unit a reader expects, never a raw byte count. */
function formatFileSize(bytes: number): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${unit === 0 ? value : Math.round(value * 10) / 10} ${SIZE_UNITS[unit]}`;
}

/** `text/plain · 2.4 KB`, so two files of the same name still read differently. */
function describeFile(file: File): string {
  return `${file.type || 'File'} · ${formatFileSize(file.size)}`;
}

/** An action's accessible name, with the file's name where the label asks for it. */
function actionLabelOf(template: string, name: string): string {
  return template.replace('{name}', name);
}

export type PromptInputProps = Omit<React.ComponentProps<'form'>, 'onSubmit' | 'children'> & {
  /** The draft, controlled by the app. */
  value: string;
  /** Called with the whole next draft on every edit. */
  onValueChange: (value: string) => void;
  /** Called on Enter or the send control, with the trimmed text and the files. */
  onSubmit: (submission: PromptInputSubmission) => void;
  /** Called by the stop control, which replaces send while streaming. */
  onStop?: () => void;
  /** The chat status; only `streaming` changes the control. */
  status?: PromptInputStatus;
  /** The height the textarea grows to before it scrolls. */
  maxHeight?: number;
  /**
   * Show the microphone. The composer never records anything: the app does the
   * recording and hands the text back through `onValueChange`, so dictation is
   * as free a choice as the model behind it.
   */
  voiceInput?: boolean;
  /** Whether dictation is running. Controlled by the app, like the draft. */
  listening?: boolean;
  /**
   * Called with the next dictation state when the microphone is pressed. The
   * app starts or stops its own recorder from it and appends whatever it
   * transcribes through `onValueChange`.
   */
  onListeningChange?: (listening: boolean) => void;
  /** Whether responses are read aloud automatically. Controlled by the app, like the draft. */
  readAloud?: boolean;
  /**
   * Called with the next auto-read setting when the speaker is pressed. Providing
   * it renders the speaker; speaking the responses is the app's job, because only
   * the app has them.
   */
  onReadAloudChange?: (readAloud: boolean) => void;
  /** Override the strings shown, one at a time. */
  labels?: Partial<PromptInputLabels>;
};

/**
 * A chat composer: the draft is the app's state, Enter submits it and
 * Shift+Enter inserts a newline, and the send control becomes stop while the
 * answer streams. Files chosen from the picker or pasted into the textarea are
 * previewed as attachments and handed back as browser files, so the app — not
 * this component — decides how they become SDK file parts. Opt-in speech
 * controls add a microphone that toggles the app's own dictation through
 * `listening`, and a speaker that toggles whether the app reads its responses
 * aloud; the composer records and speaks nothing itself. The textarea grows with
 * its content up to a limit and then scrolls.
 */
function PromptInput({
  value,
  onValueChange,
  onSubmit,
  onStop,
  status = 'ready',
  maxHeight = DEFAULT_MAX_HEIGHT,
  voiceInput = false,
  listening: listeningProp,
  onListeningChange,
  readAloud = false,
  onReadAloudChange,
  labels,
  className,
  ...props
}: PromptInputProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const inputId = React.useId();
  const pickerRef = React.useRef<HTMLInputElement>(null);
  const nextId = React.useRef(0);
  const createdUrls = React.useRef(new Set<string>());
  const [attachments, setAttachments] = React.useState<PromptAttachment[]>([]);
  const [selfListening, setSelfListening] = React.useState(false);

  // Dictation is controlled when the app passes `listening` and self-managed
  // otherwise, so a composer without an app recorder still shows its state.
  const listening = listeningProp ?? selfListening;
  const streaming = status === 'streaming';
  const canSubmit = !streaming && value.trim().length > 0;

  // Every object URL the composer ever created is revoked when it unmounts,
  // including one whose attachment is still on screen at that moment.
  React.useEffect(() => {
    const urls = createdUrls.current;

    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  function revoke(url: string) {
    if (!url) return;

    URL.revokeObjectURL(url);
    createdUrls.current.delete(url);
  }

  function addFiles(files: File[]) {
    if (files.length === 0) return;

    setAttachments((current) => [
      ...current,
      ...files.map((file) => {
        const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '';

        if (url) createdUrls.current.add(url);

        return { id: `prompt-input-${inputId}-${nextId.current++}`, file, url };
      }),
    ]);
  }

  function removeAttachment(id: string) {
    const removed = attachments.find((attachment) => attachment.id === id);

    if (removed) revoke(removed.url);

    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  function clearAttachments() {
    for (const attachment of attachments) revoke(attachment.url);

    setAttachments([]);
  }

  // Recording belongs to the app: the composer only says which way the toggle
  // should go, and the app decides whether it can record at all by showing it.
  function requestListening(next: boolean) {
    if (listeningProp === undefined) setSelfListening(next);

    onListeningChange?.(next);
  }

  function submit() {
    if (!canSubmit) return;

    onSubmit({ text: value.trim(), files: attachments.map(({ file }) => file) });
    clearAttachments();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter submits; Shift+Enter is the textarea's own newline. A key press
    // that is still composing (an IME candidate) belongs to the IME, not to us.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = [...(event.clipboardData?.files ?? [])];

    if (files.length === 0) return;

    event.preventDefault();
    addFiles(files);
  }

  return (
    <form
      data-slot="prompt-input"
      data-status={status}
      className={cn('flex w-full min-w-0 flex-col gap-2', className)}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      {...props}
    >
      {attachments.length > 0 ? (
        <AttachmentGroup role="group" aria-label={text.attachments}>
          {attachments.map(({ id, file, url }) => {
            const isImage = file.type.startsWith('image/');

            return (
              <Attachment key={id} size="sm">
                <AttachmentMedia variant={isImage ? 'image' : 'icon'}>
                  {isImage ? <img src={url} alt="" /> : <FileIcon aria-hidden="true" />}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{file.name}</AttachmentTitle>
                  <AttachmentDescription>{describeFile(file)}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction
                    aria-label={actionLabelOf(text.remove, file.name)}
                    onClick={() => removeAttachment(id)}
                  >
                    <XIcon aria-hidden="true" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            );
          })}
        </AttachmentGroup>
      ) : null}

      <label htmlFor={inputId} className="sr-only">
        {text.message}
      </label>
      <Textarea
        id={inputId}
        autoHeight
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ maxHeight }}
        className="min-h-20 resize-none overflow-y-auto"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={pickerRef}
            type="file"
            multiple
            tabIndex={-1}
            aria-label={text.attach}
            className="sr-only"
            onChange={(event) => {
              addFiles([...(event.target.files ?? [])]);
              // The same file can be picked again after it was removed.
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-slot="prompt-input-attach"
            aria-label={text.attach}
            onClick={() => pickerRef.current?.click()}
          >
            <PaperclipIcon aria-hidden="true" />
          </Button>
          {voiceInput ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-slot="prompt-input-voice"
              aria-label={listening ? text.stopVoice : text.voice}
              aria-pressed={listening}
              onClick={() => requestListening(!listening)}
            >
              {listening ? <MicOffIcon aria-hidden="true" /> : <MicIcon aria-hidden="true" />}
            </Button>
          ) : null}
          {onReadAloudChange ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-slot="prompt-input-read"
              aria-label={readAloud ? text.stopReading : text.read}
              aria-pressed={readAloud}
              onClick={() => onReadAloudChange(!readAloud)}
            >
              {readAloud ? <VolumeXIcon aria-hidden="true" /> : <Volume2Icon aria-hidden="true" />}
            </Button>
          ) : null}
        </div>

        {streaming ? (
          <Button
            type="button"
            size="icon"
            data-slot="prompt-input-stop"
            aria-label={text.stop}
            onClick={onStop}
          >
            <SquareIcon aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            data-slot="prompt-input-send"
            aria-label={text.send}
            disabled={!canSubmit}
          >
            <SendIcon aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}

export { PromptInput };
