import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './carousel';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  subcomponents: { CarouselContent, CarouselItem, CarouselPrevious, CarouselNext },
  parameters: {
    docs: {
      description: {
        component:
          'A horizontally paged list built on Embla. Give it arrows, and never make it the only way to reach content.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Scroll axis. Arrows rotate to match.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const prevMeta = { component: CarouselPrevious } as const satisfies Partial<
  Meta<typeof CarouselPrevious>
>;
const nextMeta = { component: CarouselNext } as const satisfies Partial<Meta<typeof CarouselNext>>;

const slides = (count: number, basis: string) =>
  Array.from({ length: count }, (_, index) => (
    <CarouselItem key={index} className={basis}>
      <div className="flex h-32 items-center justify-center rounded-sm bg-muted text-sm">
        Slide {index + 1}
      </div>
    </CarouselItem>
  ));

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <Carousel {...args} className="w-80">
      <CarouselContent>{slides(4, 'basis-1/2')}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

/** One slide at a time is the reading layout; the arrows are the only control. */
export const SingleSlide: Story = {
  parameters: { controls: { include: ['orientation'] } },
  render: (args) => (
    <Carousel {...args} className="w-72">
      <CarouselContent>{slides(3, 'basis-full')}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

/** The arrows are `Button`s; the vertical axis rotates them. */
export const PreviousButton: StoryObj<typeof prevMeta> = {
  args: { variant: 'outline', size: 'icon-sm' },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Button weight.',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      description: 'Button size.',
      table: { category: 'Appearance', defaultValue: { summary: 'icon-sm' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Carousel className="w-80">
      <CarouselContent>{slides(4, 'basis-1/2')}</CarouselContent>
      <CarouselPrevious {...args} />
      <CarouselNext />
    </Carousel>
  ),
};

export const NextButton: StoryObj<typeof nextMeta> = {
  args: { variant: 'outline', size: 'icon-sm' },
  argTypes: PreviousButton.argTypes,
  render: (args) => (
    <Carousel className="w-80">
      <CarouselContent>{slides(4, 'basis-1/2')}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext {...args} />
    </Carousel>
  ),
};

/** `orientation="vertical"` needs a height, and the arrows move to the bottom. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <Carousel {...args} className="h-64 w-72">
      <CarouselContent className="h-64">{slides(4, 'basis-1/2')}</CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
