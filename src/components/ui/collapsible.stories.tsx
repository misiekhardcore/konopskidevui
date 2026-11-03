import { expect, userEvent } from 'storybook/test';

import { Button } from './button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  subcomponents: { CollapsibleTrigger, CollapsibleContent },
  parameters: {
    docs: {
      description: {
        component:
          'A single show/hide region with no accordion styling. Use it for “show more” and for disclosure inside a toolbar.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to drive it from the trigger.',
      table: { category: 'State' },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Open on first render.',
      table: { category: 'State' },
    },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    defaultOpen: true,
    disabled: false,
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <Collapsible {...args} className="w-80">
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 text-sm text-muted-foreground">
        The build runs on every push and takes about four minutes.
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Toggle details' });
    await expect(canvas.getByText(/build runs on every push/)).toBeVisible();

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Closed is the default state; the trigger carries `aria-expanded` for both. */
export const Closed: Story = {
  args: { defaultOpen: false },
  render: Default.render,
};

/** A disabled collapsible keeps its trigger focusable but inert. */
export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
