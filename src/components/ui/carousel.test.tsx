import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

  it('stacks the slides and turns the arrows when the carousel is vertical', () => {
    const { container } = render(
      <Carousel orientation="vertical" aria-label="Articles">
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>,
    );

    expect(container.querySelector('[data-slot="carousel-content"] > div')?.className).toContain(
      'flex-col',
    );
    expect(container.querySelector('[data-slot="carousel-item"]')?.className).toContain('pt-4');
    expect(screen.getByRole('button', { name: 'Previous slide' })?.className).toContain(
      'rotate-90',
    );
  });

  it('publishes Embla\u2019s instance through setApi', () => {
    const setApi = vi.fn();
    render(
      <Carousel aria-label="Articles" setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(setApi).toHaveBeenCalledOnce();
    expect(setApi.mock.calls[0][0]).toMatchObject({ scrollPrev: expect.any(Function) });
  });

  it('handles the arrow keys instead of letting the page scroll', () => {
    renderCarousel();
    const region = screen.getByRole('region', { name: 'Articles' });

    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.keyDown(region, { key: 'ArrowLeft' })).toBe(false);
    expect(fireEvent.keyDown(region, { key: 'ArrowRight' })).toBe(false);
    expect(fireEvent.keyDown(region, { key: 'Tab' })).toBe(true);
  });

  it('dims the arrows that have nowhere to go', () => {
    renderCarousel();

    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  });

  it('refuses to render a slide outside a carousel', () => {
    const consoleError = console.error;
    console.error = () => {};

    try {
      expect(() => render(<CarouselItem>Orphan</CarouselItem>)).toThrow(
        /useCarousel must be used within a <Carousel/,
      );
    } finally {
      console.error = consoleError;
    }
  });
});
