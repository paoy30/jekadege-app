'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createGallerySection } from '@/app/actions/galleryActions';

export function AddSectionForm({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // ===================================================================
  // ## PERBAIKAN FINAL: Gunakan onSubmit, bukan 'action' ##
  // ===================================================================
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Mencegah reload halaman
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const coverImageFile = formData.get('coverImage') as File;

    if (!coverImageFile || coverImageFile.size === 0) {
      toast.error('Gambar sampul wajib diisi.');
      setIsSubmitting(false);
      return;
    }

    const result = await createGallerySection(formData);

    if (result.success) {
      toast.success(result.success);
      setOpen(false);
      formRef.current?.reset();
    } else {
      toast.error(result.error || 'Terjadi kesalahan.');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Section Galeri Baru</DialogTitle>
        </DialogHeader>
        {/* 'onSubmit' digunakan untuk menangani form di sisi klien */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" name="title" required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <select id="category" name="category" required disabled={isSubmitting} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Pilih Kategori</option>
              <option value="kaos">Kaos</option>
              <option value="jersey">Jersey</option>
              <option value="jaket">Jaket</option>
              <option value="hoodie">Hoodie</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImage">Gambar Sampul</Label>
            <Input id="coverImage" name="coverImage" type="file" required accept="image/*" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea id="description" name="description" disabled={isSubmitting} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
            </DialogContent>
          </Dialog>
        );
      }
