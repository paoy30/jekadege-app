import './globals.scss';
import CompanyLogos from '../components/CompanyLogos';
import Header from '../components/Header';
import Service from '../components/Service';
import About from '../components/About';
import Brands from '../components/Brands';
import Contact from '../components/Contact';
import prisma from '@/lib/prisma'; // Impor prisma aman di sini
import Hero from '@/components/Hero';

// Ubah menjadi 'async function'
export default async function Home() {
  // Ambil data di server
  const sections = await prisma.gallerySection.findMany({
    take: 4,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <Header />
      <Hero />
      <CompanyLogos />
      <Service />
      <About />
      {/* Oper data 'sections' yang sudah jadi sebagai prop */}
      <Brands sections={sections as any} />
      <Contact />
    </div>
  );
}
