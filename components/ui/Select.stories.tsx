import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select, SelectItem } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium select component with searchable options, multi-select, and custom rendering.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Select size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select',
    },
    multiple: {
      control: 'boolean',
      description: 'Enable multi-select',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const sizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
];

const categoryOptions = [
  { value: 'kurti', label: 'Kurti' },
  { value: 'salwar', label: 'Salwar' },
  { value: 'lehenga', label: 'Lehenga' },
  { value: 'saree', label: 'Saree' },
  { value: 'dupatta', label: 'Dupatta' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select size"
      >
        {sizeOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="w-64">
        <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Size</label>
        <Select
          value={value}
          onValueChange={setValue}
          placeholder="Select size"
        >
          {sizeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
      </div>
    );
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    const [value, setValue] = useState('m');
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select size"
      >
        {sizeOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select size"
        size="sm"
      >
        {sizeOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select size"
        size="lg"
      >
        {sizeOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Select
      value="m"
      onValueChange={() => {}}
      placeholder="Select size"
      disabled
    >
      {sizeOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
      ))}
    </Select>
  ),
};

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Search categories..."
        searchable
      >
        {categoryOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select categories"
        multiple
        searchable
      >
        {categoryOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const MultipleWithDefault: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['kurti', 'saree']);
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select categories"
        multiple
        searchable
      >
        {categoryOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </Select>
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        value={value}
        onValueChange={setValue}
        placeholder="Select option"
      >
        <optgroup label="Tops">
          <SelectItem value="kurti">Kurti</SelectItem>
          <SelectItem value="blouse">Blouse</SelectItem>
        </optgroup>
        <optgroup label="Bottoms">
          <SelectItem value="salwar">Salwar</SelectItem>
          <SelectItem value="lehenga">Lehenga Skirt</SelectItem>
        </optgroup>
        <optgroup label="Drapes">
          <SelectItem value="saree">Saree</SelectItem>
          <SelectItem value="dupatta">Dupatta</SelectItem>
        </optgroup>
      </Select>
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Select size="sm" placeholder="Small" options={sizeOptions.map(o => ({ value: o.value, label: o.label }))} />
      <Select size="md" placeholder="Medium" options={sizeOptions.map(o => ({ value: o.value, label: o.label }))} />
      <Select size="lg" placeholder="Large" options={sizeOptions.map(o => ({ value: o.value, label: o.label }))} />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => {
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [quantity, setQuantity] = useState('1');
    return (
      <form className="w-80 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Size</label>
          <Select value={size} onValueChange={setSize} placeholder="Select size">
            {sizeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Color</label>
          <Select value={color} onValueChange={setColor} placeholder="Select color" searchable>
            <SelectItem value="ivory">Ivory</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="rose">Deep Rose</SelectItem>
            <SelectItem value="teal">Teal</SelectItem>
            <SelectItem value="lavender">Lavender</SelectItem>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Quantity</label>
          <Select value={quantity} onValueChange={setQuantity} placeholder="Qty">
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </Select>
        </div>
        <Button type="submit" className="w-full">Add to Bag</Button>
      </form>
    );
  },
};