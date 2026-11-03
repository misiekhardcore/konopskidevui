import { DirectionProvider } from './direction';
import { Switch } from './switch';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Direction',
  component: DirectionProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Provides left-to-right or right-to-left reading direction to every primitive below it. Wrap the app once, at the root.',
      },
    },
  },
  argTypes: {
    dir: {
      control: 'inline-radio',
      description: 'Reading direction for every primitive inside.',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    dir: 'ltr',
  },
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <DirectionProvider {...args}>
      <div className="flex flex-col gap-2">
        <p className="text-sm">Reading direction: {args.dir}</p>
        <Switch aria-label="Example control" />
      </div>
    </DirectionProvider>
  ),
};

/**
 * Primitives read the direction from the provider, so the same markup mirrors:
 * the slider fills from the other edge and the menu opens to the other side.
 */
export const RightToLeft: Story = {
  args: { dir: 'rtl' },
  render: (args) => (
    <DirectionProvider {...args}>
      <div className="flex w-64 flex-col gap-4">
        <p className="text-sm">Reading direction: rtl</p>
        <input
          type="range"
          aria-label="Volume"
          defaultValue={70}
          className="w-full accent-primary"
        />
      </div>
    </DirectionProvider>
  ),
};

/** Direction nests: an LTR island inside an RTL page keeps the islands' own order. */
export const NestedFlip: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DirectionProvider dir="rtl">
      <div className="flex w-72 flex-col gap-3">
        <p className="text-sm">The page reads right to left.</p>
        <DirectionProvider dir="ltr">
          <div className="flex items-center gap-2 rounded-sm border border-border p-3">
            <Switch aria-label="Left-to-right island" />
            <span className="text-sm">An LTR island keeps its order.</span>
          </div>
        </DirectionProvider>
      </div>
    </DirectionProvider>
  ),
};
