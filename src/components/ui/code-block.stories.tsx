import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
} from './code-block';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  subcomponents: {
    CodeBlockHeader,
    CodeBlockTitle,
    CodeBlockActions,
    CodeBlockCopyButton,
    CodeBlockContent,
    CodeBlockLine,
    CodeBlockFooter,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A highlighted code block with a header, copy action and optional line numbers. Highlighting is done on the client so the markup stays small.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      description: 'Default or error framing.',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'inline-radio',
      table: { category: 'Appearance' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentMeta = { component: CodeBlockContent } as const satisfies Partial<
  Meta<typeof CodeBlockContent>
>;
const copyMeta = { component: CodeBlockCopyButton } as const satisfies Partial<
  Meta<typeof CodeBlockCopyButton>
>;
const lineMeta = { component: CodeBlockLine } as const satisfies Partial<
  Meta<typeof CodeBlockLine>
>;

const snippet = `export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <CodeBlock {...args} className="w-[32rem]">
      <CodeBlockHeader>
        <CodeBlockTitle>src/lib/utils.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={snippet} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{snippet}</CodeBlockContent>
    </CodeBlock>
  ),
};

/** `lineNumbers` and `wrap` are the two layout decisions; `startLine` numbers a fragment. */
export const Content: StoryObj<typeof contentMeta> = {
  args: { lineNumbers: true, wrap: false, startLine: 1 },
  argTypes: {
    lineNumbers: {
      control: 'boolean',
      description: 'Gutter with line numbers.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    wrap: {
      control: 'boolean',
      description: 'Wrap long lines instead of scrolling horizontally.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    startLine: {
      control: 'number',
      description: 'First number in the gutter, for a fragment of a longer file.',
      table: { category: 'Layout', defaultValue: { summary: '1' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <CodeBlock className="w-[32rem]">
      <CodeBlockHeader>
        <CodeBlockTitle>src/lib/utils.ts</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent {...args}>{snippet}</CodeBlockContent>
    </CodeBlock>
  ),
};

/** The copy button reports its own state, so the story can show both weights. */
export const CopyButton: StoryObj<typeof copyMeta> = {
  args: { value: snippet, variant: 'ghost', size: 'icon-xs' },
  argTypes: {
    value: {
      control: 'text',
      description: 'What lands on the clipboard. Defaults to the block’s text when omitted.',
      table: { category: 'Behaviour' },
    },
    variant: {
      control: 'select',
      description: 'Button weight.',
      table: { category: 'Appearance', defaultValue: { summary: 'ghost' } },
    },
    size: {
      control: 'select',
      description: 'Button size.',
      table: { category: 'Appearance', defaultValue: { summary: 'icon-xs' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <CodeBlock className="w-[32rem]">
      <CodeBlockHeader>
        <CodeBlockTitle>src/lib/utils.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton {...args} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{snippet}</CodeBlockContent>
    </CodeBlock>
  ),
};

/** The diff variants tint a line; they are line decorations, not a diff engine. */
export const DiffLines: StoryObj<typeof lineMeta> = {
  args: { variant: 'default', children: 'unchanged line' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'added', 'removed', 'highlighted'],
      description: 'Line treatment.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <CodeBlock className="w-[32rem]">
      <CodeBlockContent lineNumbers>
        <CodeBlockLine variant="removed">- const radius = 'xl';</CodeBlockLine>
        <CodeBlockLine variant="added">+ const radius = 'sm';</CodeBlockLine>
        <CodeBlockLine {...args}>{children}</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  ),
};

/** The destructive framing is for output that failed, not for red code. */
export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <CodeBlock {...args} className="w-[32rem]">
      <CodeBlockHeader>
        <CodeBlockTitle>tsc --noEmit</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent>{`error TS2322: Type 'string' is not assignable to type 'number'.`}</CodeBlockContent>
      <CodeBlockFooter>1 error</CodeBlockFooter>
    </CodeBlock>
  ),
};
