'use client';

import React, { useState } from 'react';
import './Header.scss';
import { PrimaryBtn } from './Btn';
import { redirect, useRouter } from 'next/navigation';
import ContactDialog from './ContactDialog';

const Header = () => {
  // State for mobile menu toggle
  const [isMenuOpen, setMenuOpen] = useState(false);

  // State to hold the value from the search input
  const [invoiceId, setInvoiceId] = useState('');

  // Initialize the router for navigation
  const router = useRouter();

  // Function to handle the form submission for the search
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent the page from reloading
    if (invoiceId.trim()) {
      // Check if the input is not empty
      redirect(`${process.env.NEXT_PUBLIC_URL}/order/${invoiceId.trim()}`); // Navigate to the order page
      setInvoiceId(''); // Optional: clear the input after searching
    }
  };

  return (
    <header className="header">
      <div className="container">
        {/* Logo Section */}
        <div className="header__logo">
          <img src="/img/logo.png" alt="Jekadege Logo" />
          <h1 className="logo-text">Jekadege</h1>
        </div>

        {/* Right Group: Becomes active on mobile when menu is open */}
        <div className={isMenuOpen ? 'header__right active' : 'header__right'}>
          {/* Invoice Search Form */}
          <form className="header__search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Cari invoice..."
              aria-label="Cari Invoice"
              value={invoiceId} // Bind the input value to the state
              onChange={(e) => setInvoiceId(e.target.value)} // Update the state as the user types
            />
            <button type="submit" className="search-btn" aria-label="Cari">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* Contact Button */}
          {/* <PrimaryBtn text="Hubungi Kami" /> */}
          <ContactDialog whatsappNumber={process.env.NEXT_PUBLIC_WA} buttonText="Hubungi Kami" buttonVariant="outline" />
        </div>

        {/* Hamburger Button: Only visible on mobile */}
        <div className={isMenuOpen ? 'hamburger active' : 'hamburger'} onClick={() => setMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
