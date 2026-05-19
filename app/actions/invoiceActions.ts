'use server';

import prisma from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { invoiceSchema } from '@/lib/schemas/invoice';
import { z } from 'zod';
import { writeFile, mkdir, unlink } from 'fs/promises'; // Tambahkan unlink
import { join } from 'path';

// Helper Session
async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

// Helper: Hapus File Lama
async function deleteOldFile(fileUrl: string) {
  try {
    // Ubah URL "/uploads/namafile.jpg" menjadi path sistem absolute
    const filename = fileUrl.split('/').pop(); // Ambil nama file saja
    if (!filename) return;

    const filePath = join(process.cwd(), 'public', 'uploads', filename);

    // Hapus file
    await unlink(filePath);
    console.log(`Deleted old file: ${filename}`);
  } catch (error) {
    // Abaikan error jika file sudah tidak ada (misal sudah dihapus manual)
    console.warn('Gagal menghapus file lama atau file tidak ditemukan:', error);
  }
}

// ---------------------------------------------------------
// ACTION: Upload Image
// ---------------------------------------------------------
export async function uploadPaymentProof(formData: FormData) {
  try {
    // Proteksi: Cek session dulu (Opsional: buka jika customer boleh upload tanpa login)
    // await getAuthUser();

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'Tidak ada file yang diunggah' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik & aman
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = `proof-${uniqueSuffix}-${safeName}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Pastikan folder ada
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Folder sudah ada
    }

    const path = join(uploadDir, filename);

    // Tulis file baru
    await writeFile(path, buffer);

    const fileUrl = `/uploads/${filename}`;
    return { success: fileUrl };
  } catch (error) {
    console.error('Upload Error:', error);
    return { error: 'Gagal menyimpan file ke server.' };
  }
}

// ---------------------------------------------------------
// CRUD Actions
// ---------------------------------------------------------

export async function createInvoice(data: z.infer<typeof invoiceSchema>) {
  // ... (Kode createInvoice SAMA SEPERTI SEBELUMNYA, tidak perlu diubah)
  try {
    const userId = await getAuthUser();
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(100 + Math.random() * 900);
    const newInvoiceId = `INV-${datePart}${randomPart}`;

    const totalPrice = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    await prisma.invoice.create({
      data: {
        id: newInvoiceId,
        userId,
        title: data.title,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        orderType: data.orderType,
        status: data.status,
        notes: data.notes,
        totalPrice,
        amountPaid: data.amountPaid,
        estimatedFinishedAt: data.estimatedFinishedAt,
        paymentProof: data.paymentProof,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
        history: {
          create: {
            status: data.status,
            note: 'Pesanan baru dibuat',
          },
        },
      },
    });

    revalidatePath('/admin/invoices');
    return { success: 'Pesanan berhasil dibuat' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal membuat pesanan' };
  }
}

// UPDATE INVOICE (DENGAN LOGIKA HAPUS GAMBAR LAMA)
export async function updateInvoice(id: string, data: z.infer<typeof invoiceSchema>) {
  try {
    // Cek user login (Jika halaman publik customer bisa akses, comment baris ini atau sesuaikan logic)
    // await getAuthUser();

    // 1. Ambil Data Lama dari Database
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingInvoice) return { error: 'Invoice tidak ditemukan' };

    // 2. LOGIKA HAPUS GAMBAR LAMA
    // Jika ada gambar baru (data.paymentProof) DAN berbeda dengan yang lama
    if (data.paymentProof && existingInvoice.paymentProof && data.paymentProof !== existingInvoice.paymentProof) {
      await deleteOldFile(existingInvoice.paymentProof);
    }

    const totalPrice = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const statusChanged = existingInvoice.status !== data.status;

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          title: data.title,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          orderType: data.orderType,
          status: data.status,
          notes: data.notes,
          totalPrice,
          amountPaid: data.amountPaid,
          estimatedFinishedAt: data.estimatedFinishedAt,
          paymentProof: data.paymentProof, // Simpan URL baru
        },
      });

      // Update Items (Re-create strategy)
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoiceItem.createMany({
        data: data.items.map((item) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      });

      if (statusChanged) {
        await tx.invoiceHistory.create({
          data: {
            invoiceId: id,
            status: data.status,
            note: `Status diubah manual menjadi ${data.status.replace('_', ' ')}`,
          },
        });
      }
    });

    revalidatePath('/admin/invoices');
    // Revalidate halaman detail order customer juga
    revalidatePath(`/order/${id}`);

    return { success: 'Pesanan berhasil diperbarui' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal memperbarui pesanan' };
  }
}

// ... (Sisa fungsi updateInvoicesStatus, deleteInvoice, checkAndAutoUpdateStatus biarkan saja, tidak berubah)
export async function updateInvoicesStatus(ids: string[], status: InvoiceStatus) {
  try {
    await getAuthUser();

    await prisma.$transaction(async (tx) => {
      await tx.invoice.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });

      // Insert history untuk setiap invoice
      for (const id of ids) {
        await tx.invoiceHistory.create({
          data: {
            invoiceId: id,
            status: status,
            note: 'Update status massal',
          },
        });
      }
    });

    revalidatePath('/admin/invoices');
    return { success: 'Status berhasil diperbarui' };
  } catch (error) {
    return { error: 'Gagal update status' };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await getAuthUser();
    // Opsional: Hapus gambar juga saat invoice dihapus
    const inv = await prisma.invoice.findUnique({ where: { id } });
    if (inv?.paymentProof) await deleteOldFile(inv.paymentProof);

    await prisma.invoice.delete({ where: { id } });
    revalidatePath('/admin/invoices');
    return { success: 'Pesanan dihapus' };
  } catch (error) {
    return { error: 'Gagal menghapus pesanan' };
  }
}

export async function checkAndAutoUpdateStatus() {
  const now = new Date();
  try {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'DIPROSES',
        estimatedFinishedAt: { lte: now },
      },
      select: { id: true, title: true },
    });

    if (overdueInvoices.length === 0) return;

    await prisma.$transaction(async (tx) => {
      for (const inv of overdueInvoices) {
        await tx.invoice.update({
          where: { id: inv.id },
          data: { status: 'SELESAI' },
        });

        await tx.invoiceHistory.create({
          data: {
            invoiceId: inv.id,
            status: 'SELESAI',
            note: 'Otomatis: Estimasi waktu telah tercapai',
          },
        });
      }
    });
    console.log(`Auto-updated ${overdueInvoices.length} invoices to SELESAI.`);
  } catch (error) {
    console.error('Auto update failed:', error);
  }
}
