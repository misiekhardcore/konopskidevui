import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox';

import type { Meta, StoryObj } from '@storybook/react-vite';

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt', 'Remix', 'Astro'];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  subcomponents: {
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An autocomplete input over a list of suggestions. Built on Base UI (the current shadcn implementation), so it keeps full keyboard and screen-reader behaviour without a third listbox implementation.',
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

export const Default: Story = {
  render: (args) => (
    <Combobox {...args} items={frameworks}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
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
