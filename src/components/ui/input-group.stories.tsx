import { AtSignIcon, SearchIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea } from './input-group';
import { Kbd } from './kbd';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  subcomponents: {
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupInput,
    InputGroupTextarea,
  },
  parameters: {
    docs: {
      description: {
        component:
          'An input with attached addons: a prefix, a trailing button, a unit. It keeps one visible control while allowing decoration around it.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Storybook builds the Controls panel from the `meta` component's args only:
 * `subcomponents` is documentation, and its prop tables deliberately carry no
 * controls. A part with props of its own therefore gets its own story, typed
 * against a local meta that is never exported — the sidebar and the docs page
 * stay on `Components/InputGroup`.
 */
const addonMeta = { component: InputGroupAddon } as const satisfies Partial<
  Meta<typeof InputGroupAddon>
>;

const buttonMeta = { component: InputGroupButton } as const satisfies Partial<
  Meta<typeof InputGroupButton>
>;

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args} className="w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="konopski.dev" aria-label="Site address" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Go</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/** Where an addon sits: before the control, after it, or on a row of its own. */
export const Addon: StoryObj<typeof addonMeta> = {
  args: { align: 'inline-start' },
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['inline-start', 'inline-end', 'block-start', 'block-end'],
      description:
        'Placement. `inline-*` shares the row with the control; `block-*` takes a full-width row and grows the group.',
      table: { category: 'Layout', defaultValue: { summary: 'inline-start' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <InputGroup className="w-80">
      {args.align === 'block-start' ? (
        <InputGroupAddon {...args}>
          <InputGroupText>Send a message</InputGroupText>
        </InputGroupAddon>
      ) : null}
      {args.align === 'inline-start' ? (
        <InputGroupAddon {...args}>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
      ) : null}
      <InputGroupInput placeholder="Search the journal" aria-label="Search the journal" />
      {args.align === 'inline-end' ? (
        <InputGroupAddon {...args}>
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      ) : null}
      {args.align === 'block-end' ? (
        <InputGroupAddon {...args}>
          <InputGroupText>Markdown supported</InputGroupText>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  ),
};

/** The trailing affordance. `xs` and `icon-xs` keep the group at its 40px height. */
export const AddonButton: StoryObj<typeof buttonMeta> = {
  args: { variant: 'ghost', size: 'xs' },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Button weight. `ghost` is the default so the addon never competes with the field.',
      table: { category: 'Appearance', defaultValue: { summary: 'ghost' } },
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'icon-xs', 'icon-sm'],
      description: 'Addon sizes only: anything taller than the group would break its height.',
      table: { category: 'Appearance', defaultValue: { summary: 'xs' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <InputGroup className="w-80">
      <InputGroupInput placeholder="Find an article" aria-label="Find an article" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton {...args}>{children ?? 'Go'}</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/**
 * `InputGroupText` has no props of its own, so there is nothing to control. What
 * matters is how it composes: plain text, a keyboard hint, and an icon, all on
 * the muted addon colour with the icon at 1rem.
 */
export const Text: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="konopski.dev" aria-label="Site address" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>
            <AtSignIcon aria-hidden="true" />
            handle
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="misiek" aria-label="Handle" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>
            <SearchIcon aria-hidden="true" />
            Press
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search" aria-label="Search" />
      </InputGroup>
    </div>
  ),
};

/** A textarea addon makes the group grow instead of stretching a single row. */
export const Textarea: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon align="block-start">
        <InputGroupText>Reply</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea
        placeholder="Write a reply"
        aria-label="Write a reply"
        className="min-h-20"
      />
      <InputGroupAddon align="block-end" className="justify-end">
        <InputGroupButton>Send</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/**
 * The three states the group has to render without a wrapper: disabled, invalid
 * (`aria-invalid` on the control paints the group's border), and required (the
 * placeholder stops announcing itself as optional).
 */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Disabled"
          aria-label="Disabled site address"
          disabled
          defaultValue="konopski.dev"
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Invalid"
          aria-label="Invalid site address"
          aria-invalid="true"
          defaultValue="not a url"
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Required" aria-label="Required site address" required />
      </InputGroup>
    </div>
  ),
};
