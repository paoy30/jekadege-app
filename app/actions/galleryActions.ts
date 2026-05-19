'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import {  authOptions } from '@/auth';
import { getServerSession } from 'next-auth';

// Fungsi helper untuk membuat slug dari judul
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

// Skema validasi untuk data teks (coverImage dihapus)
const sectionSchema = z.object({
  title: z.string().min(3, { message: 'Judul minimal 3 karakter.' }),
  category: z.string().min(2, { message: 'Kategori wajib diisi.' }),
  description: z.string().optional(),
});

// Fungsi helper untuk menyimpan file
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/ /g, '_')}`;
  const path = join(process.cwd(), 'public/uploads', fileName);
  await writeFile(path, buffer);
  return `/uploads/${fileName}`;
}

// Fungsi helper untuk menghapus file
async function deleteFile(filePath: string) {
  try {
    const fullPath = join(process.cwd(), 'public', filePath);
    await unlink(fullPath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Gagal menghapus file:', error);
    }
  }
}

// --- FUNGSI CREATE ---

export async function createGallerySection(formData: FormData) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Akses ditolak.' };
  }

  const values = Object.fromEntries(formData.entries());
  const coverImageFile = values.coverImage as File;

  if (!coverImageFile || coverImageFile.size === 0) {
    return { error: 'Gambar sampul wajib diisi.' };
  }

  const validatedFields = sectionSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Data formulir tidak valid.', details: validatedFields.error.flatten() };
  }

  try {
    const coverImagePath = await saveFile(coverImageFile);
    const { title, category, description } = validatedFields.data;
    const slug = createSlug(title);

    await prisma.gallerySection.create({
      data: {
        id: slug,
        title,
        category,
        description,
        coverImage: coverImagePath,
      },
    });

    revalidatePath('/admin/gallery');
    return { success: 'Seksi galeri berhasil dibuat!' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal membuat seksi galeri. Pastikan ID unik atau hubungi administrator.' };
  }
}

export async function addImageToSection(
  sectionId: string,
  imageUrl: string,
  priceEstimate: number // Parameter baru
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Akses ditolak.' };
  }

  if (!imageUrl) {
    return { error: 'URL Gambar wajib diisi.' };
  }

  try {
    await prisma.galleryImage.create({
      data: {
        sectionId,
        imageUrl: imageUrl,
        priceEstimate: priceEstimate, // Simpan ke database
      },
    });
    revalidatePath(`/admin/gallery/${sectionId}`);
    return { success: 'Gambar dan harga berhasil ditambahkan!' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal menambahkan gambar ke database.' };
  }
}

// --- FUNGSI UPDATE ---

export async function updateGallerySection(sectionId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Akses ditolak.' };
  }

  const values = Object.fromEntries(formData.entries());
  const newImageFile = values.coverImage as File;

  const validatedFields = sectionSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Data formulir tidak valid.' };
  }

  try {
    const { title, category, description } = validatedFields.data;
    const dataToUpdate: any = { title, category, description };

    if (newImageFile && newImageFile.size > 0) {
      const oldSection = await prisma.gallerySection.findUnique({
        where: { id: sectionId },
        select: { coverImage: true },
      });
      const oldImagePath = oldSection?.coverImage;

      dataToUpdate.coverImage = await saveFile(newImageFile);

      await prisma.gallerySection.update({
        where: { id: sectionId },
        data: dataToUpdate,
      });

      if (oldImagePath) {
        await deleteFile(oldImagePath);
      }
    } else {
      await prisma.gallerySection.update({
        where: { id: sectionId },
        data: dataToUpdate,
      });
    }

    revalidatePath('/admin/gallery');
    revalidatePath(`/admin/gallery/${sectionId}`);
    return { success: 'Seksi galeri berhasil diperbarui!' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal memperbarui seksi galeri.' };
  }
}

// --- FUNGSI DELETE ---

export async function deleteGallerySection(sectionId: string) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Akses ditolak.' };
  }

  try {
    const sectionToDelete = await prisma.gallerySection.findUnique({
      where: { id: sectionId },
      include: { images: true },
    });

    if (!sectionToDelete) {
      return { error: 'Seksi tidak ditemukan.' };
    }

    const imagePaths = [sectionToDelete.coverImage, ...sectionToDelete.images.map((img) => img.imageUrl)];

    await prisma.gallerySection.delete({ where: { id: sectionId } });

    for (const path of imagePaths) {
      await deleteFile(path);
    }

    revalidatePath('/admin/gallery');
    return { success: 'Seksi galeri berhasil dihapus!' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal menghapus seksi galeri.' };
  }
}

export async function deleteGalleryImage(imageId: string, sectionId: string) {
    const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Akses ditolak.' };
  }

  try {
    const imageToDelete = await prisma.galleryImage.findUnique({
      where: { id: imageId },
    });

    if (!imageToDelete) {
      return { error: 'Gambar tidak ditemukan.' };
    }

    await prisma.galleryImage.delete({ where: { id: imageId } });
    await deleteFile(imageToDelete.imageUrl);

    revalidatePath(`/admin/gallery/${sectionId}`);
    return { success: 'Gambar berhasil dihapus!' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal menghapus gambar.' };
  }
}
