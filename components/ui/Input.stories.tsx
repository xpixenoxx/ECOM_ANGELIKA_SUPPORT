import type { Meta, StoryObj } from '@storybook/react';
import { Input, Textarea } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium input component with label, error, hint, icons, and focus states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width input',
    },
    leftIcon: {
      control: false,
      description: 'Icon on the left side',
    },
    rightIcon: {
      control: false,
      description: 'Icon on the right side',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    hint: {
      control: 'text',
      description: 'Helper hint text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    hint: 'Must be at least 8 characters',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search products...',
    leftIcon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Amount',
    placeholder: '0.00',
    rightIcon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    label: 'Small Input',
    placeholder: 'Small size',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Input',
    placeholder: 'Large size',
    size: 'lg',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Field *',
    placeholder: 'This field is required',
    required: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Input label="Small" placeholder="Small size" size="sm" />
      <Input label="Medium" placeholder="Medium size" size="md" />
      <Input label="Large" placeholder="Large size" size="lg" />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="w-80 space-y-4">
      <Input label="First Name" placeholder="John" required />
      <Input label="Last Name" placeholder="Doe" required />
      <Input label="Email" type="email" placeholder="john@example.com" required />
      <Input label="Phone" type="tel" placeholder="+91 98765 43210" hint="For delivery updates" />
      <Button type="submit" className="w-full">Submit</Button>
    </form>
  ),
};

// Textarea Stories
export const TextareaDefault: Story = {
  component: Textarea,
  args: {
    label: 'Message',
    placeholder: 'Enter your message...',
    rows: 4,
  },
};

export const TextareaWithError: Story = {
  component: Textarea,
  args: {
    label: 'Review',
    placeholder: 'Write a review...',
    rows: 4,
    error: 'Review must be at least 50 characters',
  },
};

export const TextareaWithHint: Story = {
  component: Textarea,
  args: {
    label: 'Special Instructions',
    placeholder: 'Any special requests...',
    rows: 3,
    hint: 'Optional: Gift message, delivery instructions, etc.',
  },
};