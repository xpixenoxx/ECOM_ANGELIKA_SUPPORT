import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionSection } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium accordion component with collapsible sections, animated height, and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    allowMultiple: {
      control: 'boolean',
      description: 'Allow multiple sections open',
    },
    allowToggle: {
      control: 'boolean',
      description: 'Allow toggling open/close',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const faqItems = [
  {
    id: 'shipping',
    title: 'What are the shipping options?',
    content: (
      <p className="text-[var(--color-slate)]">
        We offer free standard shipping on orders over ₹999. Express shipping is available
        for ₹299 (2-3 business days). International shipping rates vary by destination.
        All orders are shipped within 24 hours of confirmation.
      </p>
    ),
  },
  {
    id: 'returns',
    title: 'What is your return policy?',
    content: (
      <p className="text-[var(--color-slate)]">
        We offer 30-day free returns on all items. Products must be unworn, unwashed,
        and have all original tags attached. Refunds are processed within 5-7 business
        days after we receive the return. Sale items are final sale.
      </p>
    ),
  },
  {
    id: 'sizing',
    title: 'How do I find my size?',
    content: (
      <div className="space-y-3">
        <p className="text-[var(--color-slate)]">
          Use our Size Finder tool on each product page for personalized recommendations.
          You can also refer to our detailed size charts with measurements for each size.
        </p>
        <Button variant="outline" size="sm">Open Size Guide</Button>
      </div>
    ),
  },
  {
    id: 'payments',
    title: 'What payment methods do you accept?',
    content: (
      <p className="text-[var(--color-slate)]">
        We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI, Net Banking,
        Wallets (PhonePe, Google Pay, Paytm), and Cash on Delivery (up to ₹10,000).
        International orders accept Stripe payments.
      </p>
    ),
  },
  {
    id: 'alterations',
    title: 'Do you offer alterations?',
    content: (
      <p className="text-[var(--color-slate)]">
        Yes! We offer free alterations within 30 days of purchase through our partner
        tailor network. Book a video consultation, and we'll arrange doorstep pickup
        and delivery. Available in major metros.
      </p>
    ),
  },
];

export const Default: Story = {
  args: {
    items: faqItems,
    allowMultiple: true,
    allowToggle: true,
  },
};

export const SingleOpen: Story = {
  args: {
    items: faqItems,
    allowMultiple: false,
    allowToggle: true,
  },
};

export const NoToggle: Story = {
  args: {
    items: faqItems,
    allowMultiple: true,
    allowToggle: false,
  },
};

export const WithDefaultOpen: Story = {
  args: {
    items: faqItems,
    allowMultiple: true,
    allowToggle: true,
    defaultOpen: ['shipping', 'returns'],
  },
};

export const ProductDetails: Story = {
  args: {
    items: [
      {
        id: 'description',
        title: 'Description',
        content: (
          <p className="text-[var(--color-slate)]">
            This exquisite Chikankari kurti is handcrafted by skilled artisans in Lucknow.
            The delicate white-on-white embroidery features traditional floral motifs
            inspired by Mughal architecture. Made from 100% cotton Chanderi fabric,
            it offers breathable comfort perfect for Indian summers.
          </p>
        ),
      },
      {
        id: 'care',
        title: 'Care Instructions',
        content: (
          <ul className="list-disc list-inside space-y-2 text-[var(--color-slate)]">
            <li>Dry clean only for first wash</li>
            <li>Hand wash in cold water separately</li>
            <li>Do not bleach or tumble dry</li>
            <li>Iron on low heat inside out</li>
            <li>Store folded, not hanging</li>
          </ul>
        ),
      },
      {
        id: 'shipping',
        title: 'Shipping & Returns',
        content: (
          <p className="text-[var(--color-slate)]">
            Free shipping on orders over ₹999. 30-day free returns.
            Express delivery available. COD up to ₹10,000.
          </p>
        ),
      },
      {
        id: 'artisan',
        title: 'Meet the Artisan',
        content: (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-whisper)] flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--color-gold)]">R</span>
            </div>
            <div>
              <p className="font-medium text-[var(--color-ink)]">Ramesh Kumar</p>
              <p className="text-sm text-[var(--color-slate)]">Master Chikankari Artisan, 25 years experience</p>
              <p className="text-sm text-[var(--color-slate)]">Lucknow, Uttar Pradesh</p>
            </div>
          </div>
        ),
      },
    ],
    allowMultiple: true,
    allowToggle: true,
  },
};

export const SimpleContent: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Simple Question 1',
        content: 'Simple answer for question 1.',
      },
      {
        id: '2',
        title: 'Simple Question 2',
        content: 'Simple answer for question 2.',
      },
      {
        id: '3',
        title: 'Simple Question 3',
        content: 'Simple answer for question 3.',
      },
    ],
    allowMultiple: true,
    allowToggle: true,
  },
};

export const NestedContent: Story = {
  args: {
    items: [
      {
        id: 'category1',
        title: 'Category 1',
        content: (
          <div className="space-y-2">
            <p className="text-[var(--color-slate)]">Content for category 1</p>
            <Accordion
              items={[
                { id: 'sub1', title: 'Sub-item 1', content: 'Sub content 1' },
                { id: 'sub2', title: 'Sub-item 2', content: 'Sub content 2' },
              ]}
              allowMultiple
            />
          </div>
        ),
      },
      {
        id: 'category2',
        title: 'Category 2',
        content: (
          <div className="space-y-2">
            <p className="text-[var(--color-slate)]">Content for category 2</p>
            <Accordion
              items={[
                { id: 'sub3', title: 'Sub-item 3', content: 'Sub content 3' },
                { id: 'sub4', title: 'Sub-item 4', content: 'Sub content 4' },
              ]}
              allowMultiple
            />
          </div>
        ),
      },
    ],
    allowMultiple: true,
    allowToggle: true,
  },
};