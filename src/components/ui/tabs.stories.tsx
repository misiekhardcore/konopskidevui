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

const listMeta = { component: TabsList } as const satisfies Partial<Meta<typeof TabsList>>;

/** The list has two surfaces: the filled default and the underlined `line`. */
export const ListVariant: StoryObj<typeof listMeta> = {
  args: { variant: 'default' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'line'],
      description: 'Filled pill group or an underlined row.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ variant }) => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList variant={variant}>
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

/** `vertical` turns the list into a column and the arrow keys into up/down. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Tabs {...args} className="flex w-96 gap-4">
      <TabsList className="flex-col">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm">
        A sidebar of panels, which is what vertical tabs are for.
      </TabsContent>
      <TabsContent value="activity" className="text-sm">
        Activity panel.
      </TabsContent>
    </Tabs>
  ),
};

/** `manual` activation moves focus with the arrows and waits for Enter to switch. */
export const ManualActivation: Story = {
  args: { activationMode: 'manual' },
  render: Default.render,
};
