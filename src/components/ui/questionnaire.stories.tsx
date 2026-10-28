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
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from './questionnaire';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Questionnaire',
  component: Questionnaire,
  tags: ['autodocs'],
  subcomponents: {
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
    QuestionnaireProgress,
    QuestionnaireSkip,
    QuestionnaireSubmit,
    QuestionnaireTitle,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A one-question-at-a-time form with keyboard shortcuts and progress. The `items` prop is the source of truth for steps.',
      },
    },
  },
  argTypes: {
    shortcuts: {
      control: 'inline-radio',
      options: ['letters', 'numbers'],
      description: 'Which key selects an answer.',
      table: { category: 'Behaviour' },
    },
    defaultItem: {
      control: 'text',
      description: 'Step shown first.',
      table: { category: 'State' },
    },
    item: {
      control: 'text',
      description: 'Controlled current step.',
      table: { category: 'State' },
    },
  },
  args: {
    shortcuts: 'letters',
    defaultItem: 'role',
  },
} satisfies Meta<typeof Questionnaire>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Questionnaire
        {...args}
        className="w-96"
        items={[
          { name: 'role', choices: [{ value: 'designer' }, { value: 'engineer' }] },
          { name: 'goal', choices: [{ value: 'ship' }, { value: 'learn' }] },
        ]}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="role">
          <QuestionnaireTitle>What do you do?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
            <QuestionnaireChoice value="engineer">Engineer</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
        </QuestionnaireActions>
      </Questionnaire>
    </>
  ),
};
