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
      control: 'select',
      description: 'Surface treatment of the row.',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      description: 'Row density.',
      table: { category: 'Appearance' },
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
