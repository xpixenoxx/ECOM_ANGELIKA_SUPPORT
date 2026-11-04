import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, ConfirmModal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium modal component with FocusTrap, spring animations, and ConfirmModal variant.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Close on overlay click',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close on Escape key',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalDemo = ({ size = 'md', ...props }: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={size} {...props}>
        <div className="space-y-4">
          <p className="text-[var(--color-slate)]">
            This is a modal dialog. It features spring-based entrance animations,
            FocusTrap for accessibility, and can be customized with various sizes.
          </p>
          <p className="text-[var(--color-slate)]">
            The modal traps focus within its content and restores focus to the
            trigger element when closed.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

interface ModalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Default: Story = {
  render: () => <ModalDemo />,
};

export const Small: Story = {
  render: () => <ModalDemo size="sm" />,
};

export const Medium: Story = {
  render: () => <ModalDemo size="md" />,
};

export const Large: Story = {
  render: () => <ModalDemo size="lg" />,
};

export const ExtraLarge: Story = {
  render: () => <ModalDemo size="xl" />,
};

export const FullScreen: Story = {
  render: () => <ModalDemo size="full" />,
};

export const WithTitleAndDescription: Story = {
  render: () => (
    <ModalDemo
      title="Modal Title"
      description="This is a descriptive text that provides more context about the modal content."
    />
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <ModalDemo showCloseButton={false} />
  ),
};

export const NoOverlayClose: Story = {
  render: () => (
    <ModalDemo closeOnOverlayClick={false} />
  ),
};

export const NoEscapeClose: Story = {
  render: () => (
    <ModalDemo closeOnEscape={false} />
  ),
};

export const CustomContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Custom Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Custom Content"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-md)]">
                <h4 className="font-medium text-[var(--color-ink)]">Feature One</h4>
                <p className="mt-1 text-sm text-[var(--color-slate)]">Description of feature one.</p>
              </div>
              <div className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-md)]">
                <h4 className="font-medium text-[var(--color-ink)]">Feature Two</h4>
                <p className="mt-1 text-sm text-[var(--color-slate)]">Description of feature two.</p>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-gold-light)] rounded-[var(--radius-md)] border border-[var(--color-gold)]">
              <h4 className="font-medium text-[var(--color-ink)]">Special Offer</h4>
              <p className="mt-1 text-sm text-[var(--color-charcoal)]">Get 20% off your first order with code WELCOME20</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Maybe Later</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Claim Offer</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

// ConfirmModal Stories
export const ConfirmModalDefault: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>Delete Item</Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => { setIsOpen(false); alert('Confirmed!'); }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </>
    );
  },
};

export const ConfirmModalPrimary: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Confirm Action</Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => { setIsOpen(false); alert('Confirmed!'); }}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          confirmText="Proceed"
          cancelText="Cancel"
          variant="primary"
        />
      </>
    );
  },
};

export const ConfirmModalLoading: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsOpen(false);
      }, 2000);
    };
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Loading Confirm</Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          title="Processing"
          message="Please wait while we process your request..."
          confirmText="Confirm"
          cancelText="Cancel"
          loading={loading}
        />
      </>
    );
  },
};