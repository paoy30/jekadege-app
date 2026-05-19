'use client';

import { Instagram, MapPin, MessageCircle, Music2, ShoppingCart, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import React from 'react';

// Pemetaan dari nama ikon di DB ke komponen ikon Lucide
const iconMap = {
  Whatsapp: MessageCircle,
  Instagram: Instagram,
  Shopee: ShoppingCart,
  Tiktok: Music2,
  Alamat: MapPin,
  Default: LinkIcon, // Ikon default jika tidak ditemukan
};

// Tipe untuk data link dan profil
type LinkData = {
  id: string;
  title: string;
  url: string;
  icon: string;
};

type ProfileData = {
  name: string;
  title: string;
  avatarUrl: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function LinkPill({ label, href, iconName }: { label: string; href: string; iconName: string }) {
  const Icon = iconMap[iconName as keyof typeof iconMap] || iconMap.Default;
  return (
    <motion.a
      href={href}
      className="border-gray-300 border w-full rounded-md bg-white text-black px-6 py-4 shadow-md text-sm font-medium flex items-center justify-center gap-3"
      variants={pillVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </motion.a>
  );
}

export default function LinkPageView({ links, profile }: { links: LinkData[]; profile: ProfileData }) {
  return (
    <main className="min-h-screen flex items-stretch justify-center bg-white">
      <section className="relative w-full md:max-w-sm min-h-screen overflow-hidden" style={{ backgroundImage: "url('/img/bg-link2.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} aria-label="Profile background">
        <div className="flex min-h-screen flex-col items-center px-5 pb-3 pt-10 gap-6">
          <div className="h-28 w-28 rounded-full bg-white text-black border border-gray-300 shadow flex items-center justify-center text-2xl font-semibold">
            <Image width={500} height={500} src={profile.avatarUrl} alt="Logo" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white">{profile.name}</h1>
            <p className="text-sm text-white">{profile.title}</p>
          </div>
          <motion.div className="w-full flex flex-col items-stretch gap-4" variants={containerVariants} initial="hidden" animate="visible">
            {links.map((link) => (
              <LinkPill key={link.id} label={link.title} href={link.url} icon={link.icon} />
            ))}
          </motion.div>
          <div className="flex-1" />
          <footer className="w-full flex flex-col items-center gap-2">
            <span className="text-center font-semibold text-2xl text-white">Jekadege Store</span>
            <div className="text-white/95 text-sm ">{`Copyright © ${new Date().getFullYear()} `}</div>
          </footer>
        </div>
      </section>
    </main>
  );
}
