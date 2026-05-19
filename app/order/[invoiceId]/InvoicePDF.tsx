'use client';

import { Page, Text, View, Document, StyleSheet, Image as PdfImage, Image } from '@react-pdf/renderer';
import type { SerializableInvoice } from '@/app/admin/invoices/components/columns';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatDate = (date: Date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

// ===================================================================
// ## PENTING: Ganti placeholder di bawah dengan string Base64 logo Anda ##
// ===================================================================

// Stylesheet untuk PDF
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, borderBottom: '1px solid #1f2937', paddingBottom: 0 },
  companyName: { fontSize: 24, fontWeight: 'bold' },
  logo: { width: 50, height: 50, marginBottom: 5 },
  headerRight: { textAlign: 'right' },
  invoiceTitle: { fontSize: 22, fontWeight: 'bold', color: '#555' },
  invoiceId: { fontSize: 11, color: '#666' },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  customerInfoContainer: { width: '50%' },
  dateInfoContainer: { width: '40%' },
  metaHeader: { fontSize: 10, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  metaContentBold: { fontSize: 10, fontWeight: 'bold' },
  metaContent: { fontSize: 10, color: '#444', marginBottom: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  metaLabel: { fontWeight: 'bold' },
  table: { border: '1px solid #e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1f2937', borderBottom: '1px solid #e5e7eb' },
  tableHeaderCell: { padding: '8px 10px', fontWeight: 'bold', fontSize: 9, color: 'white' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb' },
  tableRowAlt: { flexDirection: 'row', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  tableCell: { padding: '8px 10px' },
  totalsContainer: { alignSelf: 'flex-end', width: '40%', marginTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { color: '#6b7280' },
  totalValue: { color: '#1f2937' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '2px solid #333' },
  grandTotalLabel: { fontWeight: 'bold', fontSize: 12 },
  grandTotalValue: { fontWeight: 'bold', fontSize: 12 },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 10 },
  notesContainer: { width: '75%' },
  notesHeader: { fontWeight: 'bold', fontSize: 9, marginBottom: 3 },
  notesText: { fontSize: 9, color: '#6b7280' },
  qrCodeContainer: { textAlign: 'center' },
  qrCode: { width: 60, height: 60 },
  qrCodeText: { fontSize: 8, color: '#888', marginTop: 4 },
});

// --- Komponen Template PDF ---
export const InvoiceDocument = ({ invoice, qrCodeDataURL }: { invoice: SerializableInvoice; qrCodeDataURL: string }) => (
  <Document title={`Invoice-${invoice.id}`} author="Jekadege Store">
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.headerContainer} fixed>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image style={{ width: 70, marginLeft: 7 }} src={'/img/logo.png'} />
          <Text style={styles.companyName}>Jekadege</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceId}># {invoice.id}</Text>
        </View>
      </View>

      {/* INFORMASI PELANGGAN & TANGGAL */}
      <View style={styles.metaContainer}>
        <View style={styles.customerInfoContainer}>
          <Text style={styles.metaHeader}>Ditagihkan Kepada:</Text>
          <Text style={styles.metaContentBold}>{invoice.customerName}</Text>
          <Text style={styles.metaContent}>{invoice.customerAddress}</Text>
          <Text style={styles.metaContent}>{invoice.customerPhone}</Text>
        </View>
        <View style={styles.dateInfoContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Tanggal:</Text>
            <Text style={styles.metaContent}>{formatDate(new Date(invoice.createdAt))}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Admin:</Text>
            <Text style={styles.metaContent}>{invoice.createdBy?.name || 'Admin'}</Text>
          </View>
        </View>
      </View>

      {/* TABEL ITEM */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '45%' }]}>DESKRIPSI</Text>
          <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'center' }]}>KUANTITAS</Text>
          <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>HARGA SATUAN</Text>
          <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>JUMLAH</Text>
        </View>
        {invoice.items.map((item, index) => (
          <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tableCell, { width: '45%' }]}>{item.description}</Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'center' }]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      {/* TOTALS */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.totalPrice)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Sudah Dibayar</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.amountPaid)}</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>SISA BAYAR</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(invoice.totalPrice - invoice.amountPaid)}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer} fixed>
        <View style={styles.notesContainer}>
          <Text style={styles.notesHeader}>Catatan:</Text>
          <Text style={styles.notesText}>{invoice.notes || 'Tidak ada catatan tambahan.'}</Text>
        </View>
        <View style={styles.qrCodeContainer}>
          {qrCodeDataURL && <PdfImage src={qrCodeDataURL} style={styles.qrCode} />}
          <Text style={styles.qrCodeText}>Scan untuk cek status pesanan</Text>
        </View>
      </View>
    </Page>
  </Document>
);
