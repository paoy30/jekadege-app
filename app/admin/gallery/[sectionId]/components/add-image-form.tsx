'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Pastikan import action sudah sesuai path Anda
import { addImageToSection } from '@/app/actions/galleryActions';
import { Loader2, UploadCloud } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function AddImageForm({ sectionId }: { sectionId: string }) {
  const [file, setFile] = React.useState<File | null>(null);
  // State baru untuk harga
  const [price, setPrice] = React.useState<string>('');
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const priceInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error('Silakan pilih file untuk diunggah.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          // Konversi harga ke number (default 0 jika kosong)
          const priceValue = price ? parseFloat(price) : 0;

          // Panggil Server Action dengan parameter harga
          const result = await addImageToSection(sectionId, response.path, priceValue);

          if (result.success) {
            toast.success('Gambar berhasil ditambahkan ke galeri!');
            // Reset form
            setFile(null);
            setPrice(''); // Reset harga
            if (inputRef.current) inputRef.current.value = '';
            if (priceInputRef.current) priceInputRef.current.value = '';
          } else {
            toast.error(result.error || 'Gagal menyimpan ke database.');
          }
        } else {
          toast.error(response.error || 'Gagal mengunggah file.');
        }
      } else {
        toast.error(`Error: ${xhr.statusText}`);
      }
      setIsUploading(false);
    });

    xhr.addEventListener('error', () => {
      toast.error('Terjadi kesalahan saat mengunggah.');
      setIsUploading(false);
    });

    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Gambar Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">File Gambar</Label>
            <Input id="imageUrl" name="imageUrl" type="file" required accept="image/*" onChange={handleFileChange} ref={inputRef} disabled={isUploading} />
          </div>

          {/* Input Baru: Estimasi Harga */}
          <div className="space-y-2">
            <Label htmlFor="priceEstimate">Estimasi Harga (Rp)</Label>
            <Input id="priceEstimate" name="priceEstimate" type="number" placeholder="Contoh: 150000" value={price} onChange={(e) => setPrice(e.target.value)} ref={priceInputRef} disabled={isUploading} />
          </div>

          {isUploading && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Mengunggah: {uploadProgress}%</p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <Button type="submit" disabled={isUploading || !file} className="w-full">
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? (
              'Mengunggah...'
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" /> Unggah & Simpan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
