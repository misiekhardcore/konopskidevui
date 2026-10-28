import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

function renderAccordion(collapsible = true) {
  return render(
    <Accordion type="single" collapsible={collapsible} defaultValue="one">
      <AccordionItem value="one">
        <AccordionTrigger>First question</AccordionTrigger>
        <AccordionContent>First answer</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second question</AccordionTrigger>
        <AccordionContent>Second answer</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

describe('Accordion', () => {
  it('renders a button per section with its expanded state', () => {
    renderAccordion();

    const first = screen.getByRole('button', { name: 'First question' });
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens a closed section and closes the open one in single mode', async () => {
    renderAccordion();

    await userEvent.click(screen.getByRole('button', { name: 'Second question' }));

    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'First question' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes the open section when it is collapsible', async () => {
    renderAccordion();

    await userEvent.click(screen.getByRole('button', { name: 'First question' }));

    expect(screen.getByRole('button', { name: 'First question' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('keeps a section open when it is not collapsible', async () => {
    renderAccordion(false);

    await userEvent.click(screen.getByRole('button', { name: 'First question' }));

    expect(screen.getByRole('button', { name: 'First question' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('moves between triggers with arrow keys', async () => {
    renderAccordion();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'First question' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveFocus();
  });
});
