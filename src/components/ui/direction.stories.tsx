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
      options: ['ltr', 'rtl'],
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
  render: (args) => (
    <>
      <DirectionProvider {...args}>
        <div className="flex flex-col gap-2">
          <p className="text-sm">Reading direction: {args.dir}</p>
          <Switch aria-label="Example control" />
        </div>
      </DirectionProvider>
    </>
  ),
};
