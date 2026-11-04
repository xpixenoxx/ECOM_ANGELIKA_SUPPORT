import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup, UserAvatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium avatar component with AvatarGroup and UserAvatar for user profiles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
    fallback: {
      control: 'text',
      description: 'Fallback text when no image',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
  },
};

export const ExtraSmall: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    size: 'xl',
  },
};

export const DoubleExtraLarge: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    size: '2xl',
  },
};

export const Square: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    alt: 'User avatar',
    shape: 'square',
  },
};

export const Fallback: Story = {
  args: {
    fallback: 'VD',
    alt: 'Vidhya',
  },
};

export const FallbackWithName: Story = {
  args: {
    fallback: 'Priya Sharma',
    alt: 'Priya Sharma',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="xs" fallback="XS" />
      <Avatar size="sm" fallback="SM" />
      <Avatar size="md" fallback="MD" />
      <Avatar size="lg" fallback="LG" />
      <Avatar size="xl" fallback="XL" />
      <Avatar size="2xl" fallback="2XL" />
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
        alt="User 1"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        alt="User 2"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
        alt="User 3"
      />
    </div>
  ),
};

// AvatarGroup Stories
export const AvatarGroupDefault: Story = {
  component: AvatarGroup,
  args: {
    avatars: [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', name: 'Vidhya' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', name: 'Priya' },
      { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', name: 'Anjali' },
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', name: 'Meera' },
      { fallback: '+2' },
    ],
    max: 4,
  },
};

export const AvatarGroupSmall: Story = {
  component: AvatarGroup,
  args: {
    avatars: [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', name: 'User 1' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', name: 'User 2' },
      { fallback: '+3' },
    ],
    max: 3,
    size: 'sm',
  },
};

export const AvatarGroupLarge: Story = {
  component: AvatarGroup,
  args: {
    avatars: [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', name: 'User 1' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', name: 'User 2' },
      { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', name: 'User 3' },
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', name: 'User 4' },
      { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', name: 'User 5' },
      { fallback: '+5' },
    ],
    max: 5,
    size: 'lg',
  },
};

export const AvatarGroupSquare: Story = {
  component: AvatarGroup,
  args: {
    avatars: [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', name: 'User 1' },
      { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', name: 'User 2' },
      { fallback: '+1' },
    ],
    max: 2,
    shape: 'square',
  },
};

// UserAvatar Stories
export const UserAvatarDefault: Story = {
  component: UserAvatar,
  args: {
    name: 'Vidhya',
    size: 'md',
  },
};

export const UserAvatarWithImage: Story = {
  component: UserAvatar,
  args: {
    name: 'Priya Sharma',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    size: 'lg',
  },
};

export const UserAvatarAllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar name="A" size="xs" />
      <UserAvatar name="AB" size="sm" />
      <UserAvatar name="ABC" size="md" />
      <UserAvatar name="ABCD" size="lg" />
      <UserAvatar name="ABCDE" size="xl" />
    </div>
  ),
};

export const UserAvatarColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {['Vidhya', 'Priya', 'Anjali', 'Meera', 'Kavya', 'Sonia', 'Riya', 'Neha'].map((name) => (
        <UserAvatar key={name} name={name} size="md" />
      ))}
    </div>
  ),
};