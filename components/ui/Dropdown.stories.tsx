import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown, DropdownMenu } from './Dropdown';
import { Button } from './Button';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium dropdown component with DropdownMenu, keyboard navigation, and portal rendering.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Dropdown position',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Dropdown alignment',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const menuItems = [
  { label: 'Profile', icon: 'user', onSelect: () => console.log('Profile') },
  { label: 'Settings', icon: 'settings', onSelect: () => console.log('Settings') },
  { label: 'Wishlist', icon: 'heart', onSelect: () => console.log('Wishlist') },
  { label: 'Orders', icon: 'package', onSelect: () => console.log('Orders') },
  { type: 'separator' },
  { label: 'Sign Out', icon: 'log-out', variant: 'danger', onSelect: () => console.log('Sign out') },
];

const iconMap: Record<string, React.ReactNode> = {
  user: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  settings: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  heart: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  package: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  'log-out': <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
};

export const Default: Story = {
  args: {
    trigger: <Button variant="outline">Open Menu</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
  },
};

export const UserMenu: Story = {
  render: () => (
    <Dropdown
      trigger={
        <Button variant="ghost" className="gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-gold-light)] flex items-center justify-center">
            <span className="text-[var(--color-gold)] font-bold text-sm">VD</span>
          </div>
          <span className="hidden sm:block text-[var(--color-ink)]">Vidhya</span>
          <svg className="h-4 w-4 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </Button>
      }
      items={menuItems.map(item => ({
        ...item,
        icon: item.icon ? iconMap[item.icon] : undefined,
      }))}
      align="end"
    />
  ),
};

export const SortDropdown: Story = {
  render: () => {
    const [sort, setSort] = useState('newest');
    const sortOptions = [
      { label: 'Newest', value: 'newest' },
      { label: 'Price: Low to High', value: 'price-asc' },
      { label: 'Price: High to Low', value: 'price-desc' },
      { label: 'Best Selling', value: 'popular' },
      { label: 'Customer Rating', value: 'rating' },
    ];
    return (
      <Dropdown
        trigger={
          <Button variant="outline" className="gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
              <line x1="19" y1="6" x2="21" y2="18" />
            </svg>
            <span>Sort: {sortOptions.find(o => o.value === sort)?.label || 'Newest'}</span>
          </Button>
        }
        items={sortOptions.map(opt => ({
          label: opt.label,
          onSelect: () => setSort(opt.value),
        }))}
      />
    );
  },
};

export const FilterDropdown: Story = {
  render: () => {
    const [filters, setFilters] = useState<string[]>([]);
    const filterOptions = [
      { label: 'In Stock', value: 'in-stock' },
      { label: 'On Sale', value: 'on-sale' },
      { label: 'New Arrivals', value: 'new' },
      { label: 'Vidhya\'s Picks', value: 'vidhyas-pick' },
      { label: 'Free Shipping', value: 'free-shipping' },
    ];
    return (
      <Dropdown
        trigger={
          <Button variant="outline" className="gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters {filters.length > 0 && `(${filters.length})`}</span>
          </Button>
        }
        items={filterOptions.map(opt => ({
          label: opt.label,
          onSelect: () => setFilters(prev =>
            prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value]
          ),
        }))}
      />
    );
  },
};

export const WithIcons: Story = {
  args: {
    trigger: <Button variant="outline">Actions</Button>,
    items: [
      { label: 'Edit', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>, onSelect: () => {} },
      { label: 'Duplicate', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>, onSelect: () => {} },
      { label: 'Share', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>, onSelect: () => {} },
      { type: 'separator' },
      { label: 'Delete', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>, variant: 'danger', onSelect: () => {} },
    ],
  },
};

export const AlignStart: Story = {
  args: {
    trigger: <Button variant="outline">Align Start</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
    align: 'start',
  },
};

export const AlignEnd: Story = {
  args: {
    trigger: <Button variant="outline">Align End</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
    align: 'end',
  },
};

export const TopPosition: Story = {
  args: {
    trigger: <Button variant="outline">Top</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
    side: 'top',
  },
};

export const LeftPosition: Story = {
  args: {
    trigger: <Button variant="outline">Left</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
    side: 'left',
  },
};

export const RightPosition: Story = {
  args: {
    trigger: <Button variant="outline">Right</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
    side: 'right',
  },
};

// DropdownMenu Stories
export const DropdownMenuDefault: Story = {
  component: DropdownMenu,
  args: {
    trigger: <Button variant="outline">User Menu</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
  },
};

export const DropdownMenuAlignEnd: Story = {
  component: DropdownMenu,
  args: {
    trigger: <Button variant="outline">Align End</Button>,
    items: menuItems.map(item => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })),
    align: 'end',
  },
};