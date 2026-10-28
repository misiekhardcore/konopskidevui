import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnaireProgress,
  QuestionnaireTitle,
} from './questionnaire';

describe('Questionnaire', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Questionnaire
        items={[{ name: 'role', choices: [{ value: 'a' }, { value: 'b' }] }]}
        defaultItem="role"
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="role">
          <QuestionnaireTitle>Pick one</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="a">A</QuestionnaireChoice>
            <QuestionnaireChoice value="b">B</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireNext />
        </QuestionnaireActions>
      </Questionnaire>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Questionnaire
        items={[{ name: 'role', choices: [{ value: 'a' }, { value: 'b' }] }]}
        defaultItem="role"
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="role">
          <QuestionnaireTitle>Pick one</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="a">A</QuestionnaireChoice>
            <QuestionnaireChoice value="b">B</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireNext />
        </QuestionnaireActions>
      </Questionnaire>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders the current question', async () => {
    render(
      <Questionnaire items={[{ name: 'role', choices: [{ value: 'a' }] }]} defaultItem="role">
        <QuestionnaireItem name="role">
          <QuestionnaireTitle>What do you do?</QuestionnaireTitle>
        </QuestionnaireItem>
      </Questionnaire>,
    );

    expect(screen.getByText('What do you do?')).toBeInTheDocument();
  });
});
