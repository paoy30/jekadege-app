'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Link as LinkModel } from '@prisma/client';
import { ArrowUpDown, Instagram, Link as LinkIcon, MapPin, MessageCircle, MoreHorizontal, Music2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditLinkForm } from './edit-link-form';
import { DeleteLinkButton } from './delete-link-button';

// Objek pemetaan ikon
const iconMap: { [key: string]: React.ReactNode } = {
  Whatsapp: <MessageCircle className="h-4 w-4" />,
  Instagram: <Instagram className="h-4 w-4" />,
  Shopee: <ShoppingCart className="h-4 w-4" />,
  Tiktok: <Music2 className="h-4 w-4" />,
  Alamat: <MapPin className="h-4 w-4" />,
  Default: <LinkIcon className="h-4 w-4" />,
};

export const columns: ColumnDef<LinkModel>[] = [
  {
    accessorKey: 'icon',
    header: 'Ikon',
    cell: ({ row }) => {
      const iconName = row.getValue('icon') as string;
      return (
        <div className="flex items-center gap-2">
          {iconMap[iconName] || iconMap.Default} {iconName}
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Judul <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => (
      <a href={row.getValue('url')} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-xs block">
        {row.getValue('url')}
      </a>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const link = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteLinkButton linkId={link.id} />
            </DropdownMenuContent>
          </DropdownMenu>
          {isEditDialogOpen && <EditLinkForm link={link} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
        </div>
      );
    },
  },
];
