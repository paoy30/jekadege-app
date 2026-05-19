'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const linkSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter.'),
  url: z.string().url('URL tidak valid.'),
  icon: z.string().min(2, 'Ikon harus dipilih.'),
});

export async function createLink(formData: FormData) {
    const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return { error: 'Akses ditolak.' };

  const validatedFields = linkSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: 'Data tidak valid.' };

  try {
    await prisma.link.create({
      data: { ...validatedFields.data, userId: session.user.id },
    });
    revalidatePath('/admin/links');
    return { success: 'Link berhasil dibuat.' };
  } catch (error) {
    return { error: 'Gagal membuat link.' };
  }
}

export async function updateLink(linkId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) return { error: 'Akses ditolak.' };

  const validatedFields = linkSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { error: 'Data tidak valid.' };

  try {
    await prisma.link.update({
      where: { id: linkId, userId: session.user.id },
      data: validatedFields.data,
    });
    revalidatePath('/admin/links');
    return { success: 'Link berhasil diperbarui.' };
  } catch (error) {
    return { error: 'Gagal memperbarui link.' };
  }
}

export async function deleteLink(linkId: string) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) return { error: 'Akses ditolak.' };

  try {
    await prisma.link.delete({
      where: { id: linkId, userId: session.user.id },
    });
    revalidatePath('/admin/links');
    return { success: 'Link berhasil dihapus.' };
  } catch (error) {
    return { error: 'Gagal menghapus link.' };
  }
}
