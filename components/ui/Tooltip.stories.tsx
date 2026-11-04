import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipTrigger, HoverCard } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium tooltip component with HoverCard for richer content, delays, and positioning.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Tooltip position',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Tooltip alignment',
    },
    delayDuration: {
      control: 'number',
      description: 'Show delay in ms',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: 'This is a tooltip',
  },
};

export const Top: Story = {
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: 'Tooltip on top',
    side: 'top',
  },
};

export const Right: Story = {
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: 'Tooltip on right',
    side: 'right',
  },
};

export const Bottom: Story = {
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: 'Tooltip on bottom',
    side: 'bottom',
  },
};

export const Left: Story = {
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: 'Tooltip on left',
    side: 'left',
  },
};

export const WithDelay: Story = {
  args: {
    children: <Button variant="outline">Hover me (500ms delay)</Button>,
    content: 'Delayed tooltip',
    delayDuration: 500,
  },
};

export const LongContent: Story = {
  args: {
    children: <Button variant="outline">Hover for details</Button>,
    content: (
      <div className="max-w-xs">
        <p className="font-medium text-[var(--color-ink)]">Tooltip Title</p>
        <p className="text-sm text-[var(--color-slate)] mt-1">
          This tooltip contains more detailed information that wraps to multiple lines.
          It can include any content you need.
        </p>
      </div>
    ),
  },
};

export const WithIconButton: Story = {
  args: {
    children: (
      <Button variant="ghost" size="sm" aria-label="More options">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </Button>
    ),
    content: 'More options',
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <Tooltip content="Top tooltip" side="top">
        <Button variant="outline">Top</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <Button variant="outline">Right</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button variant="outline">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <Button variant="outline">Left</Button>
      </Tooltip>
    </div>
  ),
};

// HoverCard Stories
export const HoverCardDefault: Story = {
  component: HoverCard,
  args: {
    trigger: <Button variant="outline">Hover for card</Button>,
    content: (
      <div className="w-64 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
            <span className="text-[var(--color-gold)] font-bold">VD</span>
          </div>
          <div>
            <p className="font-medium text-[var(--color-ink)]">Vidhya's Pick</p>
            <p className="text-sm text-[var(--color-slate)]">Handpicked by our founder</p>
          </div>
        </div>
        <div className="pt-2 border-t border-[var(--color-whisper)]">
          <p className="text-sm text-[var(--color-slate)]">
            This kurti features traditional Chikankari embroidery from Lucknow.
            Made with 100% cotton Chanderi for breathable comfort.
          </p>
        </div>
        <Button variant="primary" size="sm" className="w-full">View Details</Button>
      </div>
    ),
  },
};

export const HoverCardProduct: Story = {
  component: HoverCard,
  args: {
    trigger: (
      <div className="w-40 h-40 bg-[var(--color-whisper)] rounded-[var(--radius-lg)] flex items-center justify-center">
        <span className="text-[var(--color-mist)]">Product Image</span>
      </div>
    ),
    content: (
      <div className="w-72 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-[var(--color-ink)]">Chikankari Kurti</p>
            <p className="text-sm text-[var(--color-gold)] font-bold">₹3,499</p>
          </div>
          <Button variant="ghost" size="sm" iconRight={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }>
            Wishlist
          </Button>
        </div>
        <div className="flex gap-1" role="group" aria-label="Colors">
          {['#F5F5F5', '#E8D8A8', '#D4B85C'].map((color, i) => (
            <span key={i} className="w-6 h-6 rounded-full border border-[var(--color-whisper)]" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">Quick View</Button>
          <Button variant="primary" size="sm" className="flex-1">Add to Bag</Button>
        </div>
      </div>
    ),
  },
};

export const TooltipTriggerExample: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <TooltipTrigger>
        <Button variant="outline">Hover or Focus</Button>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button variant="ghost">Also works on focus</Button>
      </TooltipTrigger>
    </div>
  ),
};