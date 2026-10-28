import { useState } from 'react';
import { fn } from 'storybook/test';

import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  subcomponents: {
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A modal that holds one focused task. konopskidev places it a third of the way down the viewport on small screens and centres it from `md` up, with a 4px radius and the only large shadow in the system.',
      },
    },
  },
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Open on first render. The rest of the page is inert while it is open.',
      table: { category: 'State' },
    },
    modal: {
      control: 'boolean',
      description: 'Block interaction with everything behind the dialog.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {
    defaultOpen: false,
    modal: true,
    onOpenChange: fn(),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Rename article</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename article</DialogTitle>
          <DialogDescription>
            The URL stays the same, so existing links keep working.
          </DialogDescription>
        </DialogHeader>
        <Input defaultValue="Designing with tokens" aria-label="Article title" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  render: Default.render,
};

export const WithoutCloseButton: Story = {
  parameters: { controls: { include: ['defaultOpen', 'modal'] } },
  render: (args) => (
    <Dialog {...args} defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No corner close</DialogTitle>
          <DialogDescription>Dismiss with Escape or the button below.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">Open: {String(open)}</p>
        <Button onClick={() => setOpen(true)}>Publish article</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish now?</DialogTitle>
              <DialogDescription>Subscribers get an email immediately.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Not yet
              </Button>
              <Button onClick={() => setOpen(false)}>Publish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
