'use client';
import './hero.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

type Slide = {
  src: string;
  alt: string;
};

const slides: Slide[] = [
  { src: '/img/hero1.jpg', alt: 'Hero slide 1' },
  { src: '/img/hero2.jpg', alt: 'Hero slide 2' },
];

const Hero = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      console.log('[v0] Hero container height:', containerRef.current.clientHeight);
    }
  }, []);

  return (
    <section className="hero">
      <div className="container" ref={containerRef}>
        <div className="hero-slider">
          <Swiper  className="hero-swiper" modules={[Autoplay, Pagination]} autoplay={{ delay: 3500, disableOnInteraction: false }}  loop pagination={{ clickable: true }} navigation>
            {slides.map((s, i) => (
              <SwiperSlide key={i}>
                <Image width={1000} height={1000} className="hero-slide-image" src={s.src || '/placeholder.svg'} alt={s.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Hero;
