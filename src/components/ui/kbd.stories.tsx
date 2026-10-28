import { Kbd, KbdGroup } from './kbd';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  subcomponents: { KbdGroup },
  parameters: {
    docs: {
      description: {
        component: 'Renders a keyboard key or shortcut, matching the platform the reader is on.',
      },
    },
  },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    children: '⌘',
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex items-center gap-3 text-sm">
        <span>Open the palette</span>
        <KbdGroup>
          <Kbd {...args}>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    </>
  ),
};
