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
    <div className="w-80">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted text-sm text-muted-foreground">
          {args.ratio?.toFixed(2)} / 1
        </div>
      </AspectRatio>
    </div>
  ),
};

/** The ratios the library's own surfaces use: video, square, and portrait. */
export const CommonRatios: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-end gap-4">
      {[
        { label: '16 / 9', ratio: 16 / 9, width: 'w-64' },
        { label: '1 / 1', ratio: 1, width: 'w-32' },
        { label: '4 / 5', ratio: 4 / 5, width: 'w-24' },
      ].map(({ label, ratio, width }) => (
        <div key={label} className={width}>
          <AspectRatio ratio={ratio}>
            <div className="flex h-full w-full items-center justify-center rounded-sm bg-muted text-xs text-muted-foreground">
              {label}
            </div>
          </AspectRatio>
        </div>
      ))}
    </div>
  ),
};
