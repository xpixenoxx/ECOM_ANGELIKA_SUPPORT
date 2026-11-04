// Core UI Components - Angelika Fashions Design System
// Premium components built per design-system.md specifications

// Button
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';

// Input
export { Input, type InputProps, type InputSize } from './Input';

// Select
export { Select, type SelectProps, type SelectItemProps as SelectOption, type SelectSize } from './Select';

// Radio
export { Radio, RadioGroup, RadioCardGroup, type RadioProps, type RadioGroupProps, type RadioOption, type RadioCardOption } from './Radio';

// Checkbox & Toggle
export { Checkbox, CheckboxGroup, Toggle, type CheckboxProps, type CheckboxGroupProps, type ToggleProps } from './Checkbox';

// Slider
export { Slider, RangeSlider, type SliderProps, type RangeSliderProps } from './Slider';

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ProductCard,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
  type ProductCardProps,
  type CardVariant,
  type CardPadding,
} from './Card';

// Modal
export { Modal, ConfirmModal, type ModalProps, type ConfirmModalProps } from './Modal';

// Drawer
export { Drawer, CartDrawer, type DrawerProps, type CartDrawerProps, type CartItem } from './Drawer';

// Toast
export {
  ToastProvider,
  useToast,
  useToastHelpers,
  toast,
  type Toast,
  type ToastType,
  type ToastContextValue,
} from './Toast';

// Tabs
export { Tabs, TabPanel, type TabsProps, type Tab, type TabPanelProps } from './Tabs';

// Accordion
export { Accordion, AccordionSection, type AccordionProps, type AccordionItem, type AccordionSectionProps } from './Accordion';

// Tooltip
export { Tooltip, TooltipTrigger, HoverCard, type TooltipProps, type TooltipTriggerProps, type HoverCardProps } from './Tooltip';

// Dropdown
export { Dropdown, DropdownMenu, type DropdownProps, type DropdownItem, type DropdownMenuProps } from './Dropdown';

// Table
export { Table, DataTable, type DataTableProps, type CompoundTableProps, type Column, type TableHeaderProps, type TableBodyProps, type TableRowProps, type TableHeadProps, type TableCellProps, type TableFooterProps } from './Table';

// Progress
export { Progress, StepProgress, type ProgressProps, type StepProgressProps } from './Progress';

// Badge
export {
  Badge,
  StatusBadge,
  CategoryBadge,
  PriceBadge,
  type BadgeProps,
  type StatusBadgeProps,
  type CategoryBadgeProps,
  type PriceBadgeProps,
} from './Badge';

// Avatar
export { Avatar, AvatarGroup, UserAvatar, type AvatarProps, type AvatarGroupProps, type UserAvatarProps } from './Avatar';

// Skeleton
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonProductCard,
  SkeletonTable,
  SkeletonForm,
  SkeletonList,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonCardProps,
  type SkeletonProductCardProps,
  type SkeletonTableProps,
  type SkeletonFormProps,
  type SkeletonListProps,
} from './Skeleton';

// FocusTrap (used by Modal, Drawer, Dropdown)
export { FocusTrap, type FocusTrapProps } from './FocusTrap';

// Utility functions
export { cn } from '@/lib/utils/cn';
export { generateId } from '@/lib/utils/id';