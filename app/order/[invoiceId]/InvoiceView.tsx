'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, Pencil, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { SerializableInvoice } from '@/app/admin/invoices/components/columns';
import { InvoiceDocument } from './InvoicePDF';

// Pastikan path import ini benar sesuai struktur folder Anda
import { updateInvoice, uploadPaymentProof } from '@/app/actions/invoiceActions';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const getStatusInfo = (status: string) => {
  const statusMap: { [key: string]: { text: string; className: string } } = {
    DALAM_ANTRIAN: { text: 'Diantrian', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    DIPROSES: { text: 'Diproses', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    DIANTAR: { text: 'Diantar', className: 'bg-purple-100 text-purple-800 border-purple-300' },
    SELESAI: { text: 'Selesai', className: 'bg-green-100 text-green-800 border-green-300' },
    BATAL: { text: 'Dibatalkan', className: 'bg-red-100 text-red-800 border-red-300' },
  };
  return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
};

export function InvoiceView({ invoice, onEditRequest }: { invoice: SerializableInvoice; onEditRequest: () => void }) {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const qrCodeRef = React.useRef<HTMLDivElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = React.useState('');

  React.useEffect(() => {
    setIsClient(true);
    setTimeout(() => {
      if (qrCodeRef.current) {
        const canvas = qrCodeRef.current.querySelector('canvas');
        if (canvas) {
          setQrCodeDataURL(canvas.toDataURL());
        }
      }
    }, 500);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar (Max 2MB)');
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadResult = await uploadPaymentProof(formData);

        if (uploadResult.error || !uploadResult.success) {
          throw new Error(uploadResult.error || 'Gagal upload gambar');
        }

        const newPaymentProofUrl = uploadResult.success;

        // Construct update data
        const updateData = {
          title: invoice.title,
          customerName: invoice.customerName || undefined,
          customerPhone: invoice.customerPhone || undefined,
          customerAddress: invoice.customerAddress || undefined,
          orderType: invoice.orderType || undefined,
          status: invoice.status,
          notes: invoice.notes || undefined,
          amountPaid: invoice.amountPaid,
          estimatedFinishedAt: invoice.estimatedFinishedAt ? new Date(invoice.estimatedFinishedAt) : null,
          paymentProof: newPaymentProofUrl,
          items: invoice.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        };

        const updateResult = await updateInvoice(invoice.id, updateData);

        if (updateResult.success) {
          toast.success('Bukti pembayaran berhasil diunggah!');
          router.refresh();
        } else {
          throw new Error(updateResult.error);
        }
      } catch (error: any) {
        toast.error(error.message || 'Gagal menyimpan data');
        console.error(error);
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const orderUrl = isClient ? window.location.href : '';
  const statusInfo = getStatusInfo(invoice.status);

  return (
    <Card className="bg-white text-black md:max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start items-end gap-2">
          <div>
            <CardTitle>Detail Pesanan Anda</CardTitle>
            <CardDescription className="text-gray-600 pr-0 sm:pr-28">Terima kasih! Berikut adalah rincian pesanan.</CardDescription>
          </div>
          <Badge variant="outline" className={`py-1 px-3 text-sm ${statusInfo.className}`}>
            {statusInfo.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Pemesan */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900">Informasi Pemesan</h3>
            <p className="text-sm font-medium">{invoice.customerName}</p>
            <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
            <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onEditRequest} title="Edit Pesanan">
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        <Separator />

        {/* Item List */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">Rincian Barang</h3>
          <div className="space-y-3">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="flex-1 pr-4">
                  <p className="font-medium text-gray-800">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-right text-gray-900">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Total Harga</p>
            <p className="font-medium">{formatCurrency(invoice.totalPrice)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Sudah Dibayar</p>
            <p className="font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</p>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-bold">
            <p>Sisa Bayar</p>
            <p className="text-blue-600">{formatCurrency(invoice.totalPrice - invoice.amountPaid)}</p>
          </div>
        </div>

        {/* Upload Bukti Pembayaran */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            Bukti Pembayaran
            {invoice.paymentProof && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </h3>

          {invoice.paymentProof ? (
            <div className="relative border rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={invoice.paymentProof} alt="Bukti Transfer" className="w-full h-48 object-contain bg-gray-100" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                  Ganti Bukti
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                </label>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Mengunggah...</p>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <div className="bg-blue-50 p-3 rounded-full mb-3">
                    <UploadCloud className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Bukti Transfer</p>
                  <p className="text-xs text-gray-500 mt-1">Format JPG, PNG (Max 2MB)</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Scan untuk cek status</p>
          <div ref={qrCodeRef} className="bg-white p-2 border rounded-xl shadow-sm inline-block">
            {isClient && <QRCodeCanvas value={orderUrl} size={100} />}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center bg-gray-50 rounded-b-lg border-t pt-6">
        {isClient && qrCodeDataURL && (
          <PDFDownloadLink document={<InvoiceDocument invoice={invoice} qrCodeDataURL={qrCodeDataURL} />} fileName={`invoice-${invoice.id}.pdf`} className="w-full">
            {({ loading }) => (
              <Button className="w-full h-11 text-base shadow-sm" variant={"secondary"} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {loading ? 'Menyiapkan PDF...' : 'Unduh Invoice (PDF)'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </CardFooter>
    </Card>
  );
}
