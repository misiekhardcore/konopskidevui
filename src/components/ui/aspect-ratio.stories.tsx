import { AspectRatio } from './aspect-ratio';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Constrains a child to a fixed width-to-height ratio, so media reserves its space before it loads.',
      },
    },
  },
  argTypes: {
    ratio: {
      control: { type: 'number', min: 0.25, max: 4, step: 0.05 },
      description: 'Width divided by height. Defaults to `1`.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    ratio: 16 / 9,
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="w-80">
        <AspectRatio {...args}>
          <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted text-sm text-muted-foreground">
            16 / 9
          </div>
        </AspectRatio>
      </div>
    </>
  ),
};
