import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonProductCard, SkeletonTable, SkeletonForm, SkeletonList } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium skeleton loading components with gold shimmer animation for brand consistency.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Skeleton shape variant',
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
      description: 'Animation type',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-4 w-48',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    className: 'h-4 w-64',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    className: 'w-12 h-12',
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    className: 'w-32 h-32',
  },
};

export const Small: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-3 w-24',
  },
};

export const Large: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-8 w-80',
  },
};

export const WaveAnimation: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-4 w-64',
    animation: 'wave',
  },
};

export const PulseAnimation: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-4 w-64',
    animation: 'pulse',
  },
};

export const NoAnimation: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-4 w-64',
    animation: 'none',
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-3 w-80">
      <Skeleton variant="text" className="h-6 w-3/4" />
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-5/6" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
  ),
};

// SkeletonText Stories
export const SkeletonTextDefault: Story = {
  component: SkeletonText,
  args: {
    lines: 3,
  },
};

export const SkeletonTextSingle: Story = {
  component: SkeletonText,
  args: {
    lines: 1,
  },
};

export const SkeletonTextFive: Story = {
  component: SkeletonText,
  args: {
    lines: 5,
  },
};

export const SkeletonTextWithWidth: Story = {
  component: SkeletonText,
  args: {
    lines: 3,
    className: 'max-w-md',
  },
};

// SkeletonCard Stories
export const SkeletonCardDefault: Story = {
  component: SkeletonCard,
  args: {
    showImage: true,
    showTitle: true,
    showDescription: true,
    showAction: true,
  },
};

export const SkeletonCardNoImage: Story = {
  component: SkeletonCard,
  args: {
    showImage: false,
    showTitle: true,
    showDescription: true,
    showAction: true,
  },
};

export const SkeletonCardMinimal: Story = {
  component: SkeletonCard,
  args: {
    showImage: true,
    showTitle: true,
    showDescription: false,
    showAction: false,
  },
};

export const SkeletonCardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-5xl">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} showImage showTitle showDescription showAction />
      ))}
    </div>
  ),
};

// SkeletonProductCard Stories
export const SkeletonProductCardDefault: Story = {
  component: SkeletonProductCard,
};

export const SkeletonProductCardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-5xl">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  ),
};

// SkeletonTable Stories
export const SkeletonTableDefault: Story = {
  component: SkeletonTable,
  args: {
    rows: 5,
    columns: 5,
    showHeader: true,
  },
};

export const SkeletonTableNoHeader: Story = {
  component: SkeletonTable,
  args: {
    rows: 5,
    columns: 5,
    showHeader: false,
  },
};

export const SkeletonTableManyRows: Story = {
  component: SkeletonTable,
  args: {
    rows: 10,
    columns: 6,
    showHeader: true,
  },
};

export const SkeletonTableFewColumns: Story = {
  component: SkeletonTable,
  args: {
    rows: 5,
    columns: 3,
    showHeader: true,
  },
};

// SkeletonForm Stories
export const SkeletonFormDefault: Story = {
  component: SkeletonForm,
  args: {
    fields: 5,
    showButton: true,
  },
};

export const SkeletonFormShort: Story = {
  component: SkeletonForm,
  args: {
    fields: 3,
    showButton: true,
  },
};

export const SkeletonFormLong: Story = {
  component: SkeletonForm,
  args: {
    fields: 8,
    showButton: true,
  },
};

export const SkeletonFormNoButton: Story = {
  component: SkeletonForm,
  args: {
    fields: 4,
    showButton: false,
  },
};

// SkeletonList Stories
export const SkeletonListDefault: Story = {
  component: SkeletonList,
  args: {
    items: 5,
    showAvatar: true,
    showTitle: true,
    showDescription: true,
    showMeta: true,
  },
};

export const SkeletonListNoAvatar: Story = {
  component: SkeletonList,
  args: {
    items: 5,
    showAvatar: false,
    showTitle: true,
    showDescription: true,
    showMeta: true,
  },
};

export const SkeletonListMinimal: Story = {
  component: SkeletonList,
  args: {
    items: 5,
    showAvatar: true,
    showTitle: true,
    showDescription: false,
    showMeta: false,
  },
};

export const SkeletonListMany: Story = {
  component: SkeletonList,
  args: {
    items: 10,
    showAvatar: true,
    showTitle: true,
    showDescription: true,
    showMeta: true,
  },
};

// Page-level skeletons
export const ProductListingPage: Story = {
  render: () => (
    <div className="w-full max-w-5xl space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonText lines={1} className="max-w-xs" />
        <Skeleton variant="rectangular" className="h-10 w-32" animation="wave" />
      </div>
      {/* Filter skeleton */}
      <div className="flex gap-4">
        <Skeleton variant="rectangular" className="h-10 w-40" />
        <Skeleton variant="rectangular" className="h-10 w-40" />
        <Skeleton variant="rectangular" className="h-10 w-40" />
      </div>
      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
      {/* Pagination skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton variant="rectangular" className="h-10 w-10 rounded-[var(--radius-md)]" />
        <Skeleton variant="rectangular" className="h-10 w-10 rounded-[var(--radius-md)]" />
        <Skeleton variant="rectangular" className="h-10 w-10 rounded-[var(--radius-md)]" />
      </div>
    </div>
  ),
};

export const ProductDetailPage: Story = {
  render: () => (
    <div className="w-full max-w-4xl space-y-8">
      {/* Image gallery skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="rectangular" className="aspect-[3/4] w-full rounded-[var(--radius-xl)]" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rectangular" className="aspect-square rounded-[var(--radius-lg)]" />
          <Skeleton variant="rectangular" className="aspect-square rounded-[var(--radius-lg)]" />
        </div>
      </div>
      {/* Product info skeleton */}
      <div className="space-y-4">
        <SkeletonText lines={1} className="max-w-xs" />
        <SkeletonText lines={1} className="max-w-md" />
        <Skeleton variant="rectangular" className="h-8 w-32" />
        <SkeletonText lines={3} />
      </div>
      {/* Size/color selector skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton variant="rectangular" key={i} className="h-10 w-10 rounded-[var(--radius-md)]" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton variant="circular" key={i} className="w-8 h-8" />
          ))}
        </div>
      </div>
      {/* Action buttons skeleton */}
      <div className="flex gap-4">
        <Skeleton variant="rectangular" className="h-12 w-full rounded-[var(--radius-md)]" />
        <Skeleton variant="rectangular" className="h-12 w-12 rounded-[var(--radius-md)]" />
      </div>
      {/* Description skeleton */}
      <SkeletonText lines={6} />
      {/* Reviews skeleton */}
      <div className="space-y-4">
        <SkeletonText lines={1} className="max-w-xs" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-[var(--color-snow)] rounded-[var(--radius-lg)] space-y-2">
            <SkeletonText lines={1} className="max-w-sm" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const CheckoutPage: Story = {
  render: () => (
    <div className="w-full max-w-3xl space-y-8">
      {/* Step progress skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="rectangular" className="h-1 flex-1" />
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="rectangular" className="h-1 flex-1" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      {/* Form skeleton */}
      <SkeletonForm fields={6} showButton={false} />
      {/* Order summary skeleton */}
      <div className="p-6 bg-[var(--color-snow)] rounded-[var(--radius-xl)] space-y-3">
        <SkeletonText lines={1} className="max-w-xs" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <SkeletonText lines={1} className="max-w-md" />
            <Skeleton variant="rectangular" className="h-5 w-20 text-right" />
          </div>
        ))}
        <div className="pt-3 border-t border-[var(--color-whisper)] flex justify-between">
          <SkeletonText lines={1} className="max-w-md" />
          <Skeleton variant="rectangular" className="h-6 w-24 text-right" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-12 w-full rounded-[var(--radius-md)]" />
    </div>
  ),
};