import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Table',
  component: Table,
  subcomponents: {
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Semantic tabular data. Rows are separated by borders (never zebra stripes), heads are bold and muted, and the container scrolls horizontally so a wide table never breaks the page.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const articles = [
  { title: 'Designing with tokens', topic: 'Design systems', reads: 1284 },
  { title: 'Reading performance budgets', topic: 'Performance', reads: 963 },
  { title: 'A smaller CSS reset', topic: 'CSS', reads: 402 },
];

export const Default: Story = {
  render: (args) => (
    <Table {...args} className="w-[36rem]">
      <TableCaption>Articles published this quarter.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead className="text-right">Reads</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.title}>
            <TableCell className="font-medium">{article.title}</TableCell>
            <TableCell>{article.topic}</TableCell>
            <TableCell className="text-right">{article.reads}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">
            {articles.reduce((sum, article) => sum + article.reads, 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const SelectedRow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Table className="w-[36rem]">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>Selected row</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Another row</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
