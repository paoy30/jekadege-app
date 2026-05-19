import prisma from '@/lib/prisma';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { AddSectionForm } from './components/add-section-form';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);

  // Lindungi halaman: jika tidak ada sesi, redirect ke halaman login
  if (!session?.user?.id) {
    redirect('/admin/login');
  }

  const sections = await prisma.gallerySection.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Gallery Management</h2>
        <AddSectionForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Section
          </Button>
        </AddSectionForm>
      </div>
      <Card className="p-4">
        <DataTable columns={columns} data={sections} />
      </Card>
    </div>
  );
}
