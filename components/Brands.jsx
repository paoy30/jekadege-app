'use client'; // <-- Biarkan ini di sini, karena komponen ini untuk tampilan

import React from 'react';
import Link from 'next/link';
import { SecondaryBtn } from './Btn';
import './Brands.scss';

// Beri nilai default '[]' untuk mencegah error 'map' of undefined
const Brands = ({ sections = [] }) => {
  return (
    <div className="brands">
      <div className="main-text">
        <h2>Custom Pembuatan</h2>
      </div>
      <div className="container">
        {/* Sekarang ini akan me-render data dari prop */}
        {sections.map((elem) => (
          <a href={`/gallery/${elem.id}`} key={elem.id}>
            <div
              className="item"
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.714)), url(${elem.coverImage})`,
              }}
            >
              <div className="lower-text">
                <div className="lower-text-btns">
                  <div>
                    <h1>{elem.title}</h1>
                    <SecondaryBtn text={`Lihat koleksi`} classText={'btn-s-45'} />
                  </div>
                  <span className="brandTag">{elem.category}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Brands;
