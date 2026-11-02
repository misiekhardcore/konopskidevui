import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  subcomponents: {
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shows where the current page sits in the hierarchy. The last crumb is the current page and is not a link.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const linkMeta = { component: BreadcrumbLink } as const satisfies Partial<
  Meta<typeof BreadcrumbLink>
>;
const separatorMeta = { component: BreadcrumbSeparator } as const satisfies Partial<
  Meta<typeof BreadcrumbSeparator>
>;

export const Default: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reading performance budgets</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** A deep path collapses mid-trail; the ellipsis is decorative, not a link. */
export const WithEllipsis: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reading performance budgets</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** `asChild` lets the crumb be a router link, which is what Next.js needs. */
export const LinkAsChild: StoryObj<typeof linkMeta> = {
  args: { asChild: true, children: 'Articles' },
  argTypes: {
    asChild: {
      control: 'boolean',
      description: 'Render the child element instead of an `<a>`.',
      table: { category: 'Composition', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink {...args} asChild>
            <a href="/articles">{children}</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** The separator defaults to a chevron; `children` swaps it for any glyph. */
export const Separator: StoryObj<typeof separatorMeta> = {
  args: { children: '/' },
  argTypes: {
    children: {
      control: 'text',
      description: 'Replaces the default chevron.',
      table: { category: 'Content' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children }) => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>{children}</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Articles</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
