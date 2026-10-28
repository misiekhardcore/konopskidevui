import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Stacks collapsible sections so a long page stays scannable. `type="single"` behaves like an FAQ; `type="multiple"` lets independent sections stay open together.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description:
        'How many sections can be open at once. A discriminated prop: `collapsible` and a string `defaultValue` only apply to `single`.',
      table: { category: 'Behaviour' },
    },
    collapsible: {
      control: 'boolean',
      description: 'Only with `type="single"`: allow closing the open section.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
  },
  args: { collapsible: 'true', disabled: false },
  render: (args) => (
    <Accordion {...args} type="single" defaultValue="shipping" className="w-96">
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>Two to four working days within the EU.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Can I return an item?</AccordionTrigger>
        <AccordionContent>Within 30 days, unopened and in its original packaging.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I reach support?</AccordionTrigger>
        <AccordionContent>Reply to your order confirmation email.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Multiple: Story = {
  parameters: { controls: { include: ['disabled'] } },
  render: (args) => (
    <Accordion {...args} type="multiple" defaultValue={['shipping', 'returns']} className="w-96">
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Two to four working days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Within 30 days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
