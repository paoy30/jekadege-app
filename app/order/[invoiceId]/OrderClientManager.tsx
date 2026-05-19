'use client';

import * as React from 'react';
import { CustomerForm } from './CustomerForm';
import { InvoiceView } from './InvoiceView';
import type { SerializableInvoice } from '@/app/admin/invoices/components/columns';

export function OrderClientManager({ initialInvoice }: { initialInvoice: SerializableInvoice }) {
  const [invoice, setInvoice] = React.useState(initialInvoice);
  const [isEditing, setIsEditing] = React.useState(false);

  // Cek apakah data customer sudah terisi
  const isCustomerDataFilled = !!invoice.customerName && !!invoice.customerAddress;

  // Fungsi yang akan dipanggil dari CustomerForm setelah berhasil update
  const handleFormSuccess = (updatedData: Partial<SerializableInvoice>) => {
    // Optimistic UI update: langsung perbarui state tanpa menunggu refresh
    setInvoice((prev) => ({ ...prev, ...updatedData }));
    setIsEditing(false);
  };

  // Tentukan komponen apa yang akan ditampilkan
  if (isEditing || !isCustomerDataFilled) {
    return <CustomerForm invoice={invoice} onFormSuccess={handleFormSuccess} />;
  } else {
    return <InvoiceView invoice={invoice} onEditRequest={() => setIsEditing(true)} />;
  }
}
