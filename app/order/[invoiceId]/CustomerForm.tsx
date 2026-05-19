'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {  updateInvoice } from '@/app/actions/invoiceActions';
import { Loader2 } from 'lucide-react';
import type { SerializableInvoice } from '@/app/admin/invoices/components/columns';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={'secondary'}  disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Menyimpan...' : 'Simpan & Lihat Invoice'}
    </Button>
  );
}

interface CustomerFormProps {
  invoice: SerializableInvoice;
  onFormSuccess: (updatedData: Partial<SerializableInvoice>) => void;
}

export function CustomerForm({ invoice, onFormSuccess }: CustomerFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await updateInvoice(invoice.id, formData);
    if (result.success) {
      toast.success(result.success);
      // Panggil callback untuk memberitahu parent bahwa form sukses
      const updatedData = {
        customerName: formData.get('customerName') as string,
        customerPhone: formData.get('customerPhone') as string,
        customerAddress: formData.get('customerAddress') as string,
        notes: formData.get('notes') as string,
      };
      onFormSuccess(updatedData);
    } else {
      toast.error(result.error || 'Terjadi kesalahan');
    }
  };

  return (
    <Card className="bg-white text-black">
      <CardHeader>
        <CardTitle>Lengkapi Data Pesanan</CardTitle>
        <CardDescription>
          Silakan isi detail pengiriman untuk pesanan <span className="font-semibold">{invoice.title}</span>.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Lengkap</Label>
            <Input id="customerName" name="customerName" required defaultValue={invoice.customerName || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Nomor Telepon (WhatsApp)</Label>
            <Input id="customerPhone" name="customerPhone" type="tel" required defaultValue={invoice.customerPhone || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerAddress">Alamat Lengkap Pengiriman</Label>
            <Textarea id="customerAddress" name="customerAddress" required placeholder="Sertakan nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kab, dan kode pos." defaultValue={invoice.customerAddress || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
            <Textarea id="notes" name="notes" placeholder="cth: Ukuran L ganti jadi XL, dll." defaultValue={invoice.notes || ''} />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
