import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Audio } from './audio';

import type * as React from 'react';

const title = 'forecast-briefing.mp3';
const src = '/forecast-briefing.mp3';

/** jsdom ships no media element that plays, so the suite provides one. */
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
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
  play.mockClear();
  pause.mockClear();
});

afterEach(() => {
  delete (HTMLMediaElement.prototype as unknown as Record<string, unknown>).play;
  delete (HTMLMediaElement.prototype as unknown as Record<string, unknown>).pause;
});

function renderAudio(props: Partial<React.ComponentProps<typeof Audio>> = {}) {
  return render(<Audio title={title} src={src} {...props} />);
}

function audioOf(container: HTMLElement) {
  return container.querySelector('audio') as HTMLAudioElement;
}

/** Metadata is what turns the seek slider on and puts the duration on the clock. */
function load(audio: HTMLAudioElement, duration: number) {
  Object.defineProperty(audio, 'duration', { configurable: true, value: duration });
  fireEvent(audio, new Event('durationchange'));
}

describe('Audio', () => {
  it('plays the file through its own control bar, not the browser widget', () => {
    const { container } = renderAudio();
    const audio = audioOf(container);

    expect(audio).toHaveAttribute('src', src);
    expect(audio).toHaveAttribute('preload', 'metadata');
    expect(audio).not.toHaveAttribute('controls');

    expect(screen.getByRole('button', { name: `Play ${title}` })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: `Seek ${title}` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Mute ${title}` })).toBeInTheDocument();
  });

  it('starts the media from the play button and follows it back to pause', async () => {
    const { container } = renderAudio();
    const audio = audioOf(container);

    await userEvent.click(screen.getByRole('button', { name: `Play ${title}` }));

    expect(play).toHaveBeenCalledOnce();

    fireEvent(audio, new Event('play'));
    Object.defineProperty(audio, 'paused', { configurable: true, value: false });

    await userEvent.click(screen.getByRole('button', { name: `Pause ${title}` }));

    expect(pause).toHaveBeenCalledOnce();

    fireEvent(audio, new Event('pause'));

    expect(screen.getByRole('button', { name: `Play ${title}` })).toBeInTheDocument();
  });

  it('shows the position and the duration on the clock', () => {
    const { container } = renderAudio();
    const audio = audioOf(container);

    load(audio, 20);
    audio.currentTime = 8;
    fireEvent(audio, new Event('timeupdate'));

    expect(screen.getByText('0:08 / 0:20')).toBeInTheDocument();
  });

  it('seeks the media to the position chosen on the slider', async () => {
    const { container } = renderAudio();
    const audio = audioOf(container);

    load(audio, 20);

    const seek = screen.getByRole('slider', { name: `Seek ${title}` });

    seek.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(audio.currentTime).toBe(1);
    expect(screen.getByText('0:01 / 0:20')).toBeInTheDocument();
  });

  it('mutes the media and unmutes it again', async () => {
    const { container } = renderAudio();
    const audio = audioOf(container);

    await userEvent.click(screen.getByRole('button', { name: `Mute ${title}` }));

    expect(audio.muted).toBe(true);
    expect(screen.getByRole('button', { name: `Unmute ${title}` })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: `Unmute ${title}` }));

    expect(audio.muted).toBe(false);
  });

  it('takes every control name from a label, so an app can translate the bar', () => {
    renderAudio({
      labels: {
        play: 'Odtwórz briefing',
        pause: 'Wstrzymaj briefing',
        seek: 'Przewiń briefing',
        mute: 'Wycisz briefing',
        unmute: 'Włącz dźwięk',
      },
    });

    expect(screen.getByRole('button', { name: 'Odtwórz briefing' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Przewiń briefing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wycisz briefing' })).toBeInTheDocument();
  });
});
