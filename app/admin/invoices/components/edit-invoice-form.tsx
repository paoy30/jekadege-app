'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { InvoiceStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateInvoice, uploadPaymentProof } from '@/app/actions/invoiceActions';
import { invoiceSchema } from '@/lib/schemas/invoice';
import { PlusCircle, Trash2, CalendarIcon, CheckCircle2, History, UploadCloud, ImageIcon, X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SerializableInvoice } from './columns';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditInvoiceFormProps {
  invoice: SerializableInvoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInvoiceForm({ invoice, open, onOpenChange }: EditInvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    values: {
      title: invoice.title,
      customerName: invoice.customerName || '',
      customerPhone: invoice.customerPhone || '',
      customerAddress: invoice.customerAddress || '',
      orderType: invoice.orderType || '',
      status: invoice.status,
      notes: invoice.notes || '',
      amountPaid: invoice.amountPaid,
      estimatedFinishedAt: invoice.estimatedFinishedAt ? new Date(invoice.estimatedFinishedAt) : null,
      paymentProof: invoice.paymentProof || null,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Handle Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      setIsUploading(true);
      const result = await uploadPaymentProof(formData);
      setIsUploading(false);

      if (result.success) {
        form.setValue('paymentProof', result.success, { shouldDirty: true });
        toast.success('Bukti pembayaran berhasil diunggah');
      } else {
        toast.error(result.error || 'Gagal mengunggah gambar');
      }
    }
  };

  const handleRemoveProof = () => {
    form.setValue('paymentProof', null, { shouldDirty: true });
  };

  async function onSubmit(values: z.infer<typeof invoiceSchema>) {
    setIsSubmitting(true);
    const result = await updateInvoice(invoice.id, values);
    if (result.success) {
      toast.success(result.success);
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Terjadi kesalahan');
    }
    setIsSubmitting(false);
  }

  const handleConfirmOrder = () => {
    const currentEstDate = form.getValues('estimatedFinishedAt');
    const paymentProof = form.getValues('paymentProof');

    if (!currentEstDate) {
      toast.error("Harap isi 'Estimasi Selesai' sebelum konfirmasi pesanan.");
      form.setFocus('estimatedFinishedAt');
      return;
    }

    if (!paymentProof) {
      toast.warning('Bukti pembayaran belum diupload. Lanjutkan?', {
        action: {
          label: 'Ya, Lanjut',
          onClick: () => {
            form.setValue('status', InvoiceStatus.DIPROSES);
            toast.info('Status diubah ke DIPROSES. Klik Simpan untuk update DB.');
          },
        },
      });
      return;
    }

    form.setValue('status', InvoiceStatus.DIPROSES);
    toast.info('Status diubah ke DIPROSES. Klik Simpan untuk update DB.');
  };

  const paymentProofUrl = form.watch('paymentProof');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Pesanan & Riwayat</DialogTitle>
            {form.watch('status') === 'DALAM_ANTRIAN' && (
              <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmOrder}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Konfirmasi Pesanan
              </Button>
            )}
          </div>
          <DialogDescription>Perbarui detail, upload bukti bayar, atau pantau riwayat.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KOLOM KIRI: Form Edit */}
          <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Pesanan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedFinishedAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-bold ">Estimasi Selesai</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal ', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => date < new Date('1900-01-01')} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Saat Ini</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={InvoiceStatus.DALAM_ANTRIAN}>Dalam Antrian</SelectItem>
                            <SelectItem value={InvoiceStatus.DIPROSES}>Diproses</SelectItem>
                            <SelectItem value={InvoiceStatus.DIANTAR}>Diantar</SelectItem>
                            <SelectItem value={InvoiceStatus.SELESAI}>Selesai</SelectItem>
                            <SelectItem value={InvoiceStatus.BATAL}>Batal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* BAGIAN UPLOAD BUKTI PEMBAYARAN */}
                <div className="p-4 border border-dashed rounded-lg ">
                  <FormLabel className="mb-2 block">Bukti Pembayaran / DP</FormLabel>
                  {!paymentProofUrl ? (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2  border-dashed rounded-lg cursor-pointer ">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploading ? <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" /> : <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />}
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Klik upload</span> atau drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX. 2MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                      </label>
                    </div>
                  ) : (
                    <div className="relative w-full h-48 rounded-md overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={paymentProofUrl} alt="Bukti Bayar" className="object-contain w-full h-full bg-slate-200" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={handleRemoveProof}>
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">{paymentProofUrl.split('/').pop()}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Dibayar</FormLabel>
                        <FormControl>
                          <CurrencyInput placeholder="Rp 0" value={field.value} onValueChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* DETAILS ITEMS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Detail Item</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Item
                    </Button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 p-2 border rounded-md relative items-end">
                      <div className="col-span-12 md:col-span-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Deskripsi</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-8 text-sm" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Qty</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" {...field} className="h-8 text-sm" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Harga</FormLabel>
                              <FormControl>
                                <CurrencyInput placeholder="Rp 0" value={field.value} onValueChange={field.onChange} className="h-8 text-sm" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-end">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>

          {/* KOLOM KANAN: Riwayat Status */}
          <div className="md:col-span-1 border-l pl-4 hidden md:block">
            <h4 className="font-semibold mb-3 flex items-center">
              <History className="mr-2 h-4 w-4" /> Riwayat Status
            </h4>
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative border-l border-gray-200 ml-2 space-y-6">
                {invoice.history && invoice.history.length > 0 ? (
                  invoice.history.map((hist, i) => (
                    <div key={i} className="mb-6 ml-4">
                      <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full " />
                      <p className="mb-1 text-xs font-normal text-muted-foreground">{format(new Date(hist.createdAt), 'd MMM yyyy, HH:mm', { locale: id })}</p>
                      <h5 className="text-sm font-semibold ">{hist.status.replace('_', ' ')}</h5>
                      {hist.note && <p className="text-xs text-muted-foreground italic">"{hist.note}"</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground ml-4">Belum ada riwayat.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
