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
      control: 'inline-radio',
      options: ['idle', 'uploading', 'processing', 'error', 'done'],
      description: 'Upload lifecycle. `uploading` and `processing` shimmer the title.',
      table: { category: 'State', defaultValue: { summary: 'done' } },
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'sm', 'xs'],
      description: 'Media box and row density.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: '`vertical` stacks the media above the text, for a card grid.',
      table: { category: 'Layout', defaultValue: { summary: 'horizontal' } },
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

const mediaMeta = { component: AttachmentMedia } as const satisfies Partial<
  Meta<typeof AttachmentMedia>
>;
const actionMeta = { component: AttachmentAction } as const satisfies Partial<
  Meta<typeof AttachmentAction>
>;

export const Default: Story = {
  render: (args) => (
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
  ),
};

/** Every upload state in one column: dashed while idle, shimmering while busy, tinted on error. */
export const States: Story = {
  parameters: { controls: { include: ['size', 'orientation'] } },
  render: (args) => (
    <div className="flex w-96 flex-col gap-3">
      {(['idle', 'uploading', 'processing', 'error', 'done'] as const).map((state) => (
        <Attachment key={state} {...args} state={state}>
          <AttachmentMedia>
            <span aria-hidden="true">📄</span>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{state}.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${state}.pdf`}>✕</AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </div>
  ),
};

/** `vertical` is the card-grid orientation: the media becomes a full-width banner. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  parameters: { controls: { include: ['state', 'size'] } },
  render: (args) => (
    <Attachment {...args} className="w-56">
      <AttachmentMedia variant="image">
        <span aria-hidden="true">🖼</span>
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>cover.png</AttachmentTitle>
        <AttachmentDescription>PNG · 800 × 450</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
};

/** The three sizes change the media box; the text stays the same 14px. */
export const Sizes: Story = {
  parameters: { controls: { include: ['state', 'orientation'] } },
  render: (args) => (
    <div className="flex w-96 flex-col gap-3">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Attachment key={size} {...args} size={size}>
          <AttachmentMedia>
            <span aria-hidden="true">📄</span>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{size}.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  ),
};

/** `icon` frames a glyph; `image` lets a thumbnail fill the box instead. */
export const Media: StoryObj<typeof mediaMeta> = {
  args: { variant: 'icon' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['icon', 'image'],
      description: 'Whether the media box frames an icon or a thumbnail.',
      table: { category: 'Appearance', defaultValue: { summary: 'icon' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Attachment className="w-96">
      <AttachmentMedia {...args}>
        <span aria-hidden="true">{args.variant === 'image' ? '🖼' : '📄'}</span>
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
        <AttachmentDescription>Media variant: {args.variant}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
};

/** The action is a `Button`, so it takes its variants and the compact icon sizes. */
export const Action: StoryObj<typeof actionMeta> = {
  args: { variant: 'ghost', size: 'icon-xs' },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Button weight. `ghost` keeps the row quiet.',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      description: 'Button size.',
      table: { category: 'Appearance', defaultValue: { summary: 'icon-xs' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Attachment className="w-96">
      <AttachmentMedia>
        <span aria-hidden="true">📄</span>
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
        <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction {...args} aria-label="Remove sales-dashboard.pdf">
          ✕
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
};
