import { Separator } from './separator';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A hairline rule between groups. Purely visual by default; pass `decorative={false}` when the separation carries meaning.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the rule.',
      table: { category: 'Layout' },
    },
    decorative: {
      control: 'boolean',
      description: 'When false the separator is announced as a separator role.',
      table: { category: 'Accessibility' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
    decorative: false,
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="w-80">
      <p className="text-sm">Account</p>
      <Separator {...args} className="my-4" />
      <p className="text-sm">Billing</p>
    </div>
  ),
};

/** Vertical rules separate items in a row; the parent has to give them height. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex h-6 items-center gap-4 text-sm">
      <span>Draft</span>
      <Separator {...args} />
      <span>Published</span>
      <Separator {...args} />
      <span>Archived</span>
    </div>
  ),
};

/** `decorative` removes the role, so it is skipped by the accessibility tree. */
export const Decorative: Story = {
  args: { decorative: true },
  render: Default.render,
};
