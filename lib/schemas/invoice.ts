// lib/schemas/invoice.ts
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const invoiceSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  orderType: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus),
  notes: z.string().optional(),
  amountPaid: z.coerce.number().min(0),
  estimatedFinishedAt: z.date().optional().nullable(),

  // Field Baru
  paymentProof: z.string().optional().nullable(),

  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Deskripsi wajib diisi'),
        quantity: z.coerce.number().min(1),
        unitPrice: z.coerce.number().min(0),
      })
    )
    .min(1, 'Minimal satu item'),
});
