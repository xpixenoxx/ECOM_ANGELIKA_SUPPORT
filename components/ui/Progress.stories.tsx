import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { Progress, StepProgress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium progress component with StepProgress for multi-step flows, animated, and variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Progress visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Progress bar height',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage label',
    },
    animated: {
      control: 'boolean',
      description: 'Animate progress bar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 65,
    showLabel: true,
  },
};

export const Small: Story = {
  args: {
    value: 65,
    size: 'sm',
    showLabel: true,
  },
};

export const Medium: Story = {
  args: {
    value: 65,
    size: 'md',
    showLabel: true,
  },
};

export const Large: Story = {
  args: {
    value: 65,
    size: 'lg',
    showLabel: true,
  },
};

export const NoLabel: Story = {
  args: {
    value: 65,
    showLabel: false,
  },
};

export const Success: Story = {
  args: {
    value: 100,
    variant: 'success',
    showLabel: true,
  },
};

export const Warning: Story = {
  args: {
    value: 75,
    variant: 'warning',
    showLabel: true,
  },
};

export const Error: Story = {
  args: {
    value: 0,
    variant: 'error',
    showLabel: true,
  },
};

export const Animated: Story = {
  render: () => {
    const [value, setValue] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setValue((prev) => {
          if (prev >= 100) return 0;
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-80 space-y-4">
        <Progress value={value} showLabel animated />
        <Progress value={value} variant="success" showLabel animated />
        <Progress value={value} variant="warning" showLabel animated />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Progress value={25} variant="default" showLabel />
      <Progress value={50} variant="success" showLabel />
      <Progress value={75} variant="warning" showLabel />
      <Progress value={100} variant="error" showLabel />
    </div>
  ),
};

export const FileUpload: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-80 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-ink)]">Uploading...</span>
          <span className="text-[var(--color-gold)] font-mono tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} variant="default" showLabel animated size="lg" />
        <p className="text-xs text-[var(--color-mist)]">2.4 MB / 5.2 MB</p>
      </div>
    );
  },
};

export const CheckoutProgress: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    return (
      <div className="w-80 space-y-4">
        <Progress value={(step / 3) * 100} showLabel size="lg" />
        <div className="flex justify-between">
          <Button variant={step > 1 ? 'ghost' : 'primary'} onClick={() => setStep(1)} disabled={step === 1}>Step 1</Button>
          <Button variant={step > 2 ? 'ghost' : step === 2 ? 'primary' : 'outline'} onClick={() => setStep(2)} disabled={step !== 2 && step !== 1}>Step 2</Button>
          <Button variant={step === 3 ? 'primary' : 'outline'} onClick={() => setStep(3)} disabled={step < 2}>Step 3</Button>
        </div>
      </div>
    );
  },
};

// StepProgress Stories
const checkoutSteps = [
  { id: 'contact', label: 'Contact', description: 'Email & delivery info' },
  { id: 'shipping', label: 'Shipping', description: 'Select delivery method' },
  { id: 'payment', label: 'Payment', description: 'Choose payment method' },
  { id: 'review', label: 'Review', description: 'Confirm & place order' },
];

export const StepProgressDefault: Story = {
  component: StepProgress,
  args: {
    steps: checkoutSteps,
    currentStep: 1,
  },
};

export const StepProgressSecond: Story = {
  component: StepProgress,
  args: {
    steps: checkoutSteps,
    currentStep: 2,
  },
};

export const StepProgressThird: Story = {
  component: StepProgress,
  args: {
    steps: checkoutSteps,
    currentStep: 3,
  },
};

export const StepProgressComplete: Story = {
  component: StepProgress,
  args: {
    steps: checkoutSteps,
    currentStep: 4,
  },
};

export const StepProgressVertical: Story = {
  component: StepProgress,
  args: {
    steps: checkoutSteps,
    currentStep: 2,
    orientation: 'vertical',
  },
};

export const OnboardingSteps: Story = {
  component: StepProgress,
  args: {
    steps: [
      { id: 'welcome', label: 'Welcome', description: 'Get started' },
      { id: 'profile', label: 'Profile', description: 'Tell us about you' },
      { id: 'preferences', label: 'Preferences', description: 'Style preferences' },
      { id: 'complete', label: 'Complete', description: 'You\'re all set!' },
    ],
    currentStep: 2,
  },
};

export const OrderTracking: Story = {
  component: StepProgress,
  args: {
    steps: [
      { id: 'placed', label: 'Order Placed', description: 'Order confirmed' },
      { id: 'confirmed', label: 'Confirmed', description: 'Seller confirmed' },
      { id: 'shipped', label: 'Shipped', description: 'On the way' },
      { id: 'delivered', label: 'Delivered', description: 'Received' },
    ],
    currentStep: 3,
  },
};

export const InteractiveStepProgress: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    return (
      <div className="w-96 space-y-6">
        <StepProgress
          steps={checkoutSteps}
          currentStep={currentStep}
        />
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>
            Previous
          </Button>
          <Button variant="primary" onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} disabled={currentStep === 4}>
            Next
          </Button>
        </div>
      </div>
    );
  },
};