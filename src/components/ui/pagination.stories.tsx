import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  subcomponents: {
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Moves through a long result set. Every link is a real URL so the page stays shareable and crawlable.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const linkMeta = { component: PaginationLink } as const satisfies Partial<
  Meta<typeof PaginationLink>
>;
const previousMeta = { component: PaginationPrevious } as const satisfies Partial<
  Meta<typeof PaginationPrevious>
>;
const nextMeta = { component: PaginationNext } as const satisfies Partial<
  Meta<typeof PaginationNext>
>;

export const Default: Story = {
  render: (args) => (
    <>
      <Pagination {...args}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  ),
};

/** `isActive` marks the current page and sets `aria-current`; `size` is the numeral box. */
export const Link: StoryObj<typeof linkMeta> = {
  args: { isActive: true, size: 'icon', children: '2' },
  argTypes: {
    isActive: {
      control: 'boolean',
      description: 'Marks the page the reader is on, with `aria-current="page"`.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'inline-radio',
      options: ['icon', 'default'],
      description: 'Square numeral or a text link.',
      table: { category: 'Appearance', defaultValue: { summary: 'icon' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="?page=1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" {...args}>
            {children}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=3">3</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

/** The arrows carry a visible label; `text` is for a locale that needs another word. */
export const PreviousLabel: StoryObj<typeof previousMeta> = {
  args: { text: 'Previous' },
  argTypes: {
    text: {
      control: 'text',
      table: { category: 'Content', defaultValue: { summary: 'Previous' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ text }) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" text={text} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const NextLabel: StoryObj<typeof nextMeta> = {
  args: { text: 'Next' },
  argTypes: {
    text: { control: 'text', table: { category: 'Content', defaultValue: { summary: 'Next' } } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ text }) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationNext href="?page=3" text={text} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

/** Long ranges collapse with `PaginationEllipsis`; there is no page-count prop. */
export const WithEllipsis: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=7" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=8" isActive>
            8
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=9">9</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=9" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
