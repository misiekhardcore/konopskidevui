import { expect, waitFor, within } from 'storybook/test';

import audioSample from '../../stories/assets/forecast-briefing.mp3?url';
import { Audio } from './audio';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Audio',
  component: Audio,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A single audio file with a control bar drawn from the design tokens: play and pause, a seek slider, the clock and mute, every one of them keyboard operable. The native `<audio>` element does the playing; only its chrome is ours, so the bar matches the video player instead of the browser’s own widget.',
      },
    },
  },
  argTypes: {
    title: { control: 'text', table: { category: 'Content' } },
    src: { control: 'text', table: { category: 'Content' } },
    labels: {
      control: 'object',
      description: 'Override any control’s accessible name, for a translated app.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    title: 'forecast-briefing.mp3',
    src: audioSample,
  },
} satisfies Meta<typeof Audio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The whole bar: play, seek, clock and mute, drawn from the design tokens. */
export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audio = canvasElement.querySelector('audio') as HTMLAudioElement;

    await expect(
      canvas.getByRole('button', { name: 'Play forecast-briefing.mp3' }),
    ).toBeInTheDocument();

    // The sample in `stories/assets/forecast-briefing.mp3` really loads: the
    // duration it reports is what turns the seek slider on.
    await waitFor(() =>
      expect(audio.readyState).toBeGreaterThanOrEqual(HTMLMediaElement.HAVE_METADATA),
    );

    await expect(canvas.getByRole('slider', { name: 'Seek forecast-briefing.mp3' })).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Mute forecast-briefing.mp3' }),
    ).toBeInTheDocument();
  },
};

/** In a narrow column the bar keeps every control and never overflows. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-80">
      <Audio {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector('[data-slot="audio"]') as HTMLElement;

    await canvas.findByRole('button', { name: 'Play forecast-briefing.mp3' });

    expect(bar.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth);
    await expect(canvas.getByRole('slider', { name: 'Seek forecast-briefing.mp3' })).toBeEnabled();
  },
};

/** Every control name is a label, so an app can translate the bar. */
export const Translated: Story = {
  args: {
    labels: {
      play: 'Odtwórz forecast-briefing.mp3',
      pause: 'Wstrzymaj forecast-briefing.mp3',
      seek: 'Przewiń forecast-briefing.mp3',
      mute: 'Wycisz forecast-briefing.mp3',
      unmute: 'Włącz dźwięk',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Odtwórz forecast-briefing.mp3' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('slider', { name: 'Przewiń forecast-briefing.mp3' }),
    ).toBeInTheDocument();
  },
};
