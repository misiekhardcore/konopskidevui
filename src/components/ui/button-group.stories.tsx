import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  subcomponents: { ButtonGroupText, ButtonGroupSeparator },
  parameters: {
    docs: {
      description: {
        component:
          'Joins related buttons into one control: a segmented picker, a split action. The radius collapses between items so the group reads as a single surface.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Which way the group stacks.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: { orientation: 'horizontal' },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const textMeta = { component: ButtonGroupText } as const satisfies Partial<
  Meta<typeof ButtonGroupText>
>;
const separatorMeta = { component: ButtonGroupSeparator } as const satisfies Partial<
  Meta<typeof ButtonGroupSeparator>
>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
};

/** Vertical groups stack and collapse the top and bottom radii instead of the sides. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: Default.render,
};

/** `ButtonGroupText` is the label half of a split control: a value next to its actions. */
export const Text: StoryObj<typeof textMeta> = {
  args: { children: 'https://konopski.dev' },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    asChild: {
      control: 'boolean',
      description: 'Render the child element, e.g. a link.',
      table: { category: 'Composition', defaultValue: { summary: 'false' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <ButtonGroup>
      <ButtonGroupText {...args}>{children}</ButtonGroupText>
      <Button variant="outline">Copy</Button>
    </ButtonGroup>
  ),
};

/** `ButtonGroupText` can be the link itself, so the whole label is clickable. */
export const TextAsLink: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ButtonGroup>
      <ButtonGroupText asChild>
        <a href="https://konopski.dev">konopski.dev</a>
      </ButtonGroupText>
      <Button variant="outline">Copy</Button>
    </ButtonGroup>
  ),
};

/** A separator divides two actions that are related but not the same choice. */
export const Separator: StoryObj<typeof separatorMeta> = {
  args: { orientation: 'vertical' },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the rule between items.',
      table: { category: 'Layout', defaultValue: { summary: 'vertical' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ orientation }) => (
    <ButtonGroup>
      <Button variant="outline">Save</Button>
      <ButtonGroupSeparator orientation={orientation} />
      <Button variant="outline">Publish</Button>
    </ButtonGroup>
  ),
};
