import { Button } from './button';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from './item';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Item',
  component: Item,
  tags: ['autodocs'],
  subcomponents: {
    ItemMedia,
    ItemContent,
    ItemActions,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
    ItemDescription,
    ItemHeader,
    ItemFooter,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A generic list row: media, content, actions and optional header or footer. The building block behind settings lists and search results.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'muted'],
      description: 'Surface treatment of the row.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'sm', 'xs'],
      description: 'Row density: 40px, 32px, 28px.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    asChild: {
      control: 'boolean',
      description: 'Render the child element, e.g. a link.',
      table: { category: 'Composition' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
    size: 'default',
    asChild: false,
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

const mediaMeta = { component: ItemMedia } as const satisfies Partial<Meta<typeof ItemMedia>>;

export const Default: Story = {
  render: (args) => (
    <>
      <ItemGroup className="w-96">
        <Item {...args}>
          <ItemMedia variant="icon">📘</ItemMedia>
          <ItemContent>
            <ItemTitle>Design systems in practice</ItemTitle>
            <ItemDescription>18 min read · TypeScript</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">
              Open
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Performance budgets</ItemTitle>
            <ItemDescription>9 min read · CSS</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </>
  ),
};

/** All three surfaces side by side; `outline` and `muted` read as clickable rows. */
export const Variant: Story = {
  parameters: { controls: { include: ['variant', 'size'] } },
  render: (args) => (
    <ItemGroup className="w-96">
      {(['default', 'outline', 'muted'] as const).map((variant) => (
        <Item key={variant} {...args} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
            <ItemDescription>Surface treatment</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
};

/** The three densities, against the same copy. */
export const Size: Story = {
  parameters: { controls: { include: ['variant'] } },
  render: (args) => (
    <ItemGroup className="w-96">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Item key={size} {...args} size={size}>
          <ItemContent>
            <ItemTitle>{size}</ItemTitle>
            <ItemDescription>Row density</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  ),
};

/** `icon` and `image` media get their own box; the default one hugs whatever you put in it. */
export const Media: StoryObj<typeof mediaMeta> = {
  args: { variant: 'icon' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'icon', 'image'],
      description:
        '`icon` centres a glyph in a muted tile; `image` drops the padding for a thumbnail.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <ItemGroup className="w-96">
      <Item>
        <ItemMedia {...args}>{args.variant === 'image' ? '🖼' : '📘'}</ItemMedia>
        <ItemContent>
          <ItemTitle>Design systems in practice</ItemTitle>
          <ItemDescription>Media variant: {args.variant}</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};

/** `asChild` turns the row itself into the interactive element, so the whole row is the link. */
export const AsLink: Story = {
  args: { asChild: true },
  parameters: { controls: { include: ['variant', 'size', 'asChild'] } },
  render: (args) => (
    // With `asChild` the row is the link itself, so the group cannot also claim
    // `role="list"`: a list may only contain list items.
    <ItemGroup role="none" className="w-96">
      <Item {...args} asChild>
        <a href="#article">
          <ItemMedia variant="icon">📘</ItemMedia>
          <ItemContent>
            <ItemTitle>Design systems in practice</ItemTitle>
            <ItemDescription>18 min read · TypeScript</ItemDescription>
          </ItemContent>
        </a>
      </Item>
    </ItemGroup>
  ),
};
