import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox, CheckboxGroup, Toggle } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium checkbox component with CheckboxGroup and Toggle (Switch) variant.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Checkbox size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the checkbox',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

const categoryOptions = [
  { value: 'kurti', label: 'Kurti' },
  { value: 'salwar', label: 'Salwar' },
  { value: 'lehenga', label: 'Lehenga' },
  { value: 'saree', label: 'Saree' },
  { value: 'dupatta', label: 'Dupatta' },
];

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox checked={checked} onCheckedChange={setChecked}>
        I agree to the terms and conditions
      </Checkbox>
    );
  },
};

export const Checked: Story = {
  render: () => (
    <Checkbox defaultChecked>
      Checked by default
    </Checkbox>
  ),
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    children: 'Indeterminate (partial selection)',
  },
};

export const Disabled: Story = {
  render: () => (
    <Checkbox disabled>
      Disabled checkbox
    </Checkbox>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <Checkbox disabled defaultChecked>
      Disabled but checked
    </Checkbox>
  ),
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small checkbox',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large checkbox',
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="w-80">
        <Checkbox checked={checked} onCheckedChange={setChecked}>
          <div>
            <span className="font-medium text-[var(--color-ink)]">Subscribe to newsletter</span>
            <p className="text-sm text-[var(--color-slate)] mt-0.5">
              Receive updates about new collections, sales, and styling tips from Vidhya.
            </p>
          </div>
        </Checkbox>
      </div>
    );
  },
};

// CheckboxGroup Stories
export const CheckboxGroupDefault: Story = {
  component: CheckboxGroup,
  args: {
    options: categoryOptions,
    value: [],
    onValueChange: () => {},
  },
};

export const CheckboxGroupWithDefaults: Story = {
  component: CheckboxGroup,
  args: {
    options: categoryOptions,
    value: ['kurti', 'saree'],
    onValueChange: () => {},
  },
};

export const CheckboxGroupHorizontal: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        options={categoryOptions}
        value={value}
        onValueChange={setValue}
        className="flex flex-wrap gap-4"
      />
    );
  },
};

export const CheckboxGroupDisabled: Story = {
  component: CheckboxGroup,
  args: {
    options: categoryOptions.map(opt => ({ ...opt, disabled: opt.value === 'lehenga' })),
    value: [],
    onValueChange: () => {},
  },
};

export const FilterExample: Story = {
  render: () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [inStock, setInStock] = useState(true);
    const [onSale, setOnSale] = useState(false);

    return (
      <div className="w-72 space-y-6">
        <div>
          <h4 className="font-medium text-[var(--color-ink)] mb-3">Category</h4>
          <CheckboxGroup
            options={categoryOptions}
            value={categories}
            onValueChange={setCategories}
          />
        </div>
        <div>
          <h4 className="font-medium text-[var(--color-ink)] mb-3">Price Range</h4>
          <div className="flex items-center gap-2">
            <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-24 px-3 py-2 border border-[var(--color-whisper)] rounded-[var(--radius-md)]" />
            <span className="text-[var(--color-mist)]">to</span>
            <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-24 px-3 py-2 border border-[var(--color-whisper)] rounded-[var(--radius-md)]" />
          </div>
        </div>
        <div>
          <h4 className="font-medium text-[var(--color-ink)] mb-3">Availability</h4>
          <div className="space-y-2">
            <Checkbox checked={inStock} onCheckedChange={setInStock}>In Stock</Checkbox>
            <Checkbox checked={onSale} onCheckedChange={setOnSale}>On Sale</Checkbox>
          </div>
        </div>
      </div>
    );
  },
};

// Toggle (Switch) Stories
export const ToggleDefault: Story = {
  component: Toggle,
  args: {
    checked: false,
    onCheckedChange: () => {},
  },
};

export const ToggleChecked: Story = {
  component: Toggle,
  args: {
    checked: true,
    onCheckedChange: () => {},
  },
};

export const ToggleDisabled: Story = {
  component: Toggle,
  args: {
    checked: false,
    onCheckedChange: () => {},
    disabled: true,
  },
};

export const ToggleDisabledChecked: Story = {
  component: Toggle,
  args: {
    checked: true,
    onCheckedChange: () => {},
    disabled: true,
  },
};

export const ToggleSmall: Story = {
  component: Toggle,
  args: {
    checked: false,
    onCheckedChange: () => {},
    size: 'sm',
  },
};

export const ToggleLarge: Story = {
  component: Toggle,
  args: {
    checked: false,
    onCheckedChange: () => {},
    size: 'lg',
  },
};

export const ToggleWithLabel: Story = {
  render: () => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    return (
      <div className="w-80 space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[var(--color-ink)]">Dark Mode</span>
          <Toggle checked={darkMode} onCheckedChange={setDarkMode} />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[var(--color-ink)]">Push Notifications</span>
          <Toggle checked={notifications} onCheckedChange={setNotifications} />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[var(--color-ink)]">Email Updates</span>
          <Toggle checked={emailUpdates} onCheckedChange={setEmailUpdates} />
        </label>
      </div>
    );
  },
};

export const ToggleSettings: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      darkMode: false,
      notifications: true,
      emailUpdates: false,
      smsUpdates: false,
      autoPlayVideos: true,
      highContrast: false,
    });
    return (
      <div className="w-80 space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-[var(--color-ink)]">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
            <Toggle
              checked={value}
              onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
            />
          </label>
        ))}
      </div>
    );
  },
};