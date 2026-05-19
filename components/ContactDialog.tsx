// components/ContactDialog.tsx
'use client';

import { useState, FormEvent } from 'react';
import './ContactDialog.css';

interface ContactDialogProps {
  whatsappNumber: string;
  buttonText?: string;
  buttonClass?: string;
}

export default function ContactDialog({ whatsappNumber, buttonText = 'Hubungi Kami', buttonClass = '' }: ContactDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    message: '',
    phone: '',
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      message: '',
      phone: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Pesan minimal 10 karakter';
    }

     if (!formData.phone.trim()) {
       newErrors.phone = 'Nomor wajib diisi';
     } else if (formData.phone && !/^[0-9+\-\s()]*$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.message && !newErrors.phone;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim pesan');
      }

      // Format pesan untuk WhatsApp
      const whatsappMessage = `Nama: ${formData.name}\nIsi Pesan: ${formData.message}`;
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // Tutup dialog
      setIsOpen(false);

      // Reset form
      setFormData({ name: '', message: '', phone: '' });
      setErrors({ name: '', message: '', phone: '' });

      // Tampilkan toast
      showToast('Pesan tersimpan! Anda akan diarahkan ke WhatsApp...', 'success');

      // Redirect ke WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      showToast('Gagal mengirim pesan. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error saat user mulai mengetik
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      {/* Button Trigger */}
      <button onClick={() => setIsOpen(true)} className={`btn-p ${buttonClass}`}>
        {buttonText}
      </button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div className="dialog-overlay">
          {/* Backdrop */}
          <div className="dialog-backdrop" onClick={() => setIsOpen(false)} />

          {/* Dialog */}
          <div className="dialog-container">
            <div className="dialog-content">
              {/* Close Button */}
              <button onClick={() => setIsOpen(false)} className="dialog-close" aria-label="Close">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="dialog-header">
                <h3 className="dialog-title">Hubungi Kami</h3>
                <p className="dialog-description">Isi form di bawah ini dan kami akan menghubungi Anda melalui WhatsApp</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="dialog-form">
                {/* Nama */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Nama <span className="required">*</span>
                  </label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Masukkan nama Anda" disabled={isSubmitting} className={`form-input ${errors.name ? 'error' : ''}`} />
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>

                {/* Nomor Telepon */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Nomor Telepon <span className="required">*</span>
                  </label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Contoh: 081234567890" disabled={isSubmitting} className={`form-input ${errors.phone ? 'error' : ''}`} />
                  {errors.phone && <p className="error-message">{errors.phone}</p>}
                </div>

                {/* Pesan */}
                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Isi Pesan <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tuliskan pesan Anda di sini..."
                    disabled={isSubmitting}
                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                  />
                  {errors.message && <p className="error-message">{errors.message}</p>}
                </div>

                {/* Buttons */}
                <div className="form-actions">
                  <button type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="btn btn-secondary">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Kirim ke WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className="toast-message">{toast.message}</p>
        </div>
      )}
    </>
  );
}
