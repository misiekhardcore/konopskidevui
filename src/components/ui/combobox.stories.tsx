import { useState } from 'react';
import { expect, screen, userEvent } from 'storybook/test';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from './combobox';

import type { Meta, StoryObj } from '@storybook/react-vite';

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt', 'Remix', 'Astro'];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  subcomponents: {
    ComboboxInput,
    ComboboxTrigger,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxChips,
    ComboboxChip,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An autocomplete input over a list of suggestions. Built on Base UI (the current shadcn implementation), so it keeps full keyboard and screen-reader behaviour without a third list library.',
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description: 'The list the combobox filters over.',
      table: { category: 'Data' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    defaultValue: {
      control: 'text',
      description: 'The value selected on first render.',
      table: { category: 'State' },
    },
    multiple: {
      control: 'boolean',
      description: 'Keep a set of values instead of one.',
      table: { category: 'Behaviour' },
    },
  },
  args: { disabled: false },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Parts get their own story so their props reach the Controls panel. */
const inputMeta = { component: ComboboxInput } as const satisfies Partial<
  Meta<typeof ComboboxInput>
>;
const contentMeta = { component: ComboboxContent } as const satisfies Partial<
  Meta<typeof ComboboxContent>
>;
const chipMeta = { component: ComboboxChip } as const satisfies Partial<Meta<typeof ComboboxChip>>;

const options = (item: string) => (
  <ComboboxItem key={item} value={item}>
    {item}
  </ComboboxItem>
);

export const Default: Story = {
  render: (args) => (
    <Combobox {...args} items={frameworks}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>{(item: string) => options(item)}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Preselected: Story = {
  args: { defaultValue: 'Astro' },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

/** The trailing affordances are `ComboboxInput` props, not separate parts to wire up. */
export const InputAffordances: StoryObj<typeof inputMeta> = {
  args: { showTrigger: true, showClear: true },
  argTypes: {
    showTrigger: {
      control: 'boolean',
      description: 'The disclosure button. Hides itself while the field has a value to clear.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    showClear: {
      control: 'boolean',
      description: 'The clear button, shown only once something is selected.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Combobox items={frameworks} defaultValue="Nuxt">
      <ComboboxInput {...args} placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>{(item: string) => options(item)}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

/** Where the popup opens, and how far from the field it sits. */
export const ContentPlacement: StoryObj<typeof contentMeta> = {
  args: { side: 'bottom', align: 'start', sideOffset: 6 },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Preferred side; it flips when there is no room.',
      table: { category: 'Layout', defaultValue: { summary: 'bottom' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Edge alignment against the field.',
      table: { category: 'Layout', defaultValue: { summary: 'start' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Gap between the field and the popup, in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '6' } },
    },
    alignOffset: { control: 'number', table: { category: 'Layout' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent {...args}>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>{(item: string) => options(item)}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

function ChipsExample({ showRemove }: { showRemove: boolean }) {
  const anchor = useComboboxAnchor();
  const [value, setValue] = useState<string[]>(['Astro']);

  return (
    <Combobox
      multiple
      items={frameworks}
      value={value}
      onValueChange={(next) => setValue(next as string[])}
    >
      <ComboboxChips ref={anchor}>
        {/* The chip at index *i* represents the *i*-th selected value. */}
        {value.map((item) => (
          <ComboboxChip key={item} showRemove={showRemove}>
            {item}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder="Add a framework" />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>{(item: string) => options(item)}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** `multiple` puts the selection in chips; `showRemove` decides whether each can be dropped. */
export const Chips: StoryObj<typeof chipMeta> = {
  args: { showRemove: true },
  argTypes: {
    showRemove: {
      control: 'boolean',
      description: 'Render the remove button inside the chip.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ showRemove }) => <ChipsExample showRemove={showRemove ?? true} />,
};

/** The empty state is a real slot: it only renders when nothing matches. */
export const Empty: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Search for a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>{(item: string) => options(item)}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText('Search for a framework (optional)');
    await userEvent.click(input);
    await userEvent.type(input, 'zzz');

    // The popup is portalled outside the story root, so the canvas query misses it.
    const empty = await screen.findByText('No frameworks found.');
    await expect(empty).toBeVisible();
  },
};
