import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
} from './avatar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  subcomponents: { AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge },
  parameters: {
    docs: {
      description: {
        component:
          'A user image with a text fallback. The fallback is what a screen reader reads, so keep the initials meaningful.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Diameter: 24px, 32px or 40px.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    size: 'default',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Avatar {...args}>
        <AvatarImage
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop"
          alt="Ada Lovelace"
        />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
    </div>
  ),
};

/** The three diameters, with and without an image. */
export const Sizes: Story = {
  parameters: { controls: { include: ['size'] } },
  render: () => (
    <div className="flex items-center gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>{size === 'sm' ? 'S' : size === 'lg' ? 'LG' : 'M'}</AvatarFallback>
          <AvatarBadge />
        </Avatar>
      ))}
    </div>
  ),
};

/** A broken image falls back to the initials, which is why the fallback is required. */
export const FallbackOnly: Story = {
  parameters: { controls: { include: ['size'] } },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://example.invalid/missing.png" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
};
