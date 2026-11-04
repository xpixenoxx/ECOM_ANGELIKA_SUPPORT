'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

interface Look {
  id: string;
  name: string;
  lifestyle_image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  look_hotspots?: Array<{ count: number }>;
}

interface LooksListProps {
  looks: Look[];
}

export function LooksList({ looks }: LooksListProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Shop the Look</h1>
          <p className="text-gray-500 mt-1">Manage lifestyle images with shoppable hotspots</p>
        </div>
        <Link href="/admin/looks/new" className="hidden md:inline-flex">
          <Button>Create New Look</Button>
        </Link>
      </div>

      {/* Mobile create button */}
      <div className="md:hidden mb-4">
        <Link href="/admin/looks/new" className="w-full">
          <Button className="w-full">Create Look</Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {looks.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="image" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No looks yet</h3>
            <p className="text-gray-500 mb-6">Create your first shoppable lifestyle image</p>
            <Link href="/admin/looks/new">
              <Button>Create Look</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="w-24">Preview</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell className="hidden md:table-cell">Hotspots</TableCell>
                  <TableCell className="hidden lg:table-cell">Status</TableCell>
                  <TableCell className="hidden lg:table-cell">Order</TableCell>
                  <TableCell className="w-48 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {looks.map((look) => (
                  <TableRow key={look.id}>
                    <TableCell>
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={look.lifestyle_image_url}
                          alt={look.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{look.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500">
                      {look.look_hotspots?.[0]?.count || 0}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={look.is_active ? 'success' : 'default'}>
                        {look.is_active ? 'Active' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-500">
                      {look.display_order}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/looks/${look.id}/edit`}>
                          <Button variant="ghost" size="sm" iconLeft={<Icon name="edit" className="w-4 h-4" />} className="h-8 w-8 p-0" aria-label="Edit look" />
                        </Link>
                        <Link href={`/admin/looks/${look.id}/edit`}>
                          <Button variant="ghost" size="sm" iconLeft={<Icon name="eye" className="w-4 h-4" />} className="h-8 w-8 p-0" aria-label="Preview look" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={<Icon name="trash" className="w-4 h-4" />}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          aria-label="Delete look"
                          onClick={() => {
                            if (confirm(`Delete "${look.name}"? This cannot be undone.`)) {
                              // TODO: implement delete action
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}