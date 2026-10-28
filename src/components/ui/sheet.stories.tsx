import { Button } from './button';
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  subcomponents: {
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A panel that slides in from an edge: mobile navigation, a detail view, a filter tray. It is a Dialog with a side.',
      },
    },
  },
  argTypes: {
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    defaultOpen: false,
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Sheet {...args}>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Jump to a section.</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-2 p-4">
            <a className="text-sm" href="/articles">
              Articles
            </a>
            <a className="text-sm" href="/projects">
              Projects
            </a>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  ),
};
