import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { AddLinkForm } from './components/add-link-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { Card } from '@/components/ui/card';
import CopyUrl from './components/copy-url';

export default async function LinksAdminPage() {
  const session = await getServerSession(authOptions);

  // Lindungi halaman: jika tidak ada sesi, redirect ke halaman login
  if (!session?.user?.id) {
    redirect('/admin/login');
  }

  // Ambil data link milik user yang sedang login
  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Linktree Management</h2>
        <AddLinkForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Link
          </Button>
        </AddLinkForm>
      </div>
      <Card className="md:w-96 p-5">
        <CopyUrl url={`${process.env.NEXT_PUBLIC_URL}/link`} label="Linktree URL:" />
      </Card>
      {/* Kita perlu mengimpor 'columns' agar bisa digunakan di sini */}
      <Card className="w-full p-5">
        <DataTable columns={columns} data={links} />
      </Card>
    </div>
  );
}
