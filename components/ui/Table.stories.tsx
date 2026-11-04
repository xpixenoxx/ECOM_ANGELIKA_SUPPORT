import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Table, DataTable, Column } from './Table';
import { Badge } from './Badge';
import { Button } from './Button';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Premium table component with DataTable for sorting, pagination, and compound API.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

const userColumns: Column[] = [
  { key: 'name', header: 'Name', cell: (row) => <span className="font-medium text-[var(--color-ink)]">{row.name}</span> },
  { key: 'email', header: 'Email', cell: (row) => <span className="text-[var(--color-slate)]">{row.email}</span> },
  { key: 'role', header: 'Role', cell: (row) => <Badge variant="soft">{row.role}</Badge> },
  { key: 'status', header: 'Status', cell: (row) => <Badge variant={row.status === 'active' ? 'default' : 'outline'}>{row.status}</Badge> },
  { key: 'lastLogin', header: 'Last Login', cell: (row) => <span className="text-[var(--color-slate)]">{row.lastLogin}</span> },
];

const userData = [
  { id: '1', name: 'Vidhya Sharma', email: 'vidhya@angelika.com', role: 'Admin', status: 'active', lastLogin: '2 hours ago' },
  { id: '2', name: 'Priya Patel', email: 'priya@angelika.com', role: 'Editor', status: 'active', lastLogin: '1 day ago' },
  { id: '3', name: 'Anjali Singh', email: 'anjali@angelika.com', role: 'Viewer', status: 'inactive', lastLogin: '1 week ago' },
  { id: '4', name: 'Meera Gupta', email: 'meera@angelika.com', role: 'Editor', status: 'active', lastLogin: '3 hours ago' },
  { id: '5', name: 'Kavya Reddy', email: 'kavya@angelika.com', role: 'Viewer', status: 'pending', lastLogin: 'Never' },
  { id: '6', name: 'Sonia Verma', email: 'sonia@angelika.com', role: 'Editor', status: 'active', lastLogin: '5 min ago' },
  { id: '7', name: 'Riya Joshi', email: 'riya@angelika.com', role: 'Admin', status: 'active', lastLogin: '1 hour ago' },
  { id: '7', name: 'Neha Agarwal', email: 'neha@angelika.com', role: 'Viewer', status: 'inactive', lastLogin: '2 weeks ago' },
];

const productColumns: Column[] = [
  { key: 'image', header: '', cell: (row) => <img src={row.image} alt={row.name} className="w-12 h-12 object-cover rounded-[var(--radius-md)]" /> },
  { key: 'name', header: 'Product', cell: (row) => <span className="font-medium text-[var(--color-ink)]">{row.name}</span> },
  { key: 'category', header: 'Category', cell: (row) => <Badge variant="soft">{row.category}</Badge> },
  { key: 'price', header: 'Price', cell: (row) => <span className="font-bold text-[var(--color-ink)] tabular-nums">₹{row.price.toLocaleString()}</span> },
  { key: 'stock', header: 'Stock', cell: (row) => <span className={row.stock > 10 ? 'text-[var(--color-success)]' : row.stock > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}> {row.stock} units</span> },
  { key: 'actions', header: 'Actions', cell: (row) => (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </div>
  )},
];

const productData = [
  { id: '1', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=100&h=100&fit=crop', name: 'Chikankari Kurti', category: 'Kurti', price: 3499, stock: 45 },
  { id: '2', image: 'https://images.unsplash.com/photo-1610033898473-3303b1f44f6a?w=100&h=100&fit=crop', name: 'Silk Lehenga Set', category: 'Lehenga', price: 18999, stock: 8 },
  { id: '3', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop', name: 'Banarasi Saree', category: 'Saree', price: 12999, stock: 12 },
  { id: '4', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=100&h=100&fit=crop', name: 'Cotton Salwar', category: 'Salwar', price: 2499, stock: 67 },
  { id: '5', image: 'https://images.unsplash.com/photo-1610033898473-3303b1f44f6a?w=100&h=100&fit=crop', name: 'Embroidered Dupatta', category: 'Dupatta', price: 1499, stock: 123 },
  { id: '6', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop', name: 'Designer Kurti', category: 'Kurti', price: 5999, stock: 3 },
  { id: '7', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=100&h=100&fit=crop', name: 'Bridal Lehenga', category: 'Lehenga', price: 45999, stock: 0 },
  { id: '8', image: 'https://images.unsplash.com/photo-1610033898473-3303b1f44f6a?w=100&h=100&fit=crop', name: 'Silk Saree', category: 'Saree', price: 8999, stock: 24 },
];

export const Default: Story = {
  render: () => (
    <Table columns={userColumns} data={userData} />
  ),
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <DataTable
        columns={userColumns}
        data={userData}
        selectable
        selectedRows={selected}
        onSelectionChange={setSelected}
      />
    );
  },
};

export const WithSorting: Story = {
  render: () => (
    <DataTable
      columns={userColumns}
      data={userData}
      sortable
      defaultSortKey="name"
      defaultSortDirection="asc"
    />
  ),
};

export const WithPagination: Story = {
  render: () => (
    <DataTable
      columns={userColumns}
      data={userData}
      pagination
      pageSize={3}
    />
  ),
};

export const ProductTable: Story = {
  render: () => (
    <DataTable
      columns={productColumns}
      data={productData}
      selectable
      sortable
      pagination
      pageSize={5}
      striped
      hoverable
    />
  ),
};

export const SimpleTable: Story = {
  render: () => (
    <Table
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'value', header: 'Value' },
      ]}
      data={[
        { name: 'Total Orders', value: '1,234' },
        { name: 'Revenue', value: '₹45,67,890' },
        { name: 'Customers', value: '567' },
        { name: 'Conversion Rate', value: '3.2%' },
      ]}
    />
  ),
};

export const Striped: Story = {
  render: () => (
    <Table columns={userColumns} data={userData} striped />
  ),
};

export const Hoverable: Story = {
  render: () => (
    <Table columns={userColumns} data={userData} hoverable />
  ),
};

export const Compact: Story = {
  render: () => (
    <Table columns={userColumns} data={userData} compact />
  ),
};

export const Empty: Story = {
  render: () => (
    <Table columns={userColumns} data={[]} emptyMessage="No users found" />
  ),
};

export const Loading: Story = {
  render: () => (
    <Table columns={userColumns} data={userData} loading />
  ),
};

export const WithRowClick: Story = {
  render: () => (
    <DataTable
      columns={userColumns}
      data={userData}
      onRowClick={(row) => alert(`Clicked: ${row.name}`)}
    />
  ),
};

export const CompoundAPI: Story = {
  render: () => (
    <Table.Root columns={userColumns} data={userData}>
      <Table.Header />
      <Table.Body rowKey="id" />
      <Table.Footer>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-slate)]">Showing {userData.length} users</span>
          <Button variant="ghost" size="sm">Export CSV</Button>
        </div>
      </Table.Footer>
    </Table.Root>
  ),
};