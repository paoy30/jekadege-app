'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TanstackTable,
  FilterFn,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, Check, Calendar as CalendarIcon, X, ChevronDown, ListTodo } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddInvoiceForm } from './add-invoice-form';
import { SerializableInvoice } from './columns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InvoiceStatus } from '@prisma/client';
import { toast } from 'sonner';
import { updateInvoicesStatus } from '@/app/actions/invoiceActions';

// Komponen dan helper tidak berubah
function InvoiceItemsDetail({ row }: { row: any }) {
  const invoice: SerializableInvoice = row.original;
  return (
    <div className="p-4 bg-muted/50">
      <h4 className="font-semibold mb-2">Detail Item Pesanan:</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-center">Kuantitas</TableHead>
            <TableHead className="text-right">Harga Satuan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item) => {
            const unitPrice = parseFloat(item.unitPrice as any) || 0;
            const amount = parseFloat(item.amount as any) || 0;
            return (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(unitPrice)}</TableCell>
                <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const dateRangeFilterFn: FilterFn<any> = (row, columnId, value: DateRange) => {
  const date = new Date(row.getValue(columnId));
  const from = value.from ? startOfDay(value.from) : undefined;
  const to = value.to ? endOfDay(value.to) : undefined;
  if (from && !to) return date >= from;
  if (from && to) return date >= from && date <= to;
  if (!from && to) return date <= to;
  return true;
};
function DatePickerWithRange({ table }: { table: TanstackTable<any> }) {
  const dateFilter = table.getColumn('createdAt')?.getFilterValue() as DateRange | undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="date" variant={'outline'} className={cn('w-full justify-start text-left font-normal h-10 border-dashed lg:w-[260px]', !dateFilter && 'text-muted-foreground')}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateFilter?.from ? (
            dateFilter.to ? (
              <>
                {format(dateFilter.from, 'LLL dd, y')} - {format(dateFilter.to, 'LLL dd, y')}
              </>
            ) : (
              format(dateFilter.from, 'LLL dd, y')
            )
          ) : (
            <span>Pilih tanggal</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar initialFocus mode="range" defaultMonth={dateFilter?.from} selected={dateFilter} onSelect={(date) => table.getColumn('createdAt')?.setFilterValue(date)} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  );
}
declare module '@tanstack/react-table' {
  interface FilterFns {
    dateRange: FilterFn<unknown>;
  }
}

export function InvoiceDataTable<TData, TValue>({ columns: initialColumns, data }: { columns: ColumnDef<TData, TValue>[]; data: TData[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ customerPhone: false, notes: false, updatedAt: false });
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [isPending, startTransition] = React.useTransition();
  const columns = React.useMemo(() => initialColumns, [initialColumns]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => (row as SerializableInvoice).id,
    meta: { expandedRows, setExpandedRows },
    filterFns: { dateRange: dateRangeFilterFn },
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleStatusUpdate = (status: InvoiceStatus) => {
    startTransition(async () => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      const invoiceIds = selectedRows.map((row) => (row.original as SerializableInvoice).id);
      const result = await updateInvoicesStatus(invoiceIds, status);
      if (result.success) {
        toast.success(result.success);
        table.resetRowSelection();
      } else {
        toast.error(result.error);
      }
    });
  };
  const isFiltered = columnFilters.length > 0;
  const statuses = [
    { value: 'DALAM_ANTRIAN', label: 'Dalam Antrian' },
    { value: 'PROCESSED', label: 'Diproses' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
  ];
  const selectedStatuses = new Set(table.getColumn('status')?.getFilterValue() as string[]);

  return (
    <Card className="w-full p-5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <Input
            placeholder="Filter judul..."
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            className="h-10 w-full md:w-auto md:max-w-[150px] lg:max-w-xs"
          />
          <Input
            placeholder="Filter nama..."
            value={(table.getColumn('customerName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('customerName')?.setFilterValue(event.target.value)}
            className="h-10 w-full md:w-auto md:max-w-[150px] lg:max-w-xs"
          />
          <Input
            placeholder="Filter jenis..."
            value={(table.getColumn('orderType')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('orderType')?.setFilterValue(event.target.value)}
            className="h-10 w-full md:w-auto md:max-w-[150px] lg:max-w-xs"
          />
          <DatePickerWithRange table={table} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 border-dashed">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Status
                {selectedStatuses.size > 0 && (
                  <>
                    <div className="hidden h-4 w-px bg-muted-foreground/20 mx-2 lg:block" />
                    <div className="hidden space-x-1 lg:flex">
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedStatuses.size} dipilih
                      </Badge>
                    </div>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Cari status..." />
                <CommandList>
                  <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => {
                      const isSelected = selectedStatuses.has(status.value);
                      return (
                        <CommandItem
                          key={status.value}
                          onSelect={() => {
                            if (isSelected) {
                              selectedStatuses.delete(status.value);
                            } else {
                              selectedStatuses.add(status.value);
                            }
                            const filterValues = Array.from(selectedStatuses);
                            table.getColumn('status')?.setFilterValue(filterValues.length ? filterValues : undefined);
                          }}
                        >
                          <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'}`}>
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{status.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedStatuses.size > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem onSelect={() => table.getColumn('status')?.setFilterValue(undefined)} className="justify-center text-center">
                          Reset
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 border-dashed" disabled={isPending}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Ubah {table.getFilteredSelectedRowModel().rows.length} data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Ubah status menjadi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleStatusUpdate(InvoiceStatus.PROCESSED)}>Diproses</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusUpdate(InvoiceStatus.COMPLETED)}>Selesai</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusUpdate(InvoiceStatus.CANCELLED)}>Dibatalkan</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isFiltered && (
            <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-10 px-2 lg:px-3">
              Reset <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <AddInvoiceForm />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnLabels: { [key: string]: string } = {
                    customerPhone: 'No. Telepon',
                    orderType: 'Jenis Pesanan',
                    amountPaid: 'Sudah Dibayar',
                    totalPrice: 'Total Harga',
                    createdAt: 'Tanggal Dibuat',
                    updatedAt: 'Terakhir Diubah',
                    notes: 'Catatan',
                    'createdBy.name': 'Admin',
                  };
                  const displayName = columnLabels[column.id] || column.id;
                  return (
                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                      {displayName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn((header.column.columnDef as any).className)}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn((cell.column.columnDef as any).className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.id] && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={table.getVisibleFlatColumns().length}>
                        <InvoiceItemsDetail row={row} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Berikutnya
        </Button>
      </div>
    </Card>
  );
}
