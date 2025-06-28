import React from 'react';
import { entServices } from '../../Data/ENT/services';

export default function DentistPage() {
  return (
    <section id="dentist" className="bg-white pt-28 pb-20 px-6 rtl scroll-mt-32">
      {/* العنوان */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-primary">طب وجراحة الأسنان</h2>
        <div className="mt-4 mx-auto h-1 w-32 bg-accent rounded-full" />
        <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
          خدمات متكاملة لرعاية الفم والأسنان، نقدمها بأحدث التقنيات وعلى يد نخبة من الأطباء المتخصصين.
        </p>
      </div>

      {/* بطاقات الخدمات */}
      <div className="max-w-7xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {entServices.map(({ id, service, desc }) => (
          <div
            key={id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 p-6 group hover:-translate-y-1"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4 relative">
              <span className="absolute -left-4 top-1 w-1 h-5 bg-accent rounded" />
              {service}
            </h3>

            <ul className="space-y-3 text-gray-600 text-[0.95rem] leading-relaxed">
              {desc.split('\n').map((line, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="mt-1 text-accent">•</span>
                  <span>{line.replace(/^•\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}