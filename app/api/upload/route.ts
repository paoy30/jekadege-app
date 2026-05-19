import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'Tidak ada file ditemukan.' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Buat nama file unik dan simpan di public/uploads
  const fileName = `${Date.now()}-${file.name.replace(/ /g, '_')}`;
  const path = join(process.cwd(), 'public/uploads', fileName);

  try {
    await writeFile(path, buffer);
    console.log(`File tersimpan di: ${path}`);

    // Kembalikan path publik dari file yang baru saja di-upload
    const publicPath = `/uploads/${fileName}`;
    return NextResponse.json({ success: true, path: publicPath });
  } catch (error) {
    console.error('Gagal menyimpan file:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan file.' });
  }
}
