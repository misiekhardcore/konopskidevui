import { FileTextIcon, HomeIcon, SettingsIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  subcomponents: {
    SidebarProvider,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
    SidebarTrigger,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Application navigation. It needs `SidebarProvider` at the top (it owns the open state and the ⌘B shortcut), and the whole thing renders inside whatever container you give it — it is not a portal.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    side: {
      control: 'inline-radio',
      description: 'Which edge the rail is attached to.',
      table: { category: 'Layout', defaultValue: { summary: 'left' } },
    },
    variant: {
      control: 'inline-radio',
      description: 'Surface treatment of the rail.',
      table: { category: 'Appearance', defaultValue: { summary: 'sidebar' } },
    },
    collapsible: {
      control: 'select',
      description: 'How it collapses: slide away, shrink to icons, or not at all.',
      table: { category: 'Behaviour', defaultValue: { summary: 'offcanvas' } },
    },
  },
  args: { side: 'left', variant: 'sidebar', collapsible: 'offcanvas' },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarHeader className="p-3">
          <span className="font-display text-h4 font-semibold">konopskidev</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Journal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <HomeIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileTextIcon />
                    <span>Articles</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Overview</span>
        </header>
        <div className="p-6 text-sm">Content sits in the inset region.</div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const IconCollapsible: Story = {
  args: { collapsible: 'icon' },
  render: Default.render,
};

export const Floating: Story = {
  args: { variant: 'floating' },
  render: Default.render,
};
