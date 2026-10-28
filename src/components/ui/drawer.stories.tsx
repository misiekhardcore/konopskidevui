import { Button } from './button';
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './drawer';
import { Input } from './input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  subcomponents: {
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A bottom sheet for touch-first flows. On desktop prefer a Dialog or a Sheet; the drawer gesture is what makes it worth the extra layer.',
      },
    },
  },
  argTypes: {
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
    shouldScaleBackground: {
      control: 'boolean',
      description: 'Scales the page behind the drawer, the iOS sheet feel.',
      table: { category: 'Appearance' },
    },
  },
  args: {
    defaultOpen: false,
    shouldScaleBackground: true,
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Drawer {...args}>
        <DrawerTrigger asChild>
          <Button variant="outline">Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter articles</DrawerTitle>
            <DrawerDescription>Pick a topic to narrow the list.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <Input placeholder="Search topics" />
          </div>
          <DrawerFooter>
            <Button>Apply</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  ),
};
