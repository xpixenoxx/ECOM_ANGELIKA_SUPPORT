import type { Meta, StoryObj } from '@storybook/react';
import { useToast, useToastHelpers, ToastProvider } from './Toast';
import { Button } from './Button';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium toast notification system with 5 types, progress bar, spring animations, and action support.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

const ToastDemo = () => {
  const { addToast } = useToast();

  const showSuccess = () => addToast({
    type: 'success',
    title: 'Added to Bag!',
    message: 'Chikankari Kurti has been added to your shopping bag.',
    duration: 5000,
  });

  const showError = () => addToast({
    type: 'error',
    title: 'Error',
    message: 'Failed to add item. Please try again.',
    duration: 5000,
  });

  const showInfo = () => addToast({
    type: 'info',
    title: 'Shipping Update',
    message: 'Your order #AF-12345 has been shipped.',
    duration: 5000,
  });

  const showWarning = () => addToast({
    type: 'warning',
    title: 'Low Stock',
    message: 'Only 3 items left in your size.',
    duration: 5000,
  });

  const showLoading = () => addToast({
    type: 'loading',
    title: 'Processing...',
    message: 'Please wait while we process your order.',
    duration: 0,
  });

  const showWithAction = () => addToast({
    type: 'success',
    title: 'Item Added',
    message: 'Your item has been added to the cart.',
    action: {
      label: 'View Cart',
      onClick: () => console.log('View cart clicked'),
    },
    duration: 5000,
  });

  const showPersistent = () => addToast({
    type: 'error',
    title: 'Connection Lost',
    message: 'Please check your internet connection and try again.',
    duration: 0,
    dismissible: true,
  });

  return (
    <div className="space-y-3">
      <Button onClick={showSuccess} variant="primary">Show Success</Button>
      <Button onClick={showError} variant="danger">Show Error</Button>
      <Button onClick={showInfo} variant="secondary">Show Info</Button>
      <Button onClick={showWarning} variant="outline">Show Warning</Button>
      <Button onClick={showLoading} variant="ghost">Show Loading</Button>
      <Button onClick={showWithAction} variant="gold">Show with Action</Button>
      <Button onClick={showPersistent} variant="outline">Show Persistent</Button>
    </div>
  );
};

export const Default: Story = {
  render: () => <ToastDemo />,
};

export const Success: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => addToast({
        type: 'success',
        title: 'Success!',
        message: 'Your order has been placed successfully.',
      })}>
        Trigger Success Toast
      </Button>
    );
  },
};

export const Error: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => addToast({
        type: 'error',
        title: 'Error',
        message: 'Something went wrong. Please try again.',
      })} variant="danger">
        Trigger Error Toast
      </Button>
    );
  },
};

export const Info: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => addToast({
        type: 'info',
        title: 'Information',
        message: 'New collection launching soon!',
      })} variant="secondary">
        Trigger Info Toast
      </Button>
    );
  },
};

export const Warning: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => addToast({
        type: 'warning',
        title: 'Warning',
        message: 'This item is low in stock.',
      })} variant="outline">
        Trigger Warning Toast
      </Button>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => {
        const id = addToast({
          type: 'loading',
          title: 'Loading...',
          message: 'Please wait',
          duration: 0,
        });
        setTimeout(() => {
          addToast({ id, type: 'success', title: 'Complete!', message: 'Done!' });
        }, 2000);
      }}>
        Trigger Loading Toast
      </Button>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => addToast({
        type: 'success',
        title: 'Added to Wishlist',
        message: 'Chikankari Kurti saved for later.',
        action: {
          label: 'View Wishlist',
          onClick: () => alert('Navigating to wishlist...'),
        },
      })}>
        Trigger Toast with Action
      </Button>
    );
  },
};

export const AllTypes: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => addToast({ type: 'success', title: 'Success', message: 'Operation completed' })}>Success</Button>
        <Button variant="danger" onClick={() => addToast({ type: 'error', title: 'Error', message: 'Operation failed' })}>Error</Button>
        <Button variant="secondary" onClick={() => addToast({ type: 'info', title: 'Info', message: 'New update available' })}>Info</Button>
        <Button variant="outline" onClick={() => addToast({ type: 'warning', title: 'Warning', message: 'Low stock alert' })}>Warning</Button>
        <Button variant="ghost" onClick={() => addToast({ type: 'loading', title: 'Loading', message: 'Please wait...', duration: 0 })}>Loading</Button>
      </div>
    );
  },
};

export const MultipleToasts: Story = {
  render: () => {
    const { addToast } = useToast();
    return (
      <Button onClick={() => {
        addToast({ type: 'success', title: 'Toast 1', message: 'First toast' });
        setTimeout(() => addToast({ type: 'info', title: 'Toast 2', message: 'Second toast' }), 100);
        setTimeout(() => addToast({ type: 'warning', title: 'Toast 3', message: 'Third toast' }), 200);
        setTimeout(() => addToast({ type: 'error', title: 'Toast 4', message: 'Fourth toast' }), 300);
      }}>
        Show Multiple Toasts
      </Button>
    );
  },
};