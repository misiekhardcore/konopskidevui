import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Questionnaire,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireTitle,
} from './questionnaire';

describe('Questionnaire', () => {
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

  it('records the chosen answer', async () => {
    render(
      <Questionnaire
        items={[{ name: 'role', choices: [{ value: 'designer' }] }]}
        defaultItem="role"
      >
        <QuestionnaireItem name="role">
          <QuestionnaireTitle>What do you do?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>,
    );

    await userEvent.click(screen.getByLabelText('Designer'));

    expect(screen.getByLabelText('Designer')).toBeChecked();
  });
});
