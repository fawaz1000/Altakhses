import React from 'react';
import { FaHome, FaUserMd, FaPhotoVideo } from 'react-icons/fa';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-[#023b37] font-[Tajawal]">
      {/* الشريط الجانبي */}
      <aside className="w-64 fixed right-0 top-0 h-screen bg-white shadow-md border-l border-gray-200 z-30 flex flex-col">
        <div className="p-5 text-xl font-bold border-b border-gray-200 text-center bg-white">
          لوحة التحكم
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <SidebarItem href="#hero" icon={<FaHome size={18} />} label="الرئيسية" />
          <SidebarItem href="#doctors" icon={<FaUserMd size={18} />} label="الأطباء" />
          <SidebarItem href="#media" icon={<FaPhotoVideo size={18} />} label="الوسائط" />
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 mr-64 p-6 pt-8">
        {children}
      </main>
    </div>
  );
};

const SidebarItem = ({ href, icon, label }) => (
  <a
    href={href}
    className="flex items-center gap-3 p-3 rounded-md text-sm font-medium hover:bg-[#f3f7f6] transition-colors duration-200"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </a>
);

export default Layout;
