import LinkPageView from '@/components/link/LinkPageView';
import prisma from '@/lib/prisma';

export default async function LinkPage() {
  // Ambil semua link, diurutkan berdasarkan tanggal dibuat
  // Anda bisa memfilter berdasarkan userId tertentu jika diperlukan
  const links = await prisma.link.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Data profil, bisa juga diambil dari database user
  const profile = {
    name: 'Jekadege',
    // title: 'Pesan kaos custom keren & unik di sini!',
    title: 'Pesan kaos custom',
    avatarUrl: '/img/logo.png',
  };

  // Kirim data ke komponen view
  return <LinkPageView links={links} profile={profile} />;
}
