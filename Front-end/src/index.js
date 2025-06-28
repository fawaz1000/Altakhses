import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // استيراد ملف Tailwind CSS

document.body.setAttribute('dir', 'rtl'); // لضبط الاتجاه من اليمين لليسار

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
