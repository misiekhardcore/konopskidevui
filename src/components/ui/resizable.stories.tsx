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
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <ResizablePanelGroup
        {...args}
        orientation="horizontal"
        className="h-40 w-96 rounded-sm border border-border"
      >
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full items-center justify-center text-sm">Editor</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full items-center justify-center text-sm">Preview</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  ),
};
