import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Switches between sibling views without leaving the page. Use it when the panels are alternatives of equal weight; anything that needs a URL should be a route instead.',
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: 'select',
      options: ['overview', 'activity'],
      description: 'The panel shown first.',
      table: { category: 'State' },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout and arrow-key axis.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
    },
    activationMode: {
      control: 'inline-radio',
      options: ['automatic', 'manual'],
      description: 'Whether arrowing to a tab activates it, or requires Enter.',
      table: { category: 'Behaviour', defaultValue: { summary: 'automatic' } },
    },
  },
  args: { defaultValue: 'overview', orientation: 'horizontal', activationMode: 'automatic' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4 text-sm text-muted-foreground">
        Twelve articles and three projects, last published on Tuesday.
      </TabsContent>
      <TabsContent value="activity" className="p-4 text-sm text-muted-foreground">
        Commented on “Designing with tokens” two hours ago.
      </TabsContent>
    </Tabs>
  ),
};

export const Line: Story = {
  parameters: { controls: { include: ['defaultValue', 'orientation'] } },
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4 text-sm">
        Underlined tabs for a lighter surface.
      </TabsContent>
      <TabsContent value="activity" className="p-4 text-sm">
        Activity panel.
      </TabsContent>
    </Tabs>
  ),
};
