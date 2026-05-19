'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateGallerySection } from '@/app/actions/galleryActions';
import { useFormStatus } from 'react-dom';
import { GallerySection } from '@prisma/client';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Memperbarui...' : 'Simpan Perubahan'}
    </Button>
  );
}

interface EditSectionFormProps {
  section: GallerySection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSectionForm({ section, open, onOpenChange }: EditSectionFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleUpdate = async (formData: FormData) => {
    const result = await updateGallerySection(section.id, formData);
    if (result.success) {
      toast.success(result.success);
      onOpenChange(false);
    } else {
      toast.error(result.error || 'Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section Galeri</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" name="title" required defaultValue={section.title} />
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
            <Label>Gambar Sampul Saat Ini</Label>
            <div className="relative h-24 w-40 rounded-md overflow-hidden">
              <Image src={section.coverImage} alt={section.title} fill className="object-cover" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImage">Ganti Gambar Sampul (Opsional)</Label>
            <Input id="coverImage" name="coverImage" type="file" accept="image/*" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={section.description || ''} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
