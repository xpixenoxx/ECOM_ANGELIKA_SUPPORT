import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabPanel } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium tabs component with animated indicator, keyboard navigation, and TabPanel.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'underline', 'pills'],
      description: 'Tabs visual variant',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Tabs orientation',
    },
    defaultIndex: {
      control: 'number',
      description: 'Default active tab index',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const tabData = [
  { id: 'details', label: 'Details', content: 'Product details and specifications go here. This includes fabric composition, care instructions, and sizing information.' },
  { id: 'shipping', label: 'Shipping', content: 'Shipping information including delivery times, costs, and international shipping options. Free shipping on orders over ₹999.' },
  { id: 'returns', label: 'Returns', content: 'Return policy: 30-day free returns. Items must be unworn with tags attached. Refunds processed within 5-7 business days.' },
  { id: 'reviews', label: 'Reviews (124)', content: 'Customer reviews and ratings. Average rating: 4.8/5 stars. Read what other customers have to say.' },
];

export const Default: Story = {
  args: {
    tabs: tabData,
    defaultIndex: 0,
  },
};

export const Underline: Story = {
  args: {
    tabs: tabData,
    variant: 'underline',
    defaultIndex: 0,
  },
};

export const Pills: Story = {
  args: {
    tabs: tabData,
    variant: 'pills',
    defaultIndex: 0,
  },
};

export const WithDefaultIndex: Story = {
  args: {
    tabs: tabData,
    defaultIndex: 1,
  },
};

export const Vertical: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview', content: 'Overview content here...' },
      { id: 'features', label: 'Features', content: 'Features content here...' },
      { id: 'pricing', label: 'Pricing', content: 'Pricing content here...' },
      { id: 'contact', label: 'Contact', content: 'Contact content here...' },
    ],
    orientation: 'vertical',
    defaultIndex: 0,
  },
};

export const VerticalPills: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview', content: 'Overview content here...' },
      { id: 'features', label: 'Features', content: 'Features content here...' },
      { id: 'pricing', label: 'Pricing', content: 'Pricing content here...' },
    ],
    orientation: 'vertical',
    variant: 'pills',
    defaultIndex: 0,
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'Tab One', content: 'Content for tab one' },
      { id: 'tab2', label: 'Tab Two', content: 'Content for tab two' },
    ],
    defaultIndex: 0,
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: 't1', label: 'Tab 1', content: 'Content 1' },
      { id: 't2', label: 'Tab 2', content: 'Content 2' },
      { id: 't3', label: 'Tab 3', content: 'Content 3' },
      { id: 't4', label: 'Tab 4', content: 'Content 4' },
      { id: 't5', label: 'Tab 5', content: 'Content 5' },
      { id: 't6', label: 'Tab 6', content: 'Content 6' },
      { id: 't7', label: 'Tab 7', content: 'Content 7' },
    ],
    defaultIndex: 0,
  },
};

export const ProductTabs: Story = {
  args: {
    tabs: [
      {
        id: 'description',
        label: 'Description',
        content: (
          <div className="space-y-4">
            <p className="text-[var(--color-slate)]">
              This exquisite Chikankari kurti is handcrafted by skilled artisans in Lucknow.
              The delicate white-on-white embroidery features traditional floral motifs
              inspired by Mughal architecture.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-[var(--color-ink)]">Fabric</h5>
                <p className="text-[var(--color-slate)]">100% Cotton Chanderi</p>
              </div>
              <div>
                <h5 className="font-medium text-[var(--color-ink)]">Care</h5>
                <p className="text-[var(--color-slate)]">Dry clean only</p>
              </div>
              <div>
                <h5 className="font-medium text-[var(--color-ink)]">Fit</h5>
                <p className="text-[var(--color-slate)]">Relaxed, true to size</p>
              </div>
              <div>
                <h5 className="font-medium text-[var(--color-ink)]">Origin</h5>
                <p className="text-[var(--color-slate)]">Lucknow, India</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'size-guide',
        label: 'Size Guide',
        content: (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-whisper)]">
                  <th className="text-left py-2 px-3 font-medium text-[var(--color-ink)]">Size</th>
                  <th className="text-left py-2 px-3 font-medium text-[var(--color-ink)]">Bust (in)</th>
                  <th className="text-left py-2 px-3 font-medium text-[var(--color-ink)]">Waist (in)</th>
                  <th className="text-left py-2 px-3 font-medium text-[var(--color-ink)]">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size, i) => (
                  <tr key={size} className="border-b border-[var(--color-whisper)]">
                    <td className="py-2 px-3 font-medium text-[var(--color-ink)]">{size}</td>
                    <td className="py-2 px-3 text-[var(--color-slate)]">{30 + i * 2}</td>
                    <td className="py-2 px-3 text-[var(--color-slate)]">{28 + i * 2}</td>
                    <td className="py-2 px-3 text-[var(--color-slate)]">{40 + i}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      {
        id: 'reviews',
        label: 'Reviews (124)',
        content: (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-[var(--color-gold)]">4.8</div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`h-5 w-5 ${i < 4 ? 'text-[var(--color-gold)] fill-current' : 'text-[var(--color-whisper)]'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[var(--color-slate)]">124 reviews</span>
            </div>
            <div className="space-y-3">
              {['Priya S.', 'Anjali M.', 'Kavya R.'].map((name, i) => (
                <div key={i} className="p-3 bg-[var(--color-snow)] rounded-[var(--radius-md)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[var(--color-ink)]">{name}</span>
                    <span className="text-[var(--color-gold)]">Verified Purchase</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-[var(--color-gold)] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[var(--color-slate)] text-sm">Beautiful kurti, perfect fit!</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
    defaultIndex: 0,
  },
};

export const AccountTabs: Story = {
  args: {
    tabs: [
      { id: 'orders', label: 'My Orders', content: 'Order history and tracking...' },
      { id: 'wishlist', label: 'Wishlist', content: 'Saved items...' },
      { id: 'addresses', label: 'Addresses', content: 'Saved addresses...' },
      { id: 'settings', label: 'Settings', content: 'Account settings...' },
    ],
    variant: 'pills',
    defaultIndex: 0,
  },
};