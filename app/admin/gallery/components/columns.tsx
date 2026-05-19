'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { GallerySection } from '@prisma/client';
import Image from 'next/image';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { DeleteSectionButton } from './delete-section-button';
import { EditSectionForm } from './edit-section-form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// Komponen baru untuk menampilkan preview gambar dalam dialog
function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative h-16 w-28 rounded-md overflow-hidden cursor-pointer group">
          <Image src={src} alt={alt} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <div className="relative aspect-video mt-4">
          <Image src={src} alt={alt} fill className="object-contain rounded-md" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns: ColumnDef<GallerySection>[] = [
  {
    accessorKey: 'coverImage',
    header: () => <div className="text-center">Gambar Sampul</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ImagePreview src={row.getValue('coverImage')} alt={row.original.title} />
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Judul <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('title')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('category')}</Badge>,
  },
  {
    accessorKey: 'description',
    header: () => <div className="hidden lg:table-cell">Deskripsi</div>,
    cell: ({ row }) => <p className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">{row.getValue('description')}</p>,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const section = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/gallery/${section.id}`}>Lihat & Kelola Gambar</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>Edit Section</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteSectionButton sectionId={section.id} />
            </DropdownMenuContent>
          </DropdownMenu>
          {isEditDialogOpen && <EditSectionForm section={section} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
        </div>
      );
    },
  },
];
