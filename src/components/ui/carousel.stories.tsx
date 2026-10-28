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
      description: 'Scroll axis.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Carousel {...args} className="w-80">
        <CarouselContent>
          {[1, 2, 3, 4].map((index) => (
            <CarouselItem key={index} className="basis-1/2">
              <div className="flex h-32 items-center justify-center rounded-sm bg-muted text-sm">
                Slide {index}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  ),
};
