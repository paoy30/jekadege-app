// app/admin/invoices/page.tsx

import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceDataTable } from './components/data-table';
import { columns } from './components/columns';
import { Banknote, FileText, FileX, Package } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { checkAndAutoUpdateStatus } from '@/app/actions/invoiceActions';

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/admin/login');
  }

  // 1. Jalankan Auto Update Check "Just-in-time"
  // Ini akan mengubah status DI DB jika waktu estimasi sudah lewat sebelum data diambil
  await checkAndAutoUpdateStatus();

  // 2. Fetch Data (termasuk history)
  const invoicesFromDb = await prisma.invoice.findMany({
    include: {
      createdBy: {
        select: { name: true },
      },
      items: true,
      history: {
        orderBy: { createdAt: 'desc' }, // Ambil history terbaru
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const serializableInvoices = invoicesFromDb.map((invoice) => ({
    ...invoice,
    totalPrice: invoice.totalPrice.toNumber(),
    amountPaid: invoice.amountPaid.toNumber(),
    estimatedFinishedAt: invoice.estimatedFinishedAt ? invoice.estimatedFinishedAt.toISOString() : null,
    items: invoice.items.map((item) => ({
      ...item,
      quantity: item.quantity.toNumber(),
      unitPrice: item.unitPrice.toNumber(),
      amount: item.amount.toNumber(),
    })),
    // Kirim history ke client component
    history: invoice.history.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  const stats = await prisma.$transaction(async (tx) => {
    const totalRevenueResult = await tx.invoice.aggregate({
      where: { status: 'SELESAI' },
      _sum: { totalPrice: true },
    });
    const totalReceivablesResult = await tx.invoice.findMany({
      where: { status: 'DIPROSES' },
      select: { totalPrice: true, amountPaid: true },
    });
    const totalCancelled = await tx.invoice.count({
      where: { status: 'BATAL' },
    });
    const totalRevenue = Number(totalRevenueResult._sum.totalPrice) || 0;
    const totalReceivables = totalReceivablesResult.reduce((sum, inv) => sum + (Number(inv.totalPrice) - Number(inv.amountPaid)), 0);
    return { totalRevenue, totalReceivables, totalInvoices: invoicesFromDb.length, totalCancelled };
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Invoice Customer</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Dari pesanan yang selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats.totalReceivables)}</div>
            <p className="text-xs text-muted-foreground">Dari pesanan yang diproses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">+{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Termasuk semua status</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dibatalkan</CardTitle>
            <FileX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">+{stats.totalCancelled}</div>
            <p className="text-xs text-muted-foreground">Pesanan yang dibatalkan</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full mx-auto py-0 px-0">
        <InvoiceDataTable columns={columns} data={serializableInvoices} />
      </div>
    </div>
  );
}
