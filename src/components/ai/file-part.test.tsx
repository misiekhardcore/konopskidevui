import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { filePart, fileParts } from '../../testing/ai-parts';
import { FilePart } from './file-part';

import type { FilePartData } from './file-part';

/** jsdom ships neither object-URL function, nor a media element that plays. */
const createObjectURL = vi.fn(() => 'blob:file-part');
const revokeObjectURL = vi.fn();
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revokeObjectURL,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: play,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: pause,
  });
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  play.mockClear();
  pause.mockClear();
});

afterEach(() => {
  delete (URL as unknown as Record<string, unknown>).createObjectURL;
  delete (URL as unknown as Record<string, unknown>).revokeObjectURL;
  delete (HTMLMediaElement.prototype as unknown as Record<string, unknown>).play;
  delete (HTMLMediaElement.prototype as unknown as Record<string, unknown>).pause;
});

function audioOf(container: HTMLElement) {
  return container.querySelector('audio') as HTMLAudioElement;
}

/** Metadata is what turns the seek slider on and puts the duration on the clock. */
function load(audio: HTMLAudioElement, duration: number) {
  Object.defineProperty(audio, 'duration', { configurable: true, value: duration });
  fireEvent(audio, new Event('durationchange'));
}

describe('FilePart', () => {
  it('renders an image inline, named by its filename, with open and download', () => {
    render(<FilePart part={fileParts.image} />);

    expect(screen.getByRole('img', { name: 'forecast-chart.png' })).toHaveAttribute(
      'src',
      fileParts.image.url,
    );
    expect(screen.getByRole('link', { name: 'Open forecast-chart.png' })).toHaveAttribute(
      'href',
      fileParts.image.url,
    );

    const download = screen.getByRole('link', { name: 'Download forecast-chart.png' });

    expect(download).toHaveAttribute('href', fileParts.image.url);
    expect(download).toHaveAttribute('download', 'forecast-chart.png');
  });

  it('names an image from its media type when the part carries no filename', () => {
    const part = { ...fileParts.image, filename: undefined } as FilePartData;

    render(<FilePart part={part} />);

    expect(screen.getByRole('img', { name: 'PNG image' })).toBeInTheDocument();
  });

  it('plays an audio part in a control bar of its own', () => {
    const { container } = render(<FilePart part={fileParts.audio} />);
    const audio = audioOf(container);

    expect(audio).toHaveAttribute('src', fileParts.audio.url);
    expect(audio).toHaveAttribute('preload', 'metadata');
    expect(audio).not.toHaveAttribute('controls');

    expect(screen.getByRole('button', { name: 'Play forecast-briefing.mp3' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Seek forecast-briefing.mp3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mute forecast-briefing.mp3' })).toBeInTheDocument();
  });

  it('starts the media from the play button and follows it back to pause', async () => {
    const { container } = render(<FilePart part={fileParts.audio} />);
    const audio = audioOf(container);

    await userEvent.click(screen.getByRole('button', { name: 'Play forecast-briefing.mp3' }));

    expect(play).toHaveBeenCalledOnce();

    fireEvent(audio, new Event('play'));
    Object.defineProperty(audio, 'paused', { configurable: true, value: false });

    await userEvent.click(screen.getByRole('button', { name: 'Pause forecast-briefing.mp3' }));

    expect(pause).toHaveBeenCalledOnce();

    fireEvent(audio, new Event('pause'));

    expect(screen.getByRole('button', { name: 'Play forecast-briefing.mp3' })).toBeInTheDocument();
  });

  it('shows the position and the duration on the clock', () => {
    const { container } = render(<FilePart part={fileParts.audio} />);
    const audio = audioOf(container);

    load(audio, 20);
    audio.currentTime = 8;
    fireEvent(audio, new Event('timeupdate'));

    expect(screen.getByText('0:08 / 0:20')).toBeInTheDocument();
  });

  it('seeks the media to the position chosen on the slider', async () => {
    const { container } = render(<FilePart part={fileParts.audio} />);
    const audio = audioOf(container);

    load(audio, 20);

    const seek = screen.getByRole('slider', { name: 'Seek forecast-briefing.mp3' });

    seek.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(audio.currentTime).toBe(1);
    expect(screen.getByText('0:01 / 0:20')).toBeInTheDocument();
  });

  it('mutes the media and unmutes it again', async () => {
    const { container } = render(<FilePart part={fileParts.audio} />);
    const audio = audioOf(container);

    await userEvent.click(screen.getByRole('button', { name: 'Mute forecast-briefing.mp3' }));

    expect(audio.muted).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Unmute forecast-briefing.mp3' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Unmute forecast-briefing.mp3' }));

    expect(audio.muted).toBe(false);
  });

  it('plays a video part through the browser’s own controls', () => {
    render(<FilePart part={fileParts.video} />);

    const video = screen.getByLabelText('forecast-loop.mp4');

    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('src', fileParts.video.url);
  });

  it('renders any other media type as a read-only attachment with open and download', () => {
    const { container } = render(<FilePart part={fileParts.document} />);

    expect(container.querySelector('[data-slot="attachment"]')).toBeInTheDocument();
    expect(screen.getByText('forecast-report.pdf')).toBeInTheDocument();
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove/i })).toBeNull();

    const open = screen.getByRole('link', { name: 'Open forecast-report.pdf' });
    const download = screen.getByRole('link', { name: 'Download forecast-report.pdf' });

    expect(open).toHaveAttribute('href', fileParts.document.url);
    expect(download).toHaveAttribute('href', fileParts.document.url);
    expect(download).toHaveAttribute('download', 'forecast-report.pdf');
  });

  it('renders a named placeholder instead of an empty frame when the file has no data', () => {
    const part = { ...fileParts.image, url: '' } as FilePartData;

    const { container } = render(<FilePart part={part} />);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('forecast-chart.png')).toBeInTheDocument();
    expect(screen.getByText('File data is missing')).toBeInTheDocument();
  });

  it('names the placeholder from the media type when it has neither filename nor data', () => {
    const part = { type: 'file', mediaType: 'application/pdf', url: '' } as FilePartData;

    render(<FilePart part={part} />);

    expect(screen.getByText('PDF file')).toBeInTheDocument();
    expect(screen.getByText('File data is missing')).toBeInTheDocument();
  });

  it('leaves a hosted file at its own URL, with no object URL to clean up', () => {
    render(<FilePart part={fileParts.image} />);

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Open forecast-chart.png' })).toHaveAttribute(
      'href',
      fileParts.image.url,
    );
  });

  it('opens an embedded file through an object URL and revokes it on unmount', () => {
    const { unmount } = render(<FilePart part={filePart} />);

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Open forecast-chart.svg' })).toHaveAttribute(
      'href',
      'blob:file-part',
    );

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:file-part');
  });

  it('revokes the object URL of a part it no longer renders', () => {
    const { rerender } = render(<FilePart part={filePart} />);
    const replacement = {
      ...filePart,
      url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
    } as FilePartData;

    rerender(<FilePart part={replacement} />);

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:file-part');
    expect(createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('translates every string it shows', () => {
    render(
      <FilePart
        part={fileParts.document}
        labels={{ open: 'Otwórz {name}', download: 'Pobierz {name}', missing: 'Brak danych' }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Otwórz forecast-report.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pobierz forecast-report.pdf' })).toBeInTheDocument();
  });

  it('translates the noun a nameless file is called by', () => {
    const part = { ...fileParts.image, filename: undefined } as FilePartData;

    render(<FilePart part={part} labels={{ image: 'Obraz' }} />);

    expect(screen.getByRole('img', { name: 'PNG obraz' })).toBeInTheDocument();
  });
});
