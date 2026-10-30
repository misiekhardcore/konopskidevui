import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  subcomponents: { ButtonGroupSeparator, ButtonGroupText },
  parameters: {
    docs: {
      description: {
        component:
          'Joins related buttons into one control. Buttons keep their own labels and focus, so this is a layout and grouping decision, not a new widget.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      description: 'Layout direction of the group.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <ButtonGroup {...args}>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
    </>
  ),
};
