import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';

function renderCarousel() {
  return render(
    <Carousel aria-label="Articles" className="w-80">
      <CarouselContent>
        {[1, 2, 3].map((index) => (
          <CarouselItem key={index} className="basis-full">
            Slide {index}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>,
  );
}

describe('Carousel', () => {
  it('is a carousel region with a label for screen readers', () => {
    renderCarousel();

    const region = screen.getByRole('region', { name: 'Articles' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('keeps every slide mounted and announced as a slide', () => {
    renderCarousel();

    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide');
    expect(slides[0]).toHaveTextContent('Slide 1');
  });

  it('offers both arrows as named buttons', () => {
    renderCarousel();

    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });

  it('keeps the arrow buttons reachable even before Embla reports its state', () => {
    render(
      <Carousel orientation="vertical" aria-label="Articles">
        <CarouselContent>
          <CarouselItem className="basis-full">Slide</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>,
    );

    const next = screen.getByRole('button', { name: 'Next slide' });
    expect(next).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous slide' })).toBeNull();
  });
});
