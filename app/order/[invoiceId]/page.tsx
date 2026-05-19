import prisma from '@/lib/prisma';
import { OrderClientManager } from './OrderClientManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { notFound } from 'next/navigation';

// Definisikan tipe Props untuk Next.js 15
interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function OrderPageForCustomer({ params }: PageProps) {
  // 1. AWAIT PARAMS TERLEBIH DAHULU (Wajib di Next.js 15)
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      createdBy: {
        select: { name: true },
      },
      // Sertakan history jika diperlukan
      history: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Jika tidak ditemukan
  if (!invoice) {
    return (
      <main className="min-h-screen p-4 sm:p-8 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-md max-w-md w-full border">
          <SearchX className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold text-gray-900">Invoice Tidak Ditemukan</h1>
          <p className="text-muted-foreground">
            Maaf, kami tidak dapat menemukan invoice dengan ID <span className="font-semibold text-black">{invoiceId}</span>.
          </p>
          <Button asChild>
            <Link href="/">Kembali ke Halaman Utama</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Serialize Decimal & Date data
  // Pastikan strukturnya sesuai dengan tipe SerializableInvoice di client
  const serializableInvoice = {
    ...invoice,
    totalPrice: invoice.totalPrice.toNumber(),
    amountPaid: invoice.amountPaid.toNumber(),
    estimatedFinishedAt: invoice.estimatedFinishedAt ? invoice.estimatedFinishedAt.toISOString() : null,
    // Pastikan field paymentProof terbawa
    paymentProof: invoice.paymentProof,
    items: invoice.items.map((item) => ({
      ...item,
      quantity: item.quantity.toNumber(),
      unitPrice: item.unitPrice.toNumber(),
      amount: item.amount.toNumber(),
    })),
    // Mapping history jika ada di type definition
    history: invoice.history
      ? invoice.history.map((h) => ({
          ...h,
          createdAt: h.createdAt.toISOString(),
        }))
      : [],
  };

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <OrderClientManager initialInvoice={serializableInvoice} />
      </div>
    </main>
  );
}
