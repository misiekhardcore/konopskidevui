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
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Diameter of the avatar.',
      table: { category: 'Appearance' },
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
  render: (args) => (
    <>
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
    </>
  ),
};
