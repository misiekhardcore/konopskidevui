import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from './questionnaire';

/** Two steps, opened on the last one so every trailing action is visible. */
function renderNavigation(actions: React.ReactNode) {
  return render(
    <Questionnaire items={[{ name: 'role' }, { name: 'team' }]} defaultItem="team">
      <QuestionnaireItem name="role">
        <QuestionnaireTitle>What do you do?</QuestionnaireTitle>
      </QuestionnaireItem>
      <QuestionnaireItem name="team" required={false}>
        <QuestionnaireTitle>Which team?</QuestionnaireTitle>
      </QuestionnaireItem>
      <QuestionnaireActions>{actions}</QuestionnaireActions>
    </Questionnaire>,
  );
}

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
            <QuestionnaireChoice value="designer">
              Designer
              <QuestionnaireChoiceDescription>Paints the screens</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>,
    );

    const designer = screen.getByRole('radio', { name: /Designer/ });
    await userEvent.click(designer);

    expect(designer).toBeChecked();
    expect(screen.getByText('Paints the screens')).toBeInTheDocument();
  });

  it('collects a typed answer, with its description and its error', () => {
    render(
      <Questionnaire items={[{ name: 'email' }]} defaultItem="email">
        <QuestionnaireItem name="email">
          <QuestionnaireTitle>Where can we reach you?</QuestionnaireTitle>
          <QuestionnaireDescription>We only write when it matters.</QuestionnaireDescription>
          <QuestionnaireInput aria-label="Email" />
          <QuestionnaireError>Enter an address.</QuestionnaireError>
        </QuestionnaireItem>
      </Questionnaire>,
    );

    expect(screen.getByText('We only write when it matters.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByText('Enter an address.')).toBeInTheDocument();
  });

  it('labels the actions of the last step, and hides the one going forward', () => {
    renderNavigation(
      <>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </>,
    );

    for (const name of ['Previous', 'Skip', 'Submit']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }

    // There is nowhere left to go, so Next is out of the accessibility tree.
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
  });

  it('takes a custom label and carries its button treatment', () => {
    renderNavigation(
      <>
        <QuestionnairePrevious size="sm">Back</QuestionnairePrevious>
        <QuestionnaireSubmit variant="outline">Finish</QuestionnaireSubmit>
      </>,
    );

    const back = screen.getByRole('button', { name: 'Back' });
    expect(back).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Finish' })).toHaveAttribute(
      'data-variant',
      'outline',
    );
  });
});
