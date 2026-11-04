import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup, RadioCardGroup } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium radio component with RadioGroup and RadioCardGroup for card-based selection.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Radio size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the radio',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

const sizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const colorOptions = [
  { value: 'ivory', label: 'Ivory', color: '#FFFFF0' },
  { value: 'gold', label: 'Gold', color: '#C9A84C' },
  { value: 'rose', label: 'Deep Rose', color: '#C46E6E' },
  { value: 'teal', label: 'Teal', color: '#7A9E9E' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex flex-col gap-3">
          {sizeOptions.map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex gap-6">
          {sizeOptions.map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    const [value, setValue] = useState('m');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex flex-col gap-3">
          {sizeOptions.map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup value="m" onValueChange={() => {}}>
      <div className="flex flex-col gap-3">
        {sizeOptions.map((opt) => (
          <Radio key={opt.value} value={opt.value} disabled>
            {opt.label}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  ),
};

export const DisabledOne: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex flex-col gap-3">
          {sizeOptions.map((opt) => (
            <Radio key={opt.value} value={opt.value} disabled={opt.value === 'xl'}>
              {opt.label} {opt.value === 'xl' && '(Unavailable)'}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex flex-col gap-3">
          {sizeOptions.map((opt) => (
            <Radio key={opt.value} value={opt.value} size="sm">
              {opt.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex flex-col gap-3">
          {sizeOptions.map((opt) => (
            <Radio key={opt.value} value={opt.value} size="lg">
              {opt.label}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

// RadioCardGroup Stories
export const RadioCardGroupDefault: Story = {
  component: RadioCardGroup,
  args: {
    options: sizeOptions,
    value: '',
    onValueChange: () => {},
  },
};

export const RadioCardGroupWithDefault: Story = {
  component: RadioCardGroup,
  args: {
    options: sizeOptions,
    value: 'm',
    onValueChange: () => {},
  },
};

export const RadioCardGroupColors: Story = {
  component: RadioCardGroup,
  args: {
    options: colorOptions.map(opt => ({ value: opt.value, label: opt.label, color: opt.color })),
    value: '',
    onValueChange: () => {},
  },
};

export const RadioCardGroupDisabled: Story = {
  component: RadioCardGroup,
  args: {
    options: sizeOptions.map(opt => ({ ...opt, disabled: opt.value === 'xl' })),
    value: '',
    onValueChange: () => {},
  },
};

export const RadioCardGroupHorizontal: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioCardGroup
        options={sizeOptions}
        value={value}
        onValueChange={setValue}
        className="flex gap-3"
      />
    );
  },
};

export const SizeSelector: Story = {
  render: () => {
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    return (
      <div className="w-80 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">Size</label>
          <RadioCardGroup
            options={sizeOptions}
            value={size}
            onValueChange={setSize}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">Color</label>
          <RadioCardGroup
            options={colorOptions.map(opt => ({ value: opt.value, label: opt.label, color: opt.color }))}
            value={color}
            onValueChange={setColor}
          />
        </div>
      </div>
    );
  },
};