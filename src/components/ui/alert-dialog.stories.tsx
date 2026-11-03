import { expect, screen, userEvent, waitFor } from 'storybook/test';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  subcomponents: {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A confirmation that interrupts the flow for a destructive or irreversible action. Unlike a Dialog it cannot be dismissed by clicking outside.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to drive the dialog from its trigger.',
      table: { category: 'State' },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Open on first render.',
      table: { category: 'State' },
    },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {
    defaultOpen: false,
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentMeta = { component: AlertDialogContent } as const satisfies Partial<
  Meta<typeof AlertDialogContent>
>;
const actionMeta = { component: AlertDialogAction } as const satisfies Partial<
  Meta<typeof AlertDialogAction>
>;

export const Default: Story = {
  render: (args) => (
    <>
      <AlertDialog {...args}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete article</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the article and its comments. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete article' }));
    await expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};

/** `sm` narrows the card and stacks the footer buttons into two columns. */
export const Size: StoryObj<typeof contentMeta> = {
  args: { size: 'default' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['default', 'sm'],
      description: '`sm` is the narrow card with a two-column footer.',
      table: { category: 'Layout', defaultValue: { summary: 'default' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <AlertDialog defaultOpen>
      <AlertDialogContent {...args}>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits are gone after this.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** The confirm button is a `Button`, so it takes the same variants and sizes. */
export const Action: StoryObj<typeof actionMeta> = {
  args: { variant: 'destructive', size: 'default', children: 'Delete' },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Button weight. `destructive` is the confirmation default here.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      description: 'Button size.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this article?</AlertDialogTitle>
          <AlertDialogDescription>It cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction {...args}>{children}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** `AlertDialogMedia` puts an icon above the copy and widens the grid with a default size. */
export const WithMedia: Story = {
  parameters: { controls: { include: ['defaultOpen'] } },
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>⚠</AlertDialogMedia>
          <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
          <AlertDialogDescription>
            Any app using it stops working immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep the key</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Revoke</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
