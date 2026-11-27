import { expect, within } from 'storybook/test';

import { filePart, fileParts } from '../../testing/ai-parts';
import { FilePart } from './file-part';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/FilePart',
  component: FilePart,
  tags: ['autodocs'],
  parameters: {
    // A transcript column, not a centred card: the part takes its width from the
    // container, so it must not be measured against a shrink-wrapped root.
    layout: 'padded',
    docs: {
      description: {
        component:
          'A file the model produced, rendered by its media type: an image inline with open and download, audio and video through the browser’s own controls, and anything else as a read-only attachment. A part that arrived without data still shows its name instead of an empty frame.',
      },
    },
  },
  argTypes: {
    part: {
      control: false,
      description: 'The file part, straight from the message.',
      table: { category: 'Data' },
    },
    labels: {
      control: 'object',
      description: 'Override any user-facing string the part shows.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    part: fileParts.image,
  },
} satisfies Meta<typeof FilePart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An image is shown inline, named by its filename, with open and download. */
export const Image: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: 'forecast-chart.png' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Open forecast-chart.png' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Download forecast-chart.png' })).toHaveAttribute(
      'download',
      'forecast-chart.png',
    );
  },
};

/** With no filename the media type names the image, so the alt text is never empty. */
export const NamelessImage: Story = {
  args: { part: { ...fileParts.image, filename: undefined } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: 'PNG image' })).toBeInTheDocument();
  },
};

/** An audio part plays through the browser's native, keyboard-operable controls. */
export const Audio: Story = {
  args: { part: fileParts.audio },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audio = canvas.getByLabelText('forecast-briefing.mp3');

    await expect(audio.tagName).toBe('AUDIO');
    await expect(audio).toHaveAttribute('controls');
  },
};

/** A video part gets the same native controls, at its own aspect ratio. */
export const Video: Story = {
  args: { part: fileParts.video },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const video = canvas.getByLabelText('forecast-loop.mp4');

    await expect(video.tagName).toBe('VIDEO');
    await expect(video).toHaveAttribute('controls');
  },
};

/** Any other media type is a read-only attachment row, with no remove affordance. */
export const Document: Story = {
  args: { part: fileParts.document },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('forecast-report.pdf')).toBeInTheDocument();
    await expect(canvas.getByText('application/pdf')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /remove/i })).toBeNull();
  },
};

/** A part that arrived without data keeps its name instead of an empty frame. */
export const Missing: Story = {
  args: { part: { ...fileParts.document, url: '' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('forecast-report.pdf')).toBeInTheDocument();
    await expect(canvas.getByText('File data is missing')).toBeInTheDocument();
    await expect(canvas.queryByRole('link')).toBeNull();
  },
};

/**
 * An embedded file is opened through an object URL, because browsers refuse to
 * navigate to a `data:` URL; the component revokes it when it unmounts.
 */
export const Embedded: Story = {
  args: { part: filePart },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: 'forecast-chart.png' })).toBeInTheDocument();

    const open = canvas.getByRole('link', { name: 'Open forecast-chart.png' });

    await expect(open.getAttribute('href')?.startsWith('blob:')).toBe(true);
  },
};

/** Every string the part shows is a label, so an app can translate it. */
export const Translated: Story = {
  args: {
    part: fileParts.document,
    labels: {
      open: 'Otwórz {name}',
      download: 'Pobierz {name}',
      missing: 'Brak danych',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('link', { name: 'Otwórz forecast-report.pdf' }),
    ).toBeInTheDocument();
  },
};
