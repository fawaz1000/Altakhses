import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { API_BASE, HERO_CATEGORY, HERO_SLIDE_INTERVAL } from '../../config';

const getSrc = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Slide = ({ slide, active }) => {
  if (!slide?.url) return null;

  return (
    <div
      id="hero"
      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
        active ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-110'
      }`}
    >
      <div className="w-full h-screen relative flex items-center justify-center overflow-hidden">
        {/* خلفية الصورة */}
        <div className="absolute inset-0">
          <img
            src={getSrc(slide.url)}
            alt={slide.title || ''}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#062b2d]/80 via-[#062b2d]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#028B7B]/60 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#48D690]/20 via-transparent to-[#28a49c]/30 z-10" />
        </div>

        {/* عناصر ديكورية */}
        <div className="absolute inset-0 z-15">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#48D690]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#28a49c]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#48D690] rounded-full animate-ping delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-1500"></div>
        </div>

        {(slide.title || slide.description) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className="text-white max-w-5xl text-center space-y-6 transform">
              {slide.title && (
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
                    <span className="bg-gradient-to-r from-[#48D690] via-white to-[#28a49c] bg-clip-text text-transparent drop-shadow-2xl animate-gradient">
                      {slide.title}
                    </span>
                  </h1>
                  <div className="flex justify-center items-center gap-4">
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#48D690] rounded-full animate-pulse"></div>
                    <div className="w-8 h-8 border-2 border-[#48D690] rounded-full flex items-center justify-center animate-spin-slow">
                      <div className="w-4 h-4 bg-[#48D690] rounded-full"></div>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#28a49c] rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
              {slide.description && (
                <p className="text-xl md:text-2xl lg:text-3xl text-white/95 font-light leading-relaxed max-w-3xl mx-auto drop-shadow-lg animate-fade-in-up">
                  {slide.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-5">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_BASE}/api/media`, {
        params: { category: HERO_CATEGORY },
      })
      .then((res) => {
        if (isMounted) {
          setSlides(res.data || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSlides([]);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const startAuto = useCallback(() => {
    if (!isPlaying) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % (slides.length || 1));
    }, HERO_SLIDE_INTERVAL);
  }, [slides, isPlaying]);

  useEffect(() => {
    clearInterval(timer.current);
    if (slides.length && isPlaying) {
      startAuto();
    }
    return () => clearInterval(timer.current);
  }, [slides, startAuto, isPlaying]);

  const pauseAuto = () => {
    setIsPlaying(false);
    clearInterval(timer.current);
  };

  const resumeAuto = () => {
    setIsPlaying(true);
    startAuto();
  };

  const prev = () => {
    if (!slides.length) return;
    setIdx((i) => (i - 1 + slides.length) % slides.length);
    if (isPlaying) startAuto();
  };

  const next = () => {
    if (!slides.length) return;
    setIdx((i) => (i + 1) % slides.length);
    if (isPlaying) startAuto();
  };

  if (!slides.length) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#062b2d] to-[#023B37]">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
              <span className="text-white text-3xl font-black">A</span>
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-[#48D690]/30 rounded-3xl animate-ping"></div>
          </div>
          <div className="w-16 h-16 border-4 border-[#48D690] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-light">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="hero"
      tabIndex={0}
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
      className="relative w-full h-screen overflow-hidden outline-none"
    >
      {slides.map((s, i) => (
        <Slide key={`${i}-${s.url}`} slide={s} active={i === idx} />
      ))}

      {/* شريط التقدم */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-gradient-to-r from-[#48D690] to-[#28a49c] transition-all duration-300"
          style={{ 
            width: `${((idx + 1) / slides.length) * 100}%`,
            animation: isPlaying ? 'progress 5s linear infinite' : 'none'
          }}
        />
      </div>

      {/* نقاط التنقل */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIdx(i);
              if (isPlaying) startAuto();
            }}
            className={`group relative transition-all duration-500 ${
              i === idx ? 'w-16 h-4' : 'w-4 h-4 hover:w-6'
            }`}
            aria-label={`الشريحة ${i + 1}`}
          >
            <div className={`w-full h-full rounded-full transition-all duration-500 ${
              i === idx
                ? 'bg-gradient-to-r from-[#48D690] to-[#28a49c] shadow-lg'
                : 'bg-white/50 group-hover:bg-white/80'
            }`} />
            {i === idx && (
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* الأسهم */}
      <div className="absolute top-1/2 left-6 right-6 flex justify-between items-center z-30 pointer-events-none">
        <button
          onClick={prev}
          className="group w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-2xl shadow-2xl hover:bg-[#48D690]/90 hover:scale-110 transition-all duration-300 flex items-center justify-center pointer-events-auto border border-white/20"
          aria-label="السابق"
        >
          <FaChevronLeft size={20} className="group-hover:scale-125 transition-transform duration-300" />
        </button>
        <button
          onClick={next}
          className="group w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-2xl shadow-2xl hover:bg-[#48D690]/90 hover:scale-110 transition-all duration-300 flex items-center justify-center pointer-events-auto border border-white/20"
          aria-label="التالي"
        >
          <FaChevronRight size={20} className="group-hover:scale-125 transition-transform duration-300" />
        </button>
      </div>

      {/* رقم الشريحة */}
      <div className="absolute bottom-20 left-8 z-30 text-white/80 text-sm">
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <span className="font-medium">{idx + 1}</span> من <span className="font-medium">{slides.length}</span>
        </div>
      </div>

      {/* أنماط خاصة */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes animate-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}