import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Video } from './video';

import type * as React from 'react';

const title = 'Installing the design system';

const renditions = [
  { src: '/video-1080.mp4', height: 1080 },
  { src: '/video-720.mp4', height: 720 },
];

const chapters = [
  { startTime: 0, title: 'Introduction' },
  { startTime: 30, title: 'Installing' },
];

const captionTrack = {
  src: '/captions.vtt',
  label: 'English',
  language: 'en',
};

function renderVideo(props: Partial<React.ComponentProps<typeof Video>> = {}) {
  return render(<Video title={title} renditions={renditions} poster="/poster.jpg" {...props} />);
}

function videoElement(container: HTMLElement) {
  return container.querySelector('video') as HTMLVideoElement;
}

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'connection');
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
});

describe('Video', () => {
  it('renders a labelled player with its poster and inline playback', () => {
    const { container } = renderVideo();

    const video = screen.getByLabelText(title);

    expect(video).toBe(videoElement(container));
    expect(video).toHaveAttribute('poster', '/poster.jpg');
    expect(video).toHaveAttribute('playsinline');
  });

  it('shows the poster before playback', () => {
    const { container } = renderVideo();

    expect(container.querySelector('img')).toHaveAttribute('src', '/poster.jpg');
  });

  it('renders a caption track the player can select', () => {
    const { container } = renderVideo({ captionTrack });

    const track = container.querySelector('track');

    expect(track).toHaveAttribute('kind', 'captions');
    expect(track).toHaveAttribute('src', '/captions.vtt');
    expect(track).toHaveAttribute('label', 'English');
    expect(track).toHaveAttribute('srclang', 'en');
    expect(track).toHaveAttribute('default');
  });

  it('leaves captions off when the descriptor does not ask for them', () => {
    const { container } = renderVideo({ captionTrack: { ...captionTrack, default: false } });

    expect(container.querySelector('track')).not.toHaveAttribute('default');
  });

  it('has no caption track without a descriptor', () => {
    const { container } = renderVideo();

    expect(container.querySelector('track')).toBeNull();
  });

  it('names the current chapter while the video plays', () => {
    renderVideo({ chapters });

    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('shows no quality menu and no chapter line without chapters when there is one rendition', () => {
    const { container } = renderVideo({ renditions: [{ src: '/only.mp4', height: 720 }] });

    expect(screen.queryByRole('button', { name: /quality/i })).toBeNull();
    expect(container.querySelector('[data-slot="video-footer"]')).toBeNull();
  });

  it('names the chapter without a quality menu when there is one rendition', () => {
    renderVideo({ renditions: [{ src: '/only.mp4', height: 720 }], chapters });

    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /quality/i })).toBeNull();
  });

  it('offers the quality menu without a chapter line', () => {
    const { container } = renderVideo();

    expect(screen.getByRole('button', { name: 'Quality: Auto' })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="video-footer"]')).not.toBeNull();
  });

  it('offers Auto, 1080p and 720p and names the menu after its value', async () => {
    renderVideo();

    const trigger = screen.getByRole('button', { name: 'Quality: Auto' });
    await userEvent.click(trigger);

    const menu = within(await screen.findByRole('menu'));
    expect(menu.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual([
      'Auto',
      '1080p',
      '720p',
    ]);
  });

  it('swaps the source when a quality is chosen and does not switch back', async () => {
    const { container } = renderVideo();

    await userEvent.click(screen.getByRole('button', { name: 'Quality: Auto' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: '720p' }));

    expect(screen.getByRole('button', { name: 'Quality: 720p' })).toBeInTheDocument();
    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
  });

  it('stays on the chosen quality when the viewport changes', async () => {
    const { container, rerender } = renderVideo();

    await userEvent.click(screen.getByRole('button', { name: 'Quality: Auto' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: '720p' }));

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1600 });
    rerender(<Video title={title} renditions={renditions} poster="/poster.jpg" />);

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
  });

  it('does nothing when the current quality is chosen again', async () => {
    const { container } = renderVideo();

    await userEvent.click(screen.getByRole('button', { name: 'Quality: Auto' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Auto' }));

    expect(videoElement(container)).toHaveAttribute('src', '/video-1080.mp4');
  });

  it('restores the position at once when the new source already has metadata', async () => {
    const { container } = renderVideo();
    const video = videoElement(container);

    Object.defineProperty(video, 'readyState', {
      configurable: true,
      value: HTMLMediaElement.HAVE_METADATA,
    });
    video.currentTime = 12;

    await userEvent.click(screen.getByRole('button', { name: 'Quality: Auto' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: '720p' }));

    expect(video.currentTime).toBe(12);
  });

  it('keeps the playback position and resumes when the source swaps', async () => {
    const { container } = renderVideo();
    const video = videoElement(container);
    const play = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(video, 'play', { configurable: true, value: play });
    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(false);
    video.currentTime = 42;

    await userEvent.click(screen.getByRole('button', { name: 'Quality: Auto' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: '720p' }));
    fireEvent(video, new Event('loadedmetadata'));

    expect(video.currentTime).toBe(42);
    expect(play).toHaveBeenCalled();
  });

  it('starts Auto on the smaller file for a phone viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });

    const { container } = renderVideo();

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
    expect(screen.getByRole('button', { name: 'Quality: Auto' })).toBeInTheDocument();
  });

  it('starts Auto on the smaller file when save-data is on', () => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    });

    const { container } = renderVideo();

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
  });

  it('starts Auto on the smaller file on a slow connection', () => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '3g' },
    });

    const { container } = renderVideo();

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
  });

  it('starts Auto on the larger file for a desktop viewport', () => {
    const { container } = renderVideo();

    expect(videoElement(container)).toHaveAttribute('src', '/video-1080.mp4');
  });

  it('renders nothing without a rendition to play', () => {
    const { container } = renderVideo({ renditions: [] });

    expect(container).toBeEmptyDOMElement();
  });
});
