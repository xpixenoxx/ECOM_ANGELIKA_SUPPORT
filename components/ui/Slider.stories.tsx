import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider, RangeSlider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium slider component with RangeSlider for price ranges, value labels, and gold track.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the slider',
    },
    showValue: {
      control: 'boolean',
      description: 'Show value label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <div className="w-80">
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          showValue
        />
      </div>
    );
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [value, setValue] = useState(500);
    return (
      <div className="w-80">
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={1000}
          step={50}
          showValue
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: 50,
    onValueChange: () => {},
    min: 0,
    max: 100,
    disabled: true,
    showValue: true,
  },
};

export const WithCustomStep: Story = {
  render: () => {
    const [value, setValue] = useState(25);
    return (
      <div className="w-80">
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          step={25}
          showValue
        />
      </div>
    );
  },
};

export const Small: Story = {
  args: {
    value: 50,
    onValueChange: () => {},
    min: 0,
    max: 100,
    showValue: true,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    value: 50,
    onValueChange: () => {},
    min: 0,
    max: 100,
    showValue: true,
    size: 'lg',
  },
};

export const VolumeControl: Story = {
  render: () => {
    const [volume, setVolume] = useState(70);
    return (
      <div className="w-80 space-y-2">
        <label className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink)]">Volume</span>
          <span className="text-[var(--color-gold)] font-mono tabular-nums">{volume}%</span>
        </label>
        <Slider
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
          showValue
        />
      </div>
    );
  },
};

export const BrightnessControl: Story = {
  render: () => {
    const [brightness, setBrightness] = useState(80);
    return (
      <div className="w-80 space-y-2">
        <label className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink)]">Brightness</span>
          <span className="text-[var(--color-gold)] font-mono tabular-nums">{brightness}%</span>
        </label>
        <Slider
          value={brightness}
          onValueChange={setBrightness}
          min={0}
          max={100}
          showValue
        />
      </div>
    );
  },
};

// RangeSlider Stories
export const RangeSliderDefault: Story = {
  component: RangeSlider,
  args: {
    value: [20, 80],
    onValueChange: () => {},
    min: 0,
    max: 100,
    showValues: true,
  },
};

export const RangeSliderPrice: Story = {
  render: () => {
    const [range, setRange] = useState([1000, 25000]);
    return (
      <div className="w-80 space-y-2">
        <label className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink)]">Price Range</span>
          <span className="text-[var(--color-gold)] font-mono tabular-nums">
            ₹{range[0].toLocaleString()} - ₹{range[1].toLocaleString()}
          </span>
        </label>
        <RangeSlider
          value={range}
          onValueChange={setRange}
          min={0}
          max={50000}
          step={500}
          showValues
        />
      </div>
    );
  },
};

export const RangeSliderPriceFull: Story = {
  render: () => {
    const [range, setRange] = useState([500, 50000]);
    return (
      <div className="w-80 space-y-2">
        <label className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink)]">Price Range (Full)</span>
          <span className="text-[var(--color-gold)] font-mono tabular-nums">
            ₹{range[0].toLocaleString()} - ₹{range[1].toLocaleString()}
          </span>
        </label>
        <RangeSlider
          value={range}
          onValueChange={setRange}
          min={0}
          max={100000}
          step={1000}
          showValues
        />
      </div>
    );
  },
};

export const RangeSliderAge: Story = {
  render: () => {
    const [range, setRange] = useState([18, 65]);
    return (
      <div className="w-80 space-y-2">
        <label className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink)]">Age Range</span>
          <span className="text-[var(--color-gold)] font-mono tabular-nums">
            {range[0]} - {range[1]} years
          </span>
        </label>
        <RangeSlider
          value={range}
          onValueChange={setRange}
          min={0}
          max={100}
          step={1}
          showValues
        />
      </div>
    );
  },
};

export const RangeSliderDisabled: Story = {
  component: RangeSlider,
  args: {
    value: [25, 75],
    onValueChange: () => {},
    min: 0,
    max: 100,
    showValues: true,
    disabled: true,
  },
};

export const ProductFilterSlider: Story = {
  render: () => {
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [discountRange, setDiscountRange] = useState([0, 100]);

    return (
      <div className="w-72 space-y-6">
        <div>
          <label className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-ink)]">Price</span>
            <span className="text-[var(--color-gold)] font-mono tabular-nums">
              ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </span>
          </label>
          <RangeSlider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={50000}
            step={500}
            showValues
          />
        </div>
        <div>
          <label className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-ink)]">Discount</span>
            <span className="text-[var(--color-gold)] font-mono tabular-nums">
              {discountRange[0]}% - {discountRange[1]}%
            </span>
          </label>
          <RangeSlider
            value={discountRange}
            onValueChange={setDiscountRange}
            min={0}
            max={100}
            step={5}
            showValues
          />
        </div>
      </div>
    );
  },
};