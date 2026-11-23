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

// The player's popups use the native `popover` attribute, which jsdom does not
// implement, so Testing Library treats their contents as hidden.
async function chooseQuality(label: string) {
  await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /quality/i, hidden: true }));
  await userEvent.click(await screen.findByRole('menuitemradio', { name: label, hidden: true }));
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

  it('draws no chapter line when there is one rendition', () => {
    const { container } = renderVideo({ renditions: [{ src: '/only.mp4', height: 720 }] });

    expect(videoElement(container)).toHaveAttribute('src', '/only.mp4');
    expect(container.querySelector('[data-slot="video-footer"]')).toBeNull();
  });

  it('names the chapter when there is one rendition', () => {
    renderVideo({ renditions: [{ src: '/only.mp4', height: 720 }], chapters });

    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });

  it('offers the settings menu without a chapter line', () => {
    const { container } = renderVideo();

    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="video-footer"]')).toBeNull();
  });

  it('keeps the quality choice in the settings menu', async () => {
    renderVideo();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    const settings = within(await screen.findByRole('menu', { hidden: true }));
    const qualityRow = settings.getByRole('menuitem', { name: /quality/i, hidden: true });
    expect(qualityRow).toBeInTheDocument();
    expect(settings.queryByRole('menuitemradio', { hidden: true })).toBeNull();

    await userEvent.click(qualityRow);

    await screen.findByRole('menuitemradio', { name: 'Auto', hidden: true });
    expect(
      screen.getAllByRole('menuitemradio', { hidden: true }).map((item) => item.textContent),
    ).toEqual(['Auto', '1080p', '720p']);
  });

  it('swaps the source when a quality is chosen and does not switch back', async () => {
    const { container } = renderVideo();

    await chooseQuality('720p');

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
  });

  it('stays on the chosen quality when the viewport changes', async () => {
    const { container, rerender } = renderVideo();

    await chooseQuality('720p');

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1600 });
    rerender(<Video title={title} renditions={renditions} poster="/poster.jpg" />);

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
  });

  it('does nothing when the current quality is chosen again', async () => {
    const { container } = renderVideo();

    await chooseQuality('Auto');

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

    await chooseQuality('720p');

    expect(video.currentTime).toBe(12);
  });

  it('keeps the playback position and resumes when the source swaps', async () => {
    const { container } = renderVideo();
    const video = videoElement(container);
    const play = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(video, 'play', { configurable: true, value: play });
    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(false);
    video.currentTime = 42;

    await chooseQuality('720p');
    fireEvent(video, new Event('loadedmetadata'));

    expect(video.currentTime).toBe(42);
    expect(play).toHaveBeenCalled();
  });

  it('starts Auto on the smaller file for a phone viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });

    const { container } = renderVideo();

    expect(videoElement(container)).toHaveAttribute('src', '/video-720.mp4');
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
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
