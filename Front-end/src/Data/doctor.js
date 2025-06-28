import pic1 from '../Assets/doctorD.jpg';
import dentist from '../Assets/dentistD.jpg';
import hart from '../Assets/hartD.jpg';
import natural from '../Assets/naturalD.jpg';
import air from '../Assets/airD.jpg'

export const doctors = [
  {
    id: 1,
    img: dentist,
    name: 'أطباء الأسنان',
    link: '/dentistdoctors',
  },
  {
    id: 2,
    img: hart,
    name: 'أطباء الباطنية',
    link: '/internistdoctors'
  },
  {
    id: 3,
    img: natural,
    name: 'أطباء العلاج الطبيعي',
    link: '/physicaldoctor'
  },
  {
    id: 4,
    img: pic1,
    name: 'طبيب عام',
    link: '/generaldoctor'
  },
  {
    id: 5,
    img: air,
    name: 'أطباء أذن و حنجرة',
    link: 'entdoctor',
  },
  {
    id: 6,
    img: pic1,
    name: 'أطباء جراحة الفكين',
  }
];
