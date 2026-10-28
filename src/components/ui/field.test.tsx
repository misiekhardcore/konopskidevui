import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field, FieldLabel, FieldDescription, FieldError } from './field';
import { Input } from './input';

describe('Field', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" />
        <FieldDescription>Shown on your profile.</FieldDescription>
      </Field>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" />
        <FieldDescription>Shown on your profile.</FieldDescription>
      </Field>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('associates the label with the control', async () => {
    render(
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" />
      </Field>,
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('announces the error and connects it to the field', async () => {
    render(
      <Field data-invalid="true">
        <FieldLabel htmlFor="key">API key</FieldLabel>
        <Input id="key" aria-invalid />
        <FieldError errors={[{ message: 'This key expired.' }]} />
      </Field>,
    );

    expect(screen.getByText('This key expired.')).toBeInTheDocument();
  });
});
