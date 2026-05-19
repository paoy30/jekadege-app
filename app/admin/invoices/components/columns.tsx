'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Invoice, InvoiceItem, InvoiceHistory } from '@prisma/client';
import { MoreHorizontal, ArrowUpDown, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EditInvoiceForm } from './edit-invoice-form';
import { DeleteInvoiceButton } from './delete-invoice-button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type SerializableInvoiceItem = Omit<InvoiceItem, 'quantity' | 'unitPrice' | 'amount'> & { quantity: number; unitPrice: number; amount: number };
type SerializableHistory = Omit<InvoiceHistory, 'createdAt'> & { createdAt: string };

export type SerializableInvoice = Omit<Invoice, 'totalPrice' | 'amountPaid' | 'estimatedFinishedAt' | 'createdAt' | 'updatedAt'> & {
  totalPrice: number;
  amountPaid: number;
  estimatedFinishedAt: string | null;
  paymentProof: string | null; // Tambahkan ini
  createdAt: Date;
  updatedAt: Date;
  createdBy: { name: string | null } | null;
  items: SerializableInvoiceItem[];
  history: SerializableHistory[];
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const columns: ColumnDef<SerializableInvoice>[] = [
  {
    id: 'select',
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: 'expander',
    header: () => null,
    cell: ({ row, table }) => {
      const canExpand = row.original.items && row.original.items.length > 0;
      const { expandedRows, setExpandedRows } = table.options.meta as any;
      const isExpanded = expandedRows[row.id];
      return (
        <Button variant="ghost" size="icon" onClick={() => setExpandedRows((prev: any) => ({ ...prev, [row.id]: !prev[row.id] }))} disabled={!canExpand}>
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      );
    },
    enableHiding: false,
  },
  { accessorKey: 'title', header: 'Judul Pesanan' },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Nama Pemesan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { header: () => <div className="hidden md:table-cell">No. Telepon</div>, accessorKey: 'customerPhone', cell: ({ row }) => <div className="hidden md:table-cell">{row.getValue('customerPhone')}</div> },
  { header: () => <div className="hidden lg:table-cell">Jenis Pesanan</div>, accessorKey: 'orderType', cell: ({ row }) => <div className="hidden lg:table-cell">{row.getValue('orderType')}</div> },
  { accessorKey: 'customerAddress', header: 'Alamat' },
  { accessorKey: 'totalPrice', header: () => <div className="text-right">Total Harga</div>, cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('totalPrice'))}</div> },
  { accessorKey: 'amountPaid', header: () => <div className="text-right">Sudah Dibayar</div>, cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('amountPaid'))}</div> },
  {
    id: 'remainingAmount',
    header: () => <div className="text-right">Sisa Bayar</div>,
    cell: ({ row }) => {
      const total = row.original.totalPrice;
      const paid = row.original.amountPaid;
      const remaining = total - paid;
      return <div className="text-right font-medium">{formatCurrency(remaining)}</div>;
    },
  },

  {
    accessorKey: 'estimatedFinishedAt',
    header: 'Estimasi Selesai',
    cell: ({ row }) => {
      const dateStr = row.original.estimatedFinishedAt;
      if (!dateStr) return <span className="text-muted-foreground">-</span>;
      const date = new Date(dateStr);
      const isOverdue = date < new Date() && row.original.status !== 'SELESAI' && row.original.status !== 'BATAL';

      return (
        <div className={cn('flex items-center gap-1', isOverdue ? 'text-red-500 font-bold' : '')}>
          <Clock className="w-3 h-3" />
          <span>{format(date, 'dd MMM yyyy', { locale: id })}</span>
        </div>
      );
    },
  },

  { accessorKey: 'createdAt', header: () => <div className="hidden lg:table-cell">Tanggal Dibuat</div>, cell: ({ row }) => <span className="hidden lg:table-cell">{formatDate(row.getValue('createdAt'))}</span>, filterFn: 'dateRange' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusInfo: { [key: string]: { text: string; className: string } } = {
        DALAM_ANTRIAN: { text: 'Diantrian', className: 'bg-yellow-500 text-white' },
        DIPROSES: { text: 'Diproses', className: 'bg-blue-500 text-white' },
        DIANTAR: { text: 'Diantar', className: 'bg-purple-500 text-white' },
        SELESAI: { text: 'Selesai', className: 'bg-green-500 text-white' },
        BATAL: { text: 'Batal', className: 'bg-red-500 text-white' },
      };
      const info = statusInfo[status] || { text: status, className: 'bg-gray-400' };
      return (
        <Badge variant="outline" className={cn('py-1 px-2', info.className)}>
          {info.text}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  { accessorKey: 'updatedAt', header: () => <div className="hidden xl:table-cell">Terakhir Diubah</div>, cell: ({ row }) => <span className="hidden xl:table-cell">{formatDate(row.getValue('updatedAt'))}</span> },
  { accessorKey: 'notes', header: 'Catatan' },
  { accessorKey: 'createdBy.name', header: 'Admin' },
  {
    id: 'actions',
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      const invoice = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/order/${invoice.id}`)}>Salin Invoice Digital</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>Edit Pesanan</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteInvoiceButton invoiceId={invoice.id} />
            </DropdownMenuContent>
          </DropdownMenu>
          {isEditDialogOpen && <EditInvoiceForm invoice={invoice} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
        </div>
      );
    },
    enableHiding: false,
  },
];
