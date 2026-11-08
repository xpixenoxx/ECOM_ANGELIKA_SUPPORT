'use client';

import { ReactNode, useId, useState, forwardRef, createContext, useContext } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Checkbox } from '@/components/ui/Checkbox';

// Context for compound components
interface TableContextValue {
  striped: boolean;
  hoverable: boolean;
  bordered: boolean;
  compact: boolean;
  selectable: boolean;
  selectedRows: string[];
  onSelectionChange?: (selected: string[]) => void;
  keyAccessor: (row: any) => string;
}

const TableContext = createContext<TableContextValue | null>(null);

function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('Table compound components must be used within Table');
  }
  return context;
}

// Column definition for data-driven API
export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Data-driven API props
export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selected: string[]) => void;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
  className?: string;
  renderRowActions?: (row: T) => ReactNode;
}

// Compound component API props (only styling/config, no data)
export interface CompoundTableProps {
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selected: string[]) => void;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}

// Overload 1: Data-driven API
export function Table<T>(props: DataTableProps<T>): React.ReactElement;

// Overload 2: Compound component API
export function Table(props: CompoundTableProps): React.ReactElement;

// Implementation
export function Table<T>({
  columns,
  data,
  keyAccessor,
  sortable = false,
  onSort,
  sortKey,
  sortDirection = 'asc',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  emptyMessage = 'No data available',
  loading = false,
  loadingRows = 5,
  className = '',
  renderRowActions,
  children,
}: (DataTableProps<T> & CompoundTableProps) | any) {
  const tableId = useId();
  const [sortState, setSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const isDataDriven = columns !== undefined && data !== undefined && keyAccessor !== undefined;

  const handleSort = (key: string) => {
    if (!sortable || !isDataDriven) return;
    const currentDirection = sortState?.key === key ? sortState.direction : 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    setSortState({ key, direction: newDirection });
    onSort?.(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (isDataDriven) {
      if (checked) {
        onSelectionChange?.(data.map(keyAccessor));
      } else {
        onSelectionChange?.([]);
      }
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, rowKey]);
    } else {
      onSelectionChange?.(selectedRows.filter((k: string) => k !== rowKey));
    }
  };

  const isAllSelected = isDataDriven && data.length > 0 && data.every((row: T) => selectedRows.includes(keyAccessor(row)));
  const isIndeterminate = isDataDriven && data.some((row: T) => selectedRows.includes(keyAccessor(row))) && !isAllSelected;

  const contextValue: TableContextValue = {
    striped,
    hoverable,
    bordered,
    compact,
    selectable,
    selectedRows,
    onSelectionChange,
    keyAccessor: isDataDriven ? keyAccessor : ((row: any) => row.id || row.key || ''),
  };

  if (loading && isDataDriven) {
    return (
      <TableContext.Provider value={contextValue}>
        <div className={cn('overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-whisper)]', className)}>
          <table className="w-full" role="grid">
            <thead>
              <tr className="bg-[var(--color-whisper)]">
                {selectable && <th className="px-4 py-3 w-12" scope="col"><div className="w-5 h-5 rounded-[var(--radius-sm)] border border-[var(--color-whisper)] bg-[var(--color-white)] animate-pulse" /></th>}
                {columns.map((col: Column<T>) => (
                  <th key={col.key} className={cn('px-4 py-3 text-left font-medium text-[var(--color-slate)]', col.className)} style={{ width: col.width }}>
                    <div className="h-4 w-3/4 bg-[var(--color-white)] rounded animate-pulse" />
                  </th>
                ))}
                {renderRowActions && <th className="px-4 py-3 w-32" scope="col"><div className="h-4 w-1/2 bg-[var(--color-white)] rounded animate-pulse" /></th>}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={i} className={cn('border-t border-[var(--color-whisper)]', striped && i % 2 === 1 && 'bg-[var(--color-whisper)]/50')}>
                  {selectable && <td className="px-4 py-3"><div className="w-5 h-5 rounded-[var(--radius-sm)] border border-[var(--color-whisper)] bg-[var(--color-white)] animate-pulse" /></td>}
                  {columns.map((col: Column<T>) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      <div className="h-4 w-full bg-[var(--color-white)] rounded animate-pulse" />
                    </td>
                  ))}
                  {renderRowActions && <td className="px-4 py-3"><div className="h-4 w-1/2 bg-[var(--color-white)] rounded animate-pulse" /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableContext.Provider>
    );
  }

  if (isDataDriven && data.length === 0 && !children) {
    return (
      <TableContext.Provider value={contextValue}>
        <div className={cn('rounded-[var(--radius-lg)] border border-[var(--color-whisper)]', className)}>
          <div className="p-12 text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-whisper)] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            >
              <svg className="h-8 w-8 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>
            <p className="text-[var(--color-slate)]">{emptyMessage}</p>
          </div>
        </div>
      </TableContext.Provider>
    );
  }

  return (
    <TableContext.Provider value={contextValue}>
      <div className={cn('overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-whisper)]', className)}>
        <table className="w-full" role="grid">
          {children ? (
            // Compound component API - render children directly
            children
          ) : isDataDriven ? (
            // Data-driven API - default rendering
            <>
              <thead>
                <tr className="bg-[var(--color-whisper)]">
                  {selectable && (
                    <th scope="col" className="px-4 py-3 w-12">
                      <Checkbox
                        id={`${tableId}-select-all`}
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        label=""
                        className="sr-only"
                      />
                    </th>
                  )}
                  {columns.map((col: Column<T>) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={cn(
                        'px-4 py-3 text-left font-medium text-[var(--color-slate)] uppercase tracking-wider text-sm',
                        col.headerClassName,
                        sortable && col.sortable && 'cursor-pointer hover:text-[var(--color-gold)] select-none',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                      style={{ width: col.width }}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.header}</span>
                        {sortable && col.sortable && sortState?.key === col.key && (
                          <svg
                            className={cn('h-4 w-4 text-[var(--color-gold)]', sortState?.direction === 'desc' && 'rotate-180')}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                  {renderRowActions && <th scope="col" className="px-4 py-3 w-32 text-[var(--color-slate)] uppercase tracking-wider text-sm">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((row: T, rowIndex: number) => {
                  const rowKey = keyAccessor(row);
                  const isSelected = selectedRows.includes(rowKey);
                  return (
                    <motion.tr
                      key={rowKey}
                      className={cn(
                        'border-t border-[var(--color-whisper)] transition-colors duration-150',
                        striped && rowIndex % 2 === 1 && 'bg-[var(--color-whisper)]/50',
                        hoverable && !loading && 'hover:bg-[var(--color-gold-light)]/30',
                        isSelected && 'bg-[var(--color-gold-light)]/50',
                        bordered && 'border-l-4 border-transparent',
                        isSelected && bordered && 'border-l-[var(--color-gold)]',
                        compact && 'py-2'
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rowIndex * 0.03 }}
                    >
                      {selectable && (
                        <td className={cn('px-4 py-3', compact && 'py-2')}>
                          <Checkbox
                            id={`${tableId}-select-${rowKey}`}
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowKey, e.target.checked)}
                            label=""
                            className="sr-only"
                          />
                        </td>
                      )}
                      {columns.map((col: Column<T>) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3 text-[var(--color-ink)]',
                            col.className,
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right',
                            compact && 'py-2'
                          )}
                        >
                          {col.accessor(row)}
                        </td>
                      ))}
                      {renderRowActions && (
                        <td className={cn('px-4 py-3', compact && 'py-2')}>
                          {renderRowActions(row)}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </>
          ) : null}
        </table>
      </div>
    </TableContext.Provider>
  );
}

// TableHeader component
export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className = '' }, ref) => {
    return (
      <thead ref={ref} className={cn('bg-[var(--color-whisper)]', className)}>
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

// TableBody component
export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '' }, ref) => {
    return (
      <tbody ref={ref} className={cn('', className)}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

// TableRow component - accepts motion props
export interface TableRowProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  'data-row-key'?: string;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', selected = false, 'data-row-key': rowKey, initial, animate, transition, ...props }, ref) => {
    const { striped, hoverable, bordered, compact, selectable, selectedRows, onSelectionChange, keyAccessor } = useTableContext();

    const isSelected = rowKey ? selectedRows.includes(rowKey) : selected;

    const handleSelectRow = (checked: boolean) => {
      if (rowKey && onSelectionChange) {
        if (checked) {
          onSelectionChange([...selectedRows, rowKey]);
        } else {
          onSelectionChange(selectedRows.filter((k) => k !== rowKey));
        }
      }
    };

    return (
      <motion.tr
        ref={ref}
        className={cn(
          'border-t border-[var(--color-whisper)] transition-colors duration-150',
          striped && 'even:bg-[var(--color-whisper)]/50',
          hoverable && 'hover:bg-[var(--color-gold-light)]/30',
          isSelected && 'bg-[var(--color-gold-light)]/50',
          bordered && 'border-l-4 border-transparent',
          isSelected && bordered && 'border-l-[var(--color-gold)]',
          compact && 'py-2',
          className
        )}
        initial={initial}
        animate={animate}
        transition={transition}
        {...props}
      >
        {selectable && rowKey && (
          <td className={cn('px-4 py-3', compact && 'py-2')}>
            <Checkbox
              id={`select-${rowKey}`}
              checked={isSelected}
              onChange={(e) => handleSelectRow(e.target.checked)}
              label=""
              className="sr-only"
            />
          </td>
        )}
        {children}
      </motion.tr>
    );
  }
);

TableRow.displayName = 'TableRow';

// TableHead component
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className = '', width, align = 'left', sortable = false, onSort, ...props }, ref) => {
    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          'px-4 py-3 text-left font-medium text-[var(--color-slate)] uppercase tracking-wider text-sm',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          sortable && 'cursor-pointer hover:text-[var(--color-gold)] select-none',
          className
        )}
        style={{ width }}
        onClick={onSort}
        {...props}
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
        </div>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

// TableCell component
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  compact?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = '', align = 'left', compact = false, ...props }, ref) => {
    const { compact: contextCompact } = useTableContext();
    const isCompact = compact || contextCompact;

    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-3 text-[var(--color-ink)]',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          isCompact && 'py-2',
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

// TableFooter component
export interface TableFooterProps {
  children: ReactNode;
  className?: string;
}

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className = '' }, ref) => {
    return (
      <tfoot ref={ref} className={cn('bg-[var(--color-whisper)]', className)}>
        {children}
      </tfoot>
    );
  }
);

TableFooter.displayName = 'TableFooter';

// DataTable component (enhanced version with search, pagination)
export interface DataTableEnhancedProps<T> extends Omit<DataTableProps<T>, 'children'> {
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  currentPage?: number;
}

export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  searchable = false,
  searchPlaceholder = 'Search...',
  pagination = false,
  pageSize = 10,
  onPageChange,
  totalPages,
  currentPage = 1,
  ...tableProps
}: DataTableEnhancedProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = searchable
    ? data.filter((row) =>
        columns.some((col) =>
          String(col.accessor(row)).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex justify-end">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--color-white)] border border-[var(--color-whisper)] rounded-[var(--radius-md)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
              aria-label="Search table"
            />
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={paginatedData}
        keyAccessor={keyAccessor}
        {...tableProps}
      />

      {pagination && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-slate)]">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] disabled:opacity-50"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-[var(--color-ink)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1.5 text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-ink)] disabled:opacity-50"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}