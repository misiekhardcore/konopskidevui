import { ArrowRightIcon, PlusIcon } from 'lucide-react';
import { fn } from 'storybook/test';

import { Button } from './button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Triggers an action. The variant names are a superset of shadcn/ui: `primary` is an alias of `default`, and `ghost-primary` / `ghost-destructive` are the site\u2019s tinted-ghost treatments.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'ghost-primary',
        'ghost-destructive',
        'link',
      ],
      description: 'Visual weight of the action.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg'],
      description: 'Padding scale. `default` lines up with a 40px `Input`.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Blocks interaction and drops the button to 50% opacity.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    asChild: {
      control: 'boolean',
      description: 'Renders the child element (e.g. an `<a>`) with the button styles.',
      table: { category: 'Composition', defaultValue: { summary: 'false' } },
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description:
        'The native button type. Defaults to `button` so it never submits a form by accident.',
      table: { category: 'Behaviour', defaultValue: { summary: 'button' } },
    },
    children: {
      control: 'text',
      description: 'Button label. Keep it a verb: “Save changes”, not “OK”.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
    onClick: { action: 'clicked', table: { category: 'Events' } },
  },
  args: {
    children: 'Save changes',
    variant: 'default',
    size: 'default',
    disabled: false,
    asChild: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { include: ['disabled', 'onClick'] } },
  render: (args) => (
    <div className="flex max-w-2xl flex-wrap items-center gap-3">
      {(
        [
          'default',
          'primary',
          'secondary',
          'destructive',
          'outline',
          'ghost',
          'ghost-primary',
          'ghost-destructive',
          'link',
        ] as const
      ).map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { include: ['variant', 'disabled', 'onClick'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  args: { children: 'Continue' },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <PlusIcon />
        New project
      </Button>
      <Button {...args} variant="outline">
        Next step
        <ArrowRightIcon />
      </Button>
      <Button {...args} size="icon" aria-label="Add project">
        <PlusIcon />
      </Button>
    </div>
  ),
};

export const AsLink: Story = {
  args: { asChild: true, children: undefined },
  parameters: { controls: { include: ['variant', 'size', 'asChild'] } },
  render: (args) => (
    <Button {...args} asChild>
      <a href="#read-more">Read the article</a>
    </Button>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
