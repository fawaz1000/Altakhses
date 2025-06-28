import React from 'react';
import { Internist } from '../../Data/Internist/doctor';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function internistDoctors() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-white via-emerald-50 to-teal-100 overflow-hidden">
      {/* العنوان */}
      <div className="text-center mb-16 z-10 relative">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          طاقم أطباء الأسنان
        </h2>
        <div className="mt-3 mx-auto h-1 w-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" />
        <p className="mt-4 text-gray-600 text-md sm:text-lg max-w-xl mx-auto leading-relaxed">
          نخبة من أطباء الأسنان بخبرات متميزة لتقديم أفضل رعاية صحية لكم.
        </p>
      </div>

      {/* السلايدر */}
      <div className="max-w-7xl mx-auto relative z-10">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-12"
        >
          {Internist.map(({ id, img, name, specialty, bio }) => (
            <SwiperSlide key={id}>
              <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden transition-transform hover:scale-105 duration-300 border border-gray-100 flex flex-col h-[520px]">
                
                {/* صورة أكبر */}
                <div className="h-72 w-full overflow-hidden">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* المعلومات */}
                <div className="flex flex-col items-center p-6 flex-1 justify-start">
                  <h3 className="text-xl font-semibold text-gray-900 mt-2">{name}</h3>
                  <p className="text-teal-600 font-medium mt-1">{specialty}</p>
                  {bio && (
                    <p className="text-sm text-gray-600 mt-4 leading-snug text-center px-2">
                      {bio}
                    </p>
                  )}
                  <div className="mt-auto pt-4 h-1 w-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
