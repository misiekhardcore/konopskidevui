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

const triggerMeta = { component: NavigationMenuTrigger } as const satisfies Partial<
  Meta<typeof NavigationMenuTrigger>
>;

const menu = (viewport: boolean) => (
  <NavigationMenu viewport={viewport}>
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
    {viewport ? <NavigationMenuViewport /> : null}
    <NavigationMenuIndicator />
  </NavigationMenu>
);

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => menu(args.viewport ?? true),
};

/**
 * With `viewport={false}` each panel is its own popup, which is what a menu that
 * needs different widths per entry wants.
 */
export const WithoutViewport: Story = {
  args: { viewport: false },
  render: () => menu(false),
};

/** The trigger is a button with a disclosure chevron; the label is its only content. */
export const Trigger: StoryObj<typeof triggerMeta> = {
  args: { children: 'Articles' },
  parameters: {
    a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
  },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children }) => (
    <NavigationMenu value="articles">
      <NavigationMenuList>
        <NavigationMenuItem value="articles">
          <NavigationMenuTrigger>{children}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1 p-2">
              <li>
                <NavigationMenuLink href="/articles/typescript">TypeScript</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  ),
};
