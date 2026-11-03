import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
  subcomponents: { ResizableHandle, ResizablePanel },
  parameters: {
    docs: {
      description: {
        component:
          'Two or more panels with a draggable splitter. Give the layout a min size — an unconstrained panel is how a layout breaks on a phone.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Split axis.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const handleMeta = { component: ResizableHandle } as const satisfies Partial<
  Meta<typeof ResizableHandle>
>;

const panels = (
  <>
    <ResizablePanel defaultSize={50} minSize={20}>
      <div className="flex h-full items-center justify-center text-sm">Editor</div>
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={50} minSize={20}>
      <div className="flex h-full items-center justify-center text-sm">Preview</div>
    </ResizablePanel>
  </>
);

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <ResizablePanelGroup {...args} className="h-40 w-96 rounded-sm border border-border">
      {panels}
    </ResizablePanelGroup>
  ),
};

/** `withHandle` adds the grip; without it the splitter is a bare 1px rule. */
export const Handle: StoryObj<typeof handleMeta> = {
  args: { withHandle: true },
  argTypes: {
    withHandle: {
      control: 'boolean',
      description: 'Draw the grip in the middle of the splitter.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ withHandle }) => (
    <ResizablePanelGroup className="h-40 w-96 rounded-sm border border-border">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex h-full items-center justify-center text-sm">Editor</div>
      </ResizablePanel>
      <ResizableHandle withHandle={withHandle} />
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex h-full items-center justify-center text-sm">Preview</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

/** The vertical axis needs a height, and the panels stack instead of sitting side by side. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <ResizablePanelGroup {...args} className="h-64 w-80 rounded-sm border border-border">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex h-full items-center justify-center text-sm">Editor</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex h-full items-center justify-center text-sm">Console</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
