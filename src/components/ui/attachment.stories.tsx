import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
} from './attachment';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Attachment',
  component: Attachment,
  tags: ['autodocs'],
  subcomponents: {
    AttachmentGroup,
    AttachmentMedia,
    AttachmentContent,
    AttachmentTitle,
    AttachmentDescription,
    AttachmentActions,
    AttachmentAction,
    AttachmentTrigger,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A file or image attachment with media, metadata, upload state and actions. Used in composers, message threads and upload lists.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'uploading', 'processing', 'error', 'done'],
      description: 'Upload lifecycle. `uploading` and `processing` shimmer the title.',
      table: { category: 'State' },
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'default'],
      table: { category: 'Appearance' },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    state: 'done',
    size: 'default',
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex w-96 flex-col gap-3">
        <Attachment {...args}>
          <AttachmentMedia>
            <span aria-hidden="true">📄</span>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove sales-dashboard.pdf">✕</AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </div>
    </>
  ),
};
