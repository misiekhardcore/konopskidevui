import { expect, within } from 'storybook/test';

import { dataPart } from '../../testing/ai-parts';
import { DataPart } from './data-part';

import type { DataPartData } from './data-part';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/DataPart',
  component: DataPart,
  tags: ['autodocs'],
  parameters: {
    // A transcript column, not a centred card: the part takes its width from the
    // container, so it must not be measured against a shrink-wrapped root.
    layout: 'padded',
    docs: {
      description: {
        component:
          'The fallback presentation for data the app defines: a name derived from the part type, humanised, above the payload as JSON in the code-block chrome. The payload scrolls inside a bounded height, a payload JSON cannot express stays readable, and `render` replaces the whole rendering so an app can own its own data.',
      },
    },
  },
  argTypes: {
    part: {
      control: false,
      description: 'The app-defined data part, straight from the message.',
      table: { category: 'Data' },
    },
    render: {
      control: false,
      description:
        'Draw the part yourself. It replaces the whole default rendering — name, frame and payload.',
      table: { category: 'Content' },
    },
    labels: {
      control: 'object',
      description: 'Override any user-facing string the part shows.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    part: dataPart,
  },
} satisfies Meta<typeof DataPart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The name comes from the part type; the payload is the data, as JSON. */
export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Weather')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="code-block-code"]')).toHaveTextContent(
      '"location": "Kraków"',
    );
  },
};

const report = Object.fromEntries(
  Array.from({ length: 40 }, (_, index) => [`region${index}`, `value ${index}`]),
);

/** A long payload stays inside the message and scrolls instead of growing it. */
export const LargePayload: Story = {
  args: { part: { type: 'data-forecastReport', data: report } as DataPartData },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = canvasElement.querySelector('[data-slot="code-block-content"]');

    await expect(canvas.getByText('Forecast report')).toBeInTheDocument();
    await expect(scroller).toHaveClass('max-h-80');
    await expect(scroller).toHaveAttribute('tabindex', '0');
    await expect(scroller).toHaveTextContent('"region39": "value 39"');
  },
};

const circular: Record<string, unknown> = { location: 'Kraków' };

circular.self = circular;

/** A payload with no JSON form is summarised, not thrown. */
export const NonJsonPayload: Story = {
  args: { part: { type: 'data-weather', data: circular } as DataPartData },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="code-block-code"]')).toHaveTextContent(
      '"self": "[Circular]"',
    );
  },
};

/** An app that has its own presentation replaces the whole default rendering. */
export const CustomRender: Story = {
  args: {
    part: dataPart,
    render: (part) => (
      <p className="rounded-sm border border-input p-3 text-sm">
        Own card for <code>{part.type}</code>
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('data-weather')).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="code-block"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-slot="data-part"]')).toBeNull();
  },
};

/** Every string the part shows is a label, so an app can reword it. */
export const CustomLabels: Story = {
  args: {
    part: { type: 'data-', data: { ok: true } } as DataPartData,
    labels: { data: 'Payload', unreadable: 'No readable form' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Payload')).toBeInTheDocument();
    await expect(canvas.getByText(/"ok": true/)).toBeInTheDocument();
  },
};
