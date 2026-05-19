// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message, phone } = body;

    // Validasi input
    if (!name || !message) {
      return NextResponse.json({ error: 'Nama dan pesan wajib diisi' }, { status: 400 });
    }

    // Simpan ke database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        message: message.trim(),
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: contactMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menyimpan pesan' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengambil data' }, { status: 500 });
  }
}
