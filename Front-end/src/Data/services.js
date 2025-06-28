import public1 from '../Assets/doctorS.jpg';
import hart from '../Assets/hartS.jpg';
import dentist from '../Assets/dentistS.jpg';
import analyiz from '../Assets/medicalS.jpg';
import nautral from '../Assets/naturalS.jpg';
import air from '../Assets/airS.jpg';

export const services =[
    {
        id: 1,
        img: public1,
        title: 'قسم الطب العام',
        description: 'خدمات طب عام شاملة.',
        link: '/general'
    },
    {
        id: 2,
        img: hart,
        title: 'قسم الباطنية والقلب',
        description: 'رعاية تخصصية لأمراض القلب.',
        link: '/internist'
    },
    {
        id: 3,
        img: dentist,
        title: 'طب وجراحة الأسنان',
        description: 'خدمات تجميلية وعلاجية للأسنان.',
        link: '/dentist' // ✅ توجيه للصفحة المستقلة
    },
    {
        id: 4,
        img: analyiz,
        title: 'مختبرات التحاليل الطبية',
        description: 'تحاليل دقيقة بأحدث الأجهزة.',
        link: '/#services'
    },
    {
        id: 5,
        img: nautral,
        title: 'العلاج الطبيعي',
        description: 'جلسات مخصصة للعلاج الطبيعي.',
        link: '/physical'
    },
    {
        id: 6,
        img: air,
        title: 'قسم الأنف و الآذن و الحنجرة',
        description: 'أطباء متخصصون في العناية المركزة.',
        link: '/ent'
    },
    {
        id: 7,
        img: air,
        title: 'الجلدية',
        description: 'أطباء متخصصون في العناية المركزة.',
        link: '/ent'
    },
    {
        id: 8,
        img: air,
        title: 'النساء و الولادة',
        description: 'أطباء متخصصون في العناية المركزة.',
        link: '/ent'
    },
];
