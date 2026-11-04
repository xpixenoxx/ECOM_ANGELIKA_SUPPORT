import type { Meta, StoryObj } from '@storybook/react';
import { Badge, StatusBadge, CategoryBadge, PriceBadge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium badge component with StatusBadge, CategoryBadge, and PriceBadge variants for e-commerce.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'soft', 'solid'],
      description: 'Badge visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    dot: {
      control: 'boolean',
      description: 'Show colored dot indicator',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'New',
  },
};

export const Outline: Story = {
  args: {
    children: 'Sale',
    variant: 'outline',
  },
};

export const Soft: Story = {
  args: {
    children: 'Limited',
    variant: 'soft',
  },
};

export const Solid: Story = {
  args: {
    children: 'Exclusive',
    variant: 'solid',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

export const WithDot: Story = {
  args: {
    children: 'In Stock',
    dot: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="solid">Solid</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

// StatusBadge Stories
export const StatusBadgeDefault: Story = {
  component: StatusBadge,
  args: {
    status: 'default',
  },
};

export const StatusBadgeNew: Story = {
  component: StatusBadge,
  args: {
    status: 'new',
  },
};

export const StatusBadgeSale: Story = {
  component: StatusBadge,
  args: {
    status: 'sale',
  },
};

export const StatusBadgeLimited: Story = {
  component: StatusBadge,
  args: {
    status: 'limited',
  },
};

export const StatusBadgeExclusive: Story = {
  component: StatusBadge,
  args: {
    status: 'exclusive',
  },
};

export const StatusBadgeOutOfStock: Story = {
  component: StatusBadge,
  args: {
    status: 'out-of-stock',
  },
};

export const StatusBadgeComingSoon: Story = {
  component: StatusBadge,
  args: {
    status: 'coming-soon',
  },
};

export const StatusBadgeAll: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="default" />
      <StatusBadge status="new" />
      <StatusBadge status="sale" />
      <StatusBadge status="limited" />
      <StatusBadge status="exclusive" />
      <StatusBadge status="out-of-stock" />
      <StatusBadge status="coming-soon" />
    </div>
  ),
};

// CategoryBadge Stories
export const CategoryBadgeKurti: Story = {
  component: CategoryBadge,
  args: {
    category: 'kurti',
  },
};

export const CategoryBadgeSalwar: Story = {
  component: CategoryBadge,
  args: {
    category: 'salwar',
  },
};

export const CategoryBadgeLehenga: Story = {
  component: CategoryBadge,
  args: {
    category: 'lehenga',
  },
};

export const CategoryBadgeSaree: Story = {
  component: CategoryBadge,
  args: {
    category: 'saree',
  },
};

export const CategoryBadgeDupatta: Story = {
  component: CategoryBadge,
  args: {
    category: 'dupatta',
  },
};

export const CategoryBadgeAll: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <CategoryBadge category="kurti" />
      <CategoryBadge category="salwar" />
      <CategoryBadge category="lehenga" />
      <CategoryBadge category="saree" />
      <CategoryBadge category="dupatta" />
    </div>
  ),
};

// PriceBadge Stories
export const PriceBadgeDefault: Story = {
  component: PriceBadge,
  args: {
    price: 3499,
  },
};

export const PriceBadgeWithOriginal: Story = {
  component: PriceBadge,
  args: {
    price: 3499,
    originalPrice: 4299,
  },
};

export const PriceBadgeLarge: Story = {
  component: PriceBadge,
  args: {
    price: 18999,
    originalPrice: 24999,
    size: 'lg',
  },
};

export const PriceBadgeSmall: Story = {
  component: PriceBadge,
  args: {
    price: 1499,
    size: 'sm',
  },
};

export const PriceBadgeWithDiscount: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <PriceBadge price={3499} originalPrice={4299} />
      <PriceBadge price={18999} originalPrice={24999} />
      <PriceBadge price={12999} originalPrice={15999} size="lg" />
      <PriceBadge price={2499} originalPrice={3299} size="sm" />
    </div>
  ),
};