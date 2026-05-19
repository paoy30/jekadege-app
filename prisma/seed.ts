import { PrismaClient, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { format, subDays, addDays } from 'date-fns';

const prisma = new PrismaClient();

function generateInvoiceId(): string {
  const date = new Date();
  const datePart = format(date, 'yyyyMMdd');
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `INV-${datePart}${randomPart}`;
}

async function main() {
  console.log('Start seeding ...');

  // 1. Hapus data lama (Urutan penting untuk menghindari error Foreign Key)
  await prisma.invoiceHistory.deleteMany(); // Hapus history dulu
  await prisma.link.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.post.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.gallerySection.deleteMany();
  await prisma.user.deleteMany();
  console.log('Old data deleted.');

  // 2. Buat User Admin
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@localhost.com',
        name: 'Admin Jekadege',
        password: hashedPassword,
      },
    }),
  ]);
  console.log(`Created ${users.length} users.`);
  const adminId = users[0].id;

  // 3. Data Dummy Invoice
  const invoicesData = [
    {
      header: {
        title: 'Kaos Reuni SMA 1 Angkatan 2010',
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        customerAddress: 'Jl. Merdeka No. 1, Wonosobo',
        orderType: 'Sablon Plastisol',
        status: 'SELESAI' as InvoiceStatus,
        amountPaid: 3300000, // Lunas
        userId: adminId,
        notes: 'Lengan panjang 5 pcs.',
        estimatedFinishedAt: subDays(new Date(), 2), // Selesai 2 hari lalu
        paymentProof: '/uploads/dummy-proof-1.jpg', // Simulasi gambar
        createdAt: subDays(new Date(), 7), // Dibuat 7 hari lalu
      },
      items: [
        { description: 'Kaos Lengan Pendek Cotton Combed 30s (Ukuran L)', quantity: 30, unitPrice: 75000 },
        { description: 'Kaos Lengan Panjang Cotton Combed 30s (Ukuran L)', quantity: 10, unitPrice: 85000 },
        { description: 'Tambahan Sablon Belakang', quantity: 40, unitPrice: 5000 },
      ],
    },
    {
      header: {
        title: 'Hoodie Komunitas Motor "Riders Sejati"',
        customerName: 'Siti Aminah',
        customerPhone: '089876543210',
        customerAddress: 'Jl. Pahlawan No. 42, Temanggung',
        orderType: 'Bordir Komputer',
        status: 'DIPROSES' as InvoiceStatus,
        amountPaid: 1000000, // Belum lunas (DP)
        userId: adminId,
        notes: 'Ukuran XXL tambah 10rb per pcs.',
        estimatedFinishedAt: addDays(new Date(), 3), // Target selesai 3 hari lagi
        paymentProof: '/uploads/dummy-proof-2.jpg',
        createdAt: subDays(new Date(), 2), // Dibuat 2 hari lalu
      },
      items: [
        { description: 'Hoodie Jumper Fleece CVC (Ukuran M)', quantity: 15, unitPrice: 150000 },
        { description: 'Hoodie Jumper Fleece CVC (Ukuran XL)', quantity: 20, unitPrice: 150000 },
      ],
    },
    {
      header: {
        title: 'Jaket Bomber Angkatan 2023',
        customerName: 'Agus Setiawan',
        customerPhone: '085678901234',
        customerAddress: 'Jl. Gatot Subroto No. 5, Magelang',
        orderType: 'Bordir',
        status: 'DALAM_ANTRIAN' as InvoiceStatus,
        amountPaid: 0, // Belum bayar
        userId: adminId,
        notes: null,
        estimatedFinishedAt: null, // Belum ada estimasi
        paymentProof: null,
        createdAt: new Date(), // Baru dibuat hari ini
      },
      items: [{ description: 'Jaket Bomber Taslan (Ukuran L)', quantity: 25, unitPrice: 180000 }],
    },
  ];

  // 4. Proses Insert Data
  for (const invData of invoicesData) {
    const totalPrice = invData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const newInvoiceId = generateInvoiceId();

    // Biar ID-nya beda sedikit kalau loopnya cepat
    await new Promise((resolve) => setTimeout(resolve, 10));

    // A. Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        id: newInvoiceId,
        title: invData.header.title,
        customerName: invData.header.customerName,
        customerPhone: invData.header.customerPhone,
        customerAddress: invData.header.customerAddress,
        orderType: invData.header.orderType,
        status: invData.header.status,
        amountPaid: invData.header.amountPaid,
        userId: invData.header.userId,
        notes: invData.header.notes,
        totalPrice: totalPrice,
        estimatedFinishedAt: invData.header.estimatedFinishedAt,
        paymentProof: invData.header.paymentProof,
        createdAt: invData.header.createdAt, // Override created at biar timeline mundur
        items: {
          create: invData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    // B. Generate History Berdasarkan Status
    // Kita buat simulasi history mundur ke belakang

    // 1. History Awal (Selalu ada) - status DALAM_ANTRIAN
    await prisma.invoiceHistory.create({
      data: {
        invoiceId: invoice.id,
        status: 'DALAM_ANTRIAN',
        note: 'Pesanan baru dibuat',
        createdAt: invData.header.createdAt,
      },
    });

    // 2. Jika status DIPROSES atau SELESAI, tambahkan history DIPROSES
    if (['DIPROSES', 'SELESAI', 'DIANTAR'].includes(invData.header.status)) {
      await prisma.invoiceHistory.create({
        data: {
          invoiceId: invoice.id,
          status: 'DIPROSES',
          note: 'Pembayaran diterima (DP), pesanan mulai dikerjakan',
          createdAt: addDays(invData.header.createdAt, 1), // 1 hari setelah dibuat
        },
      });
    }

    // 3. Jika status SELESAI
    if (invData.header.status === 'SELESAI') {
      await prisma.invoiceHistory.create({
        data: {
          invoiceId: invoice.id,
          status: 'SELESAI',
          note: 'Barang selesai diproduksi dan siap diambil',
          createdAt: addDays(invData.header.createdAt, 5), // 5 hari setelah dibuat
        },
      });
    }
  }

  console.log(`Created ${invoicesData.length} invoices with items and history.`);
  console.log('Seeding completed.');
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
