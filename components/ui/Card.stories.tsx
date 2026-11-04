import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ProductCard } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium card component with multiple variants, padding options, and ProductCard for e-commerce.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'interactive', 'product', 'editorial'],
      description: 'Card visual variant',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card internal padding',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
    as: {
      control: 'select',
      options: ['div', 'article', 'section'],
      description: 'HTML element to render as',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">This is the card content area.</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Action</Button>
          <Button variant="primary" size="sm">Primary</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>With shadow elevation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">This card has elevated shadow.</p>
        </CardContent>
      </>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
          <CardDescription>With border outline</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">This card has a 2px border.</p>
        </CardContent>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    padding: 'md',
    hoverable: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Hover for elevation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">Hover this card to see elevation effect.</p>
        </CardContent>
      </>
    ),
  },
};

export const Product: Story = {
  args: {
    variant: 'product',
    padding: 'none',
    hoverable: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Product Card Variant</CardTitle>
          <CardDescription>For e-commerce product display</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">Optimized for product listings.</p>
        </CardContent>
      </>
    ),
  },
};

export const Editorial: Story = {
  args: {
    variant: 'editorial',
    padding: 'lg',
    children: (
      <>
        <CardHeader>
          <CardTitle>Editorial Card</CardTitle>
          <CardDescription>For content-heavy editorial layouts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">Minimal styling for editorial content.</p>
        </CardContent>
      </>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'default',
    padding: 'none',
    children: (
      <div className="bg-[var(--color-whisper)] h-32 flex items-center justify-center">
        <span className="text-[var(--color-mist)]">No padding - full bleed content</span>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'default',
    padding: 'sm',
    children: (
      <>
        <CardTitle>Small Padding</CardTitle>
        <CardContent>
          <p className="text-[var(--color-slate)]">Compact card with minimal padding.</p>
        </CardContent>
      </>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'default',
    padding: 'lg',
    children: (
      <>
        <CardHeader>
          <CardTitle>Large Padding</CardTitle>
          <CardDescription>Spacious card layout</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">Generous internal spacing for comfort.</p>
        </CardContent>
      </>
    ),
  },
};

export const AsArticle: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    as: 'article',
    children: (
      <>
        <CardHeader>
          <CardTitle>Article Element</CardTitle>
          <CardDescription>Semantic HTML for content</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">Rendered as {"<article>"} element.</p>
        </CardContent>
      </>
    ),
  },
};

export const AsSection: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    as: 'section',
    children: (
      <>
        <CardHeader>
          <CardTitle>Section Element</CardTitle>
          <CardDescription>Semantic HTML for sections</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-slate)]">Rendered as {"<section>"} element.</p>
        </CardContent>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {(['default', 'elevated', 'outlined', 'interactive', 'product', 'editorial'] as const).map((variant) => (
        <Card key={variant} variant={variant} padding="md">
          <CardHeader>
            <CardTitle>{variant.charAt(0).toUpperCase() + variant.slice(1)}</CardTitle>
            <CardDescription>Variant: {variant}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-slate)]">This is the {variant} variant.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

// ProductCard Stories
export const ProductCardDefault: Story = {
  component: ProductCard,
  args: {
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop',
    name: 'Chikankari Kurti',
    price: 3499,
    originalPrice: 4299,
    category: 'Kurti',
    colors: ['#F5F5F5', '#E8D8A8', '#D4B85C'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true,
    isVidhyasPick: true,
    rating: 4.8,
    reviewCount: 124,
    onQuickView: () => console.log('Quick view'),
    onAddToBag: () => console.log('Add to bag'),
    onAddToWishlist: () => console.log('Add to wishlist'),
  },
};

export const ProductCardOnSale: Story = {
  component: ProductCard,
  args: {
    image: 'https://images.unsplash.com/photo-1610033898473-3303b1f44f6a?w=400&h=500&fit=crop',
    name: 'Silk Lehenga Set',
    price: 18999,
    originalPrice: 24999,
    category: 'Lehenga',
    colors: ['#C46E6E', '#D18585'],
    sizes: ['S', 'M', 'L'],
    isSale: true,
    discount: 24,
    rating: 4.9,
    reviewCount: 89,
    onQuickView: () => console.log('Quick view'),
    onAddToBag: () => console.log('Add to bag'),
    onAddToWishlist: () => console.log('Add to wishlist'),
  },
};

export const ProductCardLimited: Story = {
  component: ProductCard,
  args: {
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop',
    name: 'Banarasi Saree',
    price: 12999,
    category: 'Saree',
    colors: ['#7A9E9E', '#8DB5B5'],
    sizes: ['One Size'],
    badge: 'limited',
    isNew: true,
    rating: 5.0,
    reviewCount: 12,
    onQuickView: () => console.log('Quick view'),
    onAddToBag: () => console.log('Add to bag'),
    onAddToWishlist: () => console.log('Add to wishlist'),
  },
};

export const ProductCardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-5xl">
      <ProductCard
        image="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop"
        name="Chikankari Kurti"
        price={3499}
        originalPrice={4299}
        category="Kurti"
        isNew={true}
        isVidhyasPick={true}
        rating={4.8}
        reviewCount={124}
        onQuickView={() => {}}
        onAddToBag={() => {}}
        onAddToWishlist={() => {}}
      />
      <ProductCard
        image="https://images.unsplash.com/photo-1610033898473-3303b1f44f6a?w=400&h=500&fit=crop"
        name="Silk Lehenga Set"
        price={18999}
        originalPrice={24999}
        category="Lehenga"
        isSale={true}
        discount={24}
        rating={4.9}
        reviewCount={89}
        onQuickView={() => {}}
        onAddToBag={() => {}}
        onAddToWishlist={() => {}}
      />
      <ProductCard
        image="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop"
        name="Banarasi Saree"
        price={12999}
        category="Saree"
        badge="limited"
        isNew={true}
        rating={5.0}
        reviewCount={12}
        onQuickView={() => {}}
        onAddToBag={() => {}}
        onAddToWishlist={() => {}}
      />
      <ProductCard
        image="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop"
        name="Cotton Salwar Set"
        price={2499}
        category="Salwar"
        colors={['#D4A574', '#DBAE85']}
        sizes={['XS', 'S', 'M', 'L', 'XL']}
        rating={4.6}
        reviewCount={203}
        onQuickView={() => {}}
        onAddToBag={() => {}}
        onAddToWishlist={() => {}}
      />
    </div>
  ),
};