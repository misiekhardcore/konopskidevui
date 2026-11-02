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

const nextMeta = { component: QuestionnaireNext } as const satisfies Partial<
  Meta<typeof QuestionnaireNext>
>;
const submitMeta = { component: QuestionnaireSubmit } as const satisfies Partial<
  Meta<typeof QuestionnaireSubmit>
>;

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

/** `shortcuts="numbers"` swaps the letter keys for 1–9, which a keypad invites. */
export const NumberShortcuts: Story = {
  args: { shortcuts: 'numbers' },
  render: Default.render,
};

/** The last step replaces Next with Submit; the two are the same `Button` underneath. */
export const FinalStep: Story = {
  args: { defaultItem: 'goal' },
  render: (args) => (
    <Questionnaire
      {...args}
      className="w-96"
      items={[
        { name: 'role', choices: [{ value: 'designer' }, { value: 'engineer' }] },
        { name: 'goal', choices: [{ value: 'ship' }, { value: 'learn' }] },
      ]}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="goal">
        <QuestionnaireTitle>What is the goal?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="ship">Ship faster</QuestionnaireChoice>
          <QuestionnaireChoice value="learn">Learn the system</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSkip>Skip</QuestionnaireSkip>
        <QuestionnaireSubmit>Finish</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  ),
};

/** The step buttons take the same variants and sizes as `Button`. */
export const NextButton: StoryObj<typeof nextMeta> = {
  args: { variant: 'default', size: 'default', children: 'Next' },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Button weight.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      description: 'Button size.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <Questionnaire
      className="w-96"
      items={[{ name: 'role', choices: [{ value: 'designer' }, { value: 'engineer' }] }]}
    >
      <QuestionnaireItem name="role">
        <QuestionnaireTitle>What do you do?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="engineer">Engineer</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireNext {...args}>{children}</QuestionnaireNext>
        <QuestionnaireSubmit variant="outline">Finish</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  ),
};

/** Submit is the completion affordance; it is what the last step should end on. */
export const SubmitButton: StoryObj<typeof submitMeta> = {
  args: { variant: 'default', size: 'default', children: 'Finish' },
  argTypes: NextButton.argTypes,
  render: ({ children, ...args }) => (
    <Questionnaire
      className="w-96"
      items={[{ name: 'role', choices: [{ value: 'designer' }, { value: 'engineer' }] }]}
    >
      <QuestionnaireItem name="role">
        <QuestionnaireTitle>What do you do?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="engineer">Engineer</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit {...args}>{children}</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  ),
};
