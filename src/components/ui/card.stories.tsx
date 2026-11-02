import { ArrowRightIcon } from 'lucide-react';

import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from './card';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Card',
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
    CardImage,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A bordered surface for one self-contained piece of content. The house card is a 1px border and a 4px radius with no shadow: depth is reserved for floating surfaces.',
      },
    },
  },
  argTypes: {
    interactive: {
      control: 'boolean',
      description: 'Adds the hover affordance for a card that behaves as a link.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: { interactive: false },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Designing with tokens</CardTitle>
        <CardDescription>
          One palette, one type scale, every app. How the konopskidev theme keeps them in step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Semantic tokens are the contract: a component asks for `bg-card`, never for white.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">
          Later
        </Button>
        <Button size="sm">Read</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithImage: Story = {
  parameters: { controls: { include: ['interactive'] } },
  render: (args) => (
    <Card {...args} className="w-96 overflow-hidden p-0">
      <CardImage>
        <img
          src="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop"
          alt="A desk with a notebook and a laptop"
        />
      </CardImage>
      <CardHeader>
        <CardTitle>Reading performance budgets</CardTitle>
        <CardDescription>Why the slowest page is the one nobody measured.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="link" className="px-0">
          Read the article <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card className="w-96">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1">
          <CardTitle>Weekly report</CardTitle>
          <CardDescription>12 articles · 3 projects</CardDescription>
        </div>
        <CardAction>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Last updated two hours ago.</p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Interactive card</CardTitle>
        <CardDescription>Hover it to see the border shift.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

const imageMeta = { component: CardImage } as const satisfies Partial<Meta<typeof CardImage>>;
const titleMeta = { component: CardTitle } as const satisfies Partial<Meta<typeof CardTitle>>;

/** The aspect box is what reserves the media's space before it loads. */
export const ImageAspect: StoryObj<typeof imageMeta> = {
  args: { aspect: 'aspect-video', children: null },
  argTypes: {
    children: { control: false, table: { category: 'Content' } },
    aspect: {
      control: 'inline-radio',
      options: ['aspect-video', 'aspect-square', 'aspect-[4/3]', 'aspect-[21/9]'],
      description: 'Any `aspect-*` utility. `children` is required, so an empty frame cannot exist.',
      table: { category: 'Layout', defaultValue: { summary: 'aspect-video' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Card className="w-96 overflow-hidden p-0">
      <CardImage {...args}>
        <img
          src="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop"
          alt="A desk with a notebook and a laptop"
          className="h-full w-full object-cover"
        />
      </CardImage>
      <CardHeader>
        <CardTitle>Reading performance budgets</CardTitle>
      </CardHeader>
    </Card>
  ),
};

/** `asChild` lets the title be the heading level the page outline needs. */
export const TitleAsChild: StoryObj<typeof titleMeta> = {
  args: { asChild: true, children: 'Designing with tokens' },
  argTypes: {
    asChild: {
      control: 'boolean',
      description: 'Render the child element, e.g. an `<h2>` or a link.',
      table: { category: 'Composition', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle {...args} asChild>
          <h3>{children}</h3>
        </CardTitle>
      </CardHeader>
    </Card>
  ),
};
