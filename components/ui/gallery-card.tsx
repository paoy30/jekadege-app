import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

type GalleryCardProps = {
  src: string;
  alt: string;
  contactHref?: string;
  price?: number | null; // Tambahkan prop opsional untuk harga
};

export function GalleryCard({ src, alt, contactHref = 'mailto:hello@example.com', price }: GalleryCardProps) {
  // Cek apakah ada harga yang valid (lebih dari 0)
  const hasPrice = price && price > 0;

  return (
    <div className="group relative overflow-hidden aspect-square rounded-lg bg-card text-card-foreground ring-1 ring-border">
      <Image src={src || '/placeholder.svg'} alt={alt} width={600} height={600} className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105" priority={false} />

      {/* TAMPILAN HARGA: Badge di pojok kiri bawah (Selalu terlihat) */}
      {hasPrice && (
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="bg-black/70 text-white backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-white/10">Estimasi: {formatRupiah(price)}</div>
        </div>
      )}

      {/* Overlay Hover */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />

      {/* Tombol Aksi saat Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button asChild size="lg" className="pointer-events-auto shadow-xl">
          <Link href={contactHref}>Hubungi sekarang</Link>
        </Button>
      </div>
    </div>
  );
}
