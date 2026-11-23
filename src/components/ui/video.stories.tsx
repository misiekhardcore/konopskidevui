import '@videojs/react/video/skin.css';

import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import captionsUrl from '../../stories/assets/captions.vtt?url';
import videoSample from '../../stories/assets/video-sample.mp4?url';
import { Video } from './video';

import type { Meta, StoryObj } from '@storybook/react-vite';

const poster =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#1d2329"/><text x="640" y="372" font-family="sans-serif" font-size="56" fill="#e6e9ec" text-anchor="middle">Installing the design system</text></svg>',
  );

// A distinct URL per rendition, so choosing one really reloads the media.
const renditions = [
  { src: `${videoSample}?rendition=1080`, height: 1080 },
  { src: `${videoSample}?rendition=720`, height: 720 },
];

const chapters = [
  { startTime: 0, title: 'Introduction' },
  { startTime: 2, title: 'Installing' },
];

const captionTrack = {
  src: captionsUrl,
  label: 'English',
  language: 'en',
};

const meta = {
  title: 'Components/Video',
  component: Video,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A 16:9 player built on Video.js 10, styled by the design tokens. Auto starts on the file the viewport and connection can use, the chapter list becomes segments on the timeline, and a caption descriptor becomes a selectable WebVTT track. Deep-import the component and load `@videojs/react/video/skin.css` once.',
      },
    },
  },
  argTypes: {
    title: { control: 'text', table: { category: 'Content' } },
    poster: { control: 'text', table: { category: 'Content' } },
    renditions: {
      control: false,
      description: 'One encoded file per quality, named by its height.',
      table: { category: 'Content' },
    },
    chapters: {
      control: false,
      description: 'Named time ranges, drawn as segments on the timeline.',
      table: { category: 'Content' },
    },
    captionTrack: {
      control: false,
      description: 'The WebVTT track a reader can turn on.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    title: 'Installing the design system',
    renditions,
    poster,
    chapters,
    captionTrack,
  },
} satisfies Meta<typeof Video>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="w-[42rem]">
      <Video {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const video = canvasElement.querySelector('video') as HTMLVideoElement;

    await waitFor(() =>
      expect(video.readyState).toBeGreaterThanOrEqual(HTMLMediaElement.HAVE_METADATA),
    );

    // The cues come from `stories/assets/captions.vtt`; a missing file leaves the
    // track showing with no text and no error anywhere.
    const captions = Array.from(video.textTracks).find((track) => track.kind === 'captions');
    await waitFor(() => expect(captions?.cues).toHaveLength(4));

    // The skin hides its control bar until playback starts, so its buttons are
    // asserted as rendered rather than as visible controls.
    for (const label of [
      'Play',
      'Mute',
      'Disable captions',
      'Enter fullscreen',
      'Enter picture-in-picture',
    ]) {
      expect(canvasElement.querySelector(`button[aria-label="${label}"]`)).not.toBeNull();
    }

    // Two chapters in a four-second file: one segment each, once metadata loads.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.media-time-slider-chapter')).toHaveLength(2),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Quality: Auto' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: '720p' }));

    await expect(await canvas.findByRole('button', { name: 'Quality: 720p' })).toBeInTheDocument();
  },
};

/** A single rendition has no choice to offer, so no quality menu is drawn. */
export const SingleRendition: Story = {
  args: { renditions: [{ src: videoSample, height: 720 }] },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Introduction');
    expect(canvas.queryByRole('button', { name: /quality/i })).toBeNull();
  },
};

/** Without chapters the player keeps its timeline and drops the chapter line. */
export const WithoutChapters: Story = {
  args: { chapters: undefined },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Quality: Auto' });
    expect(canvas.queryByText('Introduction')).toBeNull();
  },
};

/** Without a caption descriptor the skin draws no captions button. */
export const WithoutCaptions: Story = {
  args: { captionTrack: undefined },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Quality: Auto' });
    expect(canvasElement.querySelector('button[aria-label$="captions"]')).toBeNull();
  },
};
