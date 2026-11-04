import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer, CartDrawer } from './Drawer';
import { Button } from './Button';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium drawer component with position variants (right, left, bottom), spring animations, and CartDrawer specialization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Drawer size',
    },
    position: {
      control: 'select',
      options: ['right', 'left', 'bottom'],
      description: 'Drawer position',
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
type Story = StoryObj<typeof Drawer>;

const DrawerDemo = ({ position = 'right', size = 'md', ...props }: DrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open {position} Drawer</Button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} position={position} size={size} {...props}>
        <div className="space-y-4">
          <p className="text-[var(--color-slate)]">
            This is a drawer panel. It slides in from the {position} with spring-based animations.
          </p>
          <p className="text-[var(--color-slate)]">
            Drawers are ideal for filters, side navigation, cart details, and other contextual content.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-whisper)]">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>Action</Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

interface DrawerProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'right' | 'left' | 'bottom';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Default: Story = {
  render: () => <DrawerDemo />,
};

export const Right: Story = {
  render: () => <DrawerDemo position="right" />,
};

export const Left: Story = {
  render: () => <DrawerDemo position="left" />,
};

export const Bottom: Story = {
  render: () => <DrawerDemo position="bottom" size="full" />,
};

export const Small: Story = {
  render: () => <DrawerDemo size="sm" />,
};

export const Medium: Story = {
  render: () => <DrawerDemo size="md" />,
};

export const Large: Story = {
  render: () => <DrawerDemo size="lg" />,
};

export const Full: Story = {
  render: () => <DrawerDemo size="full" />,
};

export const WithTitleAndDescription: Story = {
  render: () => (
    <DrawerDemo
      title="Filter Products"
      description="Refine your search with these options"
    />
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <DrawerDemo showCloseButton={false} />
  ),
};

export const NoOverlayClose: Story = {
  render: () => (
    <DrawerDemo closeOnOverlayClick={false} />
  ),
};

export const NoEscapeClose: Story = {
  render: () => (
    <DrawerDemo closeOnEscape={false} />
  ),
};

export const CustomContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Filter Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Filters"
          description="Refine your search"
          size="lg"
          position="right"
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-[var(--color-ink)] mb-3">Category</h4>
              <div className="space-y-2">
                {['Kurti', 'Salwar', 'Lehenga', 'Saree', 'Dupatta'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[var(--color-gold)] border-[var(--color-whisper)] rounded-[var(--radius-sm)] focus:ring-[var(--color-gold)]" />
                    <span className="text-[var(--color-charcoal)]">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-[var(--color-ink)] mb-3">Price Range</h4>
              <div className="flex items-center gap-3">
                <input type="number" placeholder="Min" className="w-24 px-3 py-2 border border-[var(--color-whisper)] rounded-[var(--radius-md)] text-[var(--color-ink)]" />
                <span className="text-[var(--color-mist)]">to</span>
                <input type="number" placeholder="Max" className="w-24 px-3 py-2 border border-[var(--color-whisper)] rounded-[var(--radius-md)] text-[var(--color-ink)]" />
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--color-whisper)] flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Clear All</Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

// CartDrawer Stories
const mockCartItems = [
  {
    id: '1',
    productId: 'p1',
    name: 'Chikankari Kurti',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=200&h=250&fit=crop',
    price: 3499,
    quantity: 2,
    size: 'M',
    color: 'Ivory',
    maxQuantity: 5,
  },
  {
    id: '2',
    productId: 'p2',
    name: 'Silk Lehenga Set',
    image: 'https://images.unsplash.com/photo-1610033898473-3303b1f44f6a?w=200&h=250&fit=crop',
    price: 18999,
    quantity: 1,
    size: 'L',
    color: 'Deep Rose',
    maxQuantity: 2,
  },
  {
    id: '3',
    productId: 'p3',
    name: 'Cotton Dupatta',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=250&fit=crop',
    price: 1499,
    quantity: 3,
    color: 'Teal',
    maxQuantity: 10,
  },
];

export const CartDrawerDefault: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={mockCartItems}
        subtotal={27496}
        discount={2000}
        shipping={0}
        tax={4574}
        total={30070}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onProceedToCheckout={() => {}}
        couponCode="WELCOME20"
        onApplyCoupon={() => {}}
        onRemoveCoupon={() => {}}
      />
    );
  },
};

export const CartDrawerEmpty: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={[]}
        subtotal={0}
        total={0}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onProceedToCheckout={() => {}}
      />
    );
  },
};

export const CartDrawerWithCoupon: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={mockCartItems}
        subtotal={27496}
        discount={0}
        shipping={0}
        tax={4574}
        total={32070}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onProceedToCheckout={() => {}}
        onApplyCoupon={() => {}}
      />
    );
  },
};

export const CartDrawerLoading: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={mockCartItems}
        subtotal={27496}
        discount={2000}
        shipping={0}
        tax={4574}
        total={30070}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
        onProceedToCheckout={() => {}}
        isLoading={true}
      />
    );
  },
};