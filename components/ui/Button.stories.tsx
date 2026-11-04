import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium button component with magnetic hover, ripple effect, and multiple variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'whatsapp', 'outline', 'danger', 'gold'],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
    disableMagnetic: {
      control: 'boolean',
      description: 'Disable magnetic hover effect',
    },
    disableRipple: {
      control: 'boolean',
      description: 'Disable click ripple effect',
    },
    disableScale: {
      control: 'boolean',
      description: 'Disable scale animations',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (e.g., Link)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Add to Bag',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'View Details',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Cancel',
    variant: 'ghost',
    size: 'md',
  },
};

export const WhatsApp: Story = {
  args: {
    children: 'Chat on WhatsApp',
    variant: 'whatsapp',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Learn More',
    variant: 'outline',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
    size: 'md',
  },
};

export const Gold: Story = {
  args: {
    children: 'Exclusive Access',
    variant: 'gold',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Button',
    variant: 'primary',
    size: 'xl',
  },
};

export const Loading: Story = {
  args: {
    children: 'Processing...',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const WithIconLeft: Story = {
  args: {
    children: 'Add to Cart',
    variant: 'primary',
    size: 'md',
    iconLeft: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1 0 8" />
      </svg>
    ),
  },
};

export const WithIconRight: Story = {
  args: {
    children: 'Continue',
    variant: 'primary',
    size: 'md',
    iconRight: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    variant: 'primary',
    size: 'md',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="whatsapp">WhatsApp</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="gold">Gold</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" size="xl">Extra Large</Button>
    </div>
  ),
};