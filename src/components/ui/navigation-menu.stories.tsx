import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from './navigation-menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  subcomponents: {
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuContent,
    NavigationMenuTrigger,
    NavigationMenuLink,
    NavigationMenuIndicator,
    NavigationMenuViewport,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Site navigation with rich panels. The links stay real links, which is what keeps the menu crawlable and usable without JavaScript.',
      },
    },
  },
  argTypes: {
    viewport: {
      control: 'boolean',
      description: 'Render panels in a shared viewport element.',
      table: { category: 'Behaviour' },
    },
    value: {
      control: 'text',
      description: 'Controlled open item, by its `value`.',
      table: { category: 'State' },
    },
    onValueChange: { action: 'value changed', table: { category: 'Events' } },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    delayDuration: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Milliseconds a pointer must rest before a panel opens.',
      table: { category: 'Behaviour' },
    },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    viewport: true,
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <NavigationMenu {...args}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Articles</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-64 gap-1 p-2">
                <li>
                  <NavigationMenuLink href="/articles/typescript">TypeScript</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="/articles/css">CSS</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/projects">Projects</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  ),
};
