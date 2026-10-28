import { Marker, MarkerIcon, MarkerContent } from './marker';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Marker',
  component: Marker,
  tags: ['autodocs'],
  subcomponents: { MarkerIcon, MarkerContent },
  parameters: {
    docs: {
      description: {
        component:
          'A small inline marker for a status or a tool result. It sits inside a line of text without taking it over.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'border', 'separator'],
      table: { category: 'Appearance' },
    },
    asChild: { control: 'boolean', table: { category: 'Composition' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
    asChild: false,
  },
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex flex-col gap-2 text-sm">
        <Marker {...args}>
          <MarkerIcon>•</MarkerIcon>
          <MarkerContent>System prompt</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerContent>Context loaded</MarkerContent>
        </Marker>
      </div>
    </>
  ),
};
