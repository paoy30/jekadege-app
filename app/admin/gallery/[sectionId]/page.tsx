import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteGalleryImage } from '@/app/actions/galleryActions';
import { Trash2 } from 'lucide-react';
import { AddImageForm } from './components/add-image-form'; // Pastikan path import ini benar sesuai struktur folder Anda
import CopyUrl from '../../links/components/copy-url'; // Pastikan path import ini benar

// Helper untuk format rupiah
const formatRupiah = (number: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(number));
};

// Komponen Tombol Hapus (Server Component dengan Server Action)
async function DeleteImageButton({ imageId, sectionId }: { imageId: string; sectionId: string }) {
  const deleteAction = async () => {
    'use server';
    await deleteGalleryImage(imageId, sectionId);
  };
  return (
    <form action={deleteAction}>
      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default async function GalleryDetailPage({ params }: { params: { sectionId: string } }) {
  const section = await prisma.gallerySection.findUnique({
    where: { id: params?.sectionId },
    include: {
      images: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!section) {
    return (
      <main className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold mb-4">Galeri Tidak Ditemukan</h1>
        <Link href="/admin/gallery">
          <Button variant="outline">Kembali ke Galeri</Button>
        </Link>
      </main>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Link href="/admin/gallery">
        <Button variant="outline"> Kembali ke Galeri</Button>
      </Link>

      <Card className="md:w-96 p-5">
        <CopyUrl url={`${process.env.NEXT_PUBLIC_URL}/gallery/${section.id}`} label="Lihat halaman:" />
      </Card>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
        <p className="text-muted-foreground">{section.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Daftar Gambar */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Gambar ({section.images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {section.images.length === 0 ? (
                <p className="text-muted-foreground">Belum ada gambar di seksi ini.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.images.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-md overflow-hidden group border bg-muted">
                      <Image src={image.imageUrl} alt={image.altText || section.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />

                      {/* LABEL HARGA DI ADMIN */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1.5 backdrop-blur-[2px]">
                        <p className="text-xs text-center font-medium text-white truncate">{image.priceEstimate && Number(image.priceEstimate) > 0 ? formatRupiah(image.priceEstimate) : 'Tanpa Harga'}</p>
                      </div>

                      <DeleteImageButton imageId={image.id} sectionId={section.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Tambah Gambar */}
        <div>
          <AddImageForm sectionId={section.id} />
        </div>
      </div>
    </div>
  );
}
