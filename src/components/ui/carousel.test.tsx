import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Carousel, CarouselContent, CarouselItem } from './carousel';

describe('Carousel', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Carousel className="w-64">
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Carousel className="w-64">
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders one region per slide', async () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(screen.getAllByRole('group')).toHaveLength(2);
  });
});
