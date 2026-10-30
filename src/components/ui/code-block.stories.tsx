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

export const Default: Story = {
  render: (args) => (
    <>
      <CodeBlock {...args} className="w-[32rem]">
        <CodeBlockHeader>
          <CodeBlockTitle>src/lib/utils.ts</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value="export const cn = (...args) => args.join(' ');" />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>
          {`export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}
        </CodeBlockContent>
      </CodeBlock>
    </>
  ),
};
