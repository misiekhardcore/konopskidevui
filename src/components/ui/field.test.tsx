import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldTitle,
} from './field';
import { Input } from './input';

describe('Field', () => {
  it('associates its label with the control it wraps', () => {
    render(
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" />
      </Field>,
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('publishes the orientation the stylesheet switches on', () => {
    const { rerender } = render(
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" />
      </Field>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');

    rerender(
      <Field orientation="horizontal">
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" />
      </Field>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders a single error as one line, not a list', () => {
    render(
      <Field data-invalid="true">
        <FieldLabel htmlFor="key">API key</FieldLabel>
        <Input id="key" aria-invalid />
        <FieldError errors={[{ message: 'This key expired.' }]} />
      </Field>,
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('This key expired.');
    expect(within(error).queryByRole('list')).not.toBeInTheDocument();
  });

  it('collapses duplicate messages and lists the distinct ones', () => {
    render(
      <FieldError
        errors={[
          { message: 'Too short.' },
          { message: 'Too short.' },
          { message: 'Needs a number.' },
          { message: undefined },
        ]}
      />,
    );

    const items = within(screen.getByRole('alert')).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Too short.', 'Needs a number.']);
  });

  it('renders nothing when there is no message', () => {
    const { container } = render(<FieldError errors={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('prefers explicit children over the resolver output', () => {
    render(<FieldError errors={[{ message: 'Ignored.' }]}>Rendered by hand</FieldError>);

    expect(screen.getByRole('alert')).toHaveTextContent('Rendered by hand');
  });

  it('keeps a separator label inside the rule', () => {
    render(<FieldSeparator>or continue with</FieldSeparator>);

    expect(screen.getByText('or continue with')).toBeVisible();
  });

  it('publishes the separator state so the label can drop when empty', () => {
    const { container, rerender } = render(<FieldSeparator />);

    expect(container.firstElementChild).toHaveAttribute('data-content', 'false');

    rerender(<FieldSeparator>or</FieldSeparator>);
    expect(container.firstElementChild).toHaveAttribute('data-content', 'true');
  });

  it('renders the legend as a real legend element', () => {
    render(
      <fieldset>
        <FieldLegend>Account</FieldLegend>
      </fieldset>,
    );

    expect(screen.getByText('Account').tagName).toBe('LEGEND');
  });

  it('stacks a title and a hint beside the control it describes', () => {
    const { container } = render(
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Workspace</FieldTitle>
          <span className="text-sm text-muted-foreground">The team the article belongs to.</span>
        </FieldContent>
        <Input id="workspace" />
      </Field>,
    );

    expect(container.querySelector('[data-slot="field-content"]')).toHaveTextContent('Workspace');
    expect(screen.getByText('Workspace')).toHaveAttribute('data-slot', 'field-label');
  });
});
