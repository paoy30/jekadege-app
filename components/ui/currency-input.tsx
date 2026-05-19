'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

// Define InputProps based on the props accepted by Input if not exported
import type { InputHTMLAttributes } from 'react';
type InputProps = InputHTMLAttributes<HTMLInputElement>;

export interface CurrencyInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(({ value, onValueChange, ...props }, ref) => {
  // State untuk menyimpan nilai yang diformat (string)
  const [displayValue, setDisplayValue] = React.useState<string>('');

  // Fungsi untuk memformat angka menjadi string Rupiah
  const format = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Sinkronkan displayValue saat 'value' dari form berubah
  React.useEffect(() => {
    setDisplayValue(format(value));
  }, [value]);

  // Fungsi untuk mengubah string input menjadi angka
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = event.target.value;
    // Hapus semua karakter non-digit (Rp, titik, spasi)
    const numericValue = parseInt(stringValue.replace(/[^0-9]/g, ''), 10);

    if (isNaN(numericValue)) {
      setDisplayValue('');
      if (onValueChange) onValueChange(undefined);
    } else {
      setDisplayValue(format(numericValue));
      if (onValueChange) onValueChange(numericValue);
    }
  };

  return <Input ref={ref} value={displayValue} onChange={handleOnChange} {...props} />;
});
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
