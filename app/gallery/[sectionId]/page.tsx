import prisma from '@/lib/prisma';
import { GalleryCard } from '@/components/ui/gallery-card';
import type { Metadata } from 'next';

// ... (kode generateMetadata tetap sama) ...

export async function generateMetadata({ params }: { params: { sectionId: string } }): Promise<Metadata> {
  const section = await prisma.gallerySection.findUnique({
    where: { id: params.sectionId },
  });

  if (!section) {
    return {
      title: 'Galeri Tidak Ditemukan',
      description: 'Seksi galeri yang Anda cari tidak ada.',
    };
  }

  return {
    title: `Galeri: ${section.title}`,
    description: section.description || `Koleksi gambar untuk ${section.title}.`,
  };
}

export default async function GalleryDetailPage({ params }: { params: { sectionId: string } }) {
  const section = await prisma.gallerySection.findUnique({
    where: {
      id: params.sectionId,
    },
    include: {
      images: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!section) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-10 sm:py-5 text-center">
        <h1 className="text-3xl font-semibold">Galeri Tidak Ditemukan</h1>
        <p className="text-muted-foreground mt-2">Seksi galeri yang Anda cari tidak ada.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 sm:py-5">
      <header className="mb-10 text-center sm:mb-12">
        <p className="mb-2 text-base text-muted-foreground uppercase">{section.category}</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{section.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">{section.description}</p>
      </header>

      <section aria-label="Galeri gambar">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.images.map((img) => (
            <GalleryCard
              key={img.id}
              src={img.imageUrl}
              alt={img.altText || section.title}
              // PERUBAHAN DI SINI:
              // Kirim data priceEstimate, konversi Decimal ke number jika ada nilainya
              price={img.priceEstimate ? Number(img.priceEstimate) : undefined}
            />
          ))}
        </div>

        {section.images.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Belum ada gambar di galeri ini.</p>
          </div>
        )}
      </section>
    </main>
  );
}
