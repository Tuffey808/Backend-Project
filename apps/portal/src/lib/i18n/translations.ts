import { adminAr, adminEn } from './admin-translations';

export type Locale = 'ar' | 'en';

export const LOCALE_KEY = 'gmall_locale';

export const localeMeta: Record<Locale, { dir: 'rtl' | 'ltr'; label: string }> = {
  ar: { dir: 'rtl', label: 'العربية' },
  en: { dir: 'ltr', label: 'English' },
};

const categories = {
  ar: [
    'الموضة والأزياء',
    'الإلكترونيات',
    'السوبرماركت',
    'الصحة والجمال',
    'المنزل والحديقة',
    'الرياضة والترفيه',
    'أخرى',
  ],
  en: [
    'Fashion & Apparel',
    'Electronics',
    'Supermarket',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Entertainment',
    'Other',
  ],
};

const features = {
  ar: [
    { title: 'كل المتاجر في مكان واحد', body: 'تشكيلة ضخمة من العلامات والفئات لتجد ما تريد بسرعة.' },
    { title: 'عروض متجددة', body: 'خصومات وكوبونات يومية مصممة لاحتياجات السوق السعودي.' },
    { title: 'تجربة سلسة', body: 'واجهة عربية سهلة وتصفّح سريع مع بحث ذكي.' },
    { title: 'تتبّع الشحنات', body: 'تحديثات حالة الطلب خطوة بخطوة حتى باب بيتك.' },
    { title: 'توصيل سريع', body: 'شراكات لوجستية لتسليم أسرع داخل المملكة.' },
    { title: 'إرجاع سهل', body: 'سياسة مرتجعات واضحة ودعم متجاوب.' },
    { title: 'دفع آمن', body: 'بوابات موثوقة مع حماية بياناتك.' },
    { title: 'خيارات متعددة', body: 'مدى، بطاقات ائتمانية، والدفع عند الاستلام (حيثما توفر).' },
    { title: 'محفظة وعروض', body: 'نقاط ومكافآت للمستخدمين الدائمين.' },
  ],
  en: [
    { title: 'All stores in one place', body: 'A huge selection of brands and categories to find what you need fast.' },
    { title: 'Daily deals', body: 'Discounts and coupons tailored for the Saudi market.' },
    { title: 'Smooth experience', body: 'Easy Arabic UI, fast browsing, and smart search.' },
    { title: 'Shipment tracking', body: 'Order status updates step by step to your door.' },
    { title: 'Fast delivery', body: 'Logistics partnerships for quicker delivery across KSA.' },
    { title: 'Easy returns', body: 'Clear return policy and responsive support.' },
    { title: 'Secure payments', body: 'Trusted gateways with data protection.' },
    { title: 'Multiple options', body: 'Mada, credit cards, and cash on delivery where available.' },
    { title: 'Wallet & rewards', body: 'Points and rewards for loyal shoppers.' },
  ],
};

export const translations = {
  ar: {
    meta: {
      title: 'G-MALL | تسوّق السعودية في تطبيق واحد',
      description:
        'G-MALL يجمع لك أفضل المتاجر والعلامات في السعودية. تسوّق بسهولة، وادفع بأمان، وتوصيل سريع.',
    },
    nav: {
      about: 'من نحن',
      services: 'الخدمات',
      join: 'انضم كتاجر',
      contact: 'التواصل',
      login: 'دخول',
      home: 'الرئيسية',
    },
    hero: {
      tag: 'تسوّق ذكي • تجار المملكة',
      title1: 'كل ما تحتاجه…',
      title2: 'في تطبيق واحد',
      subtitle:
        'G-MALL يجمع لك أفضل المتاجر والعلامات في السعودية. تسوّق بسهولة، وادفع بأمان، واستمتع بتوصيل سريع وعروض يومية.',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      mockTitle: 'تسوّق بذكاء',
      mockDeals: 'عروض اليوم',
      mockCats: ['أزياء', 'إلكترونيات', 'جمال', 'منزل'],
    },
    about: {
      label: 'من نحن',
      title: 'عن G-MALL',
      body: 'G-MALL تطبيق تسوّق شامل يستهدف المملكة العربية السعودية ويضم أغلب التجّار. نقدّم تجربة سهلة، دفع آمن، وتوصيل سريع مع عروض متجددة يوميًا.',
      cta: 'ابدأ كتاجر شريك',
    },
    services: {
      label: 'الخدمات',
      title: 'لماذا G-MALL؟',
      items: features.ar,
    },
    merchant: {
      label: 'التجار',
      title: 'انضم كتاجر',
      body: 'وسّع نطاق متجرك واصل إلى ملايين المتسوقين في المملكة. سجّل نشاطك التجاري وسيتواصل معك فريق G-MALL لإتمام الانضمام.',
      cta: 'تقديم طلب انضمام',
    },
    download: {
      title: 'حمّل التطبيق',
      body: 'متاح قريباً على App Store و Google Play',
    },
    contact: {
      label: 'تواصل',
      title: 'التواصل معنا',
      email: 'البريد',
      hours: 'ساعات العمل',
      hoursValue: '9 ص — 6 م (الأحد–الخميس)',
    },
    footer: {
      tagline: 'تسوّق السعودية في تطبيق واحد',
      login: 'تسجيل الدخول',
      privacy: 'سياسة الخصوصية',
    },
    privacy: {
      title: 'سياسة الخصوصية',
      updated: 'آخر تحديث: أغسطس 2026',
      sections: [
        {
          h: 'البيانات التي نجمعها',
          p: 'نجمع بيانات الحساب (الاسم، البريد، الجوال)، العناوين، سجل الطلبات، ومعلومات الدفع اللازمة لإتمام الشراء عبر مزود الدفع Tap.',
        },
        {
          h: 'كيف نستخدم البيانات',
          p: 'لتشغيل التطبيق، معالجة الطلبات، الدعم الفني، وتحسين الخدمة. لا نبيع بياناتك لأطراف ثالثة.',
        },
        {
          h: 'مشاركة البيانات',
          p: 'نشارك البيانات الضرورية مع مزودي الدفع والشحن والبائعين لإتمام طلبك فقط.',
        },
        {
          h: 'الأمان',
          p: 'نستخدم اتصالات مشفرة (HTTPS) ونخزّن كلمات المرور بشكل آمن.',
        },
        {
          h: 'حقوقك',
          p: 'يمكنك طلب تحديث أو حذف حسابك عبر support@gmall.sa',
        },
        {
          h: 'التواصل',
          p: 'للاستفسارات: support@gmall.sa',
        },
      ],
    },
    join: {
      label: 'التجار',
      title: 'انضم كتاجر في G-MALL',
      intro:
        'املأ النموذج وسيراجع فريقنا طلبك. بعد الموافقة، يُنشأ حساب مورد ويمكنك إضافة منتجاتك من لوحة المورد.',
      benefits: [
        'وصول لقاعدة عملاء واسعة في المملكة',
        'إدارة منتجاتك من لوحة تحكم سهلة',
        'مراجعة وموافقة سريعة من فريق G-MALL',
        'دعم فني وتسويقي للتجار الشركاء',
      ],
      hasAccount: 'لديك حساب مورد؟',
      formTitle: 'نموذج التسجيل',
      businessName: 'اسم المتجر / النشاط',
      contactName: 'اسم المسؤول',
      email: 'البريد الإلكتروني',
      phone: 'الجوال',
      category: 'فئة النشاط',
      city: 'المدينة',
      commercialRegister: 'السجل التجاري (اختياري)',
      description: 'نبذة عن النشاط',
      descriptionPh: 'وصف مختصر للمتجر والمنتجات...',
      submit: 'إرسال طلب الانضمام',
      submitting: 'جاري الإرسال…',
      selectCategory: 'اختر الفئة',
      successTitle: 'تم إرسال طلبك',
      successBody:
        'شكراً لاهتمامك بالانضمام إلى G-MALL. سيتواصل معك فريقنا بعد مراجعة الطلب.',
      backHome: 'العودة للرئيسية',
      categories: categories.ar,
    },
    account: {
      contracts: {
        label: 'العقود',
        title: 'عقودي',
        subtitle: 'العقود المرتبطة بحسابك',
        empty: 'لا توجد عقود',
        view: 'عرض',
        edit: 'تعديل',
        back: 'رجوع',
        save: 'حفظ',
        titleAr: 'العنوان (AR)',
        terms: 'الشروط والملاحظات',
        status: 'الحالة',
        startDate: 'تاريخ البداية',
        endDate: 'تاريخ النهاية',
        created: 'تاريخ الإنشاء',
        readOnlyNote: 'لتعديل تفاصيل العقد الأساسية تواصل مع الإدارة.',
      },
    },
    admin: adminAr,
    login: {
      back: '← العودة للرئيسية',
      title: 'تسجيل الدخول',
      subtitle: 'بوابة الإدارة والعملاء والموردين',
      signIn: 'دخول',
      register: 'حساب عميل جديد',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submitLogin: 'دخول',
      submitRegister: 'إنشاء حساب',
      loading: 'جاري المعالجة…',
      merchant: 'تاجر؟',
      joinLink: 'انضم كتاجر',
    },
  },
  en: {
    meta: {
      title: 'G-MALL | Shop Saudi Arabia in One App',
      description:
        'G-MALL brings the best stores and brands in Saudi Arabia together. Shop easily, pay securely, and enjoy fast delivery.',
    },
    nav: {
      about: 'About',
      services: 'Services',
      join: 'Join as Merchant',
      contact: 'Contact',
      login: 'Sign in',
      home: 'Home',
    },
    hero: {
      tag: 'Smart shopping • KSA merchants',
      title1: 'Everything you need…',
      title2: 'in one app',
      subtitle:
        'G-MALL brings the best stores and brands in Saudi Arabia together. Shop easily, pay securely, and enjoy fast delivery with daily deals.',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      mockTitle: 'Shop smarter',
      mockDeals: 'Today\'s deals',
      mockCats: ['Fashion', 'Electronics', 'Beauty', 'Home'],
    },
    about: {
      label: 'About us',
      title: 'About G-MALL',
      body: 'G-MALL is a comprehensive shopping app for Saudi Arabia, bringing together merchants nationwide. We offer an easy experience, secure payments, fast delivery, and fresh daily deals.',
      cta: 'Become a partner merchant',
    },
    services: {
      label: 'Services',
      title: 'Why G-MALL?',
      items: features.en,
    },
    merchant: {
      label: 'Merchants',
      title: 'Join as a merchant',
      body: 'Expand your store reach to millions of shoppers across the Kingdom. Register your business and our team will complete your onboarding.',
      cta: 'Submit application',
    },
    download: {
      title: 'Download the app',
      body: 'Coming soon on App Store and Google Play',
    },
    contact: {
      label: 'Contact',
      title: 'Get in touch',
      email: 'Email',
      hours: 'Business hours',
      hoursValue: '9 AM – 6 PM (Sun–Thu)',
    },
    footer: {
      tagline: 'Shop Saudi Arabia in one app',
      login: 'Sign in',
      privacy: 'Privacy policy',
    },
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated: August 2026',
      sections: [
        {
          h: 'Data we collect',
          p: 'Account data (name, email, phone), addresses, order history, and payment details required to complete purchases via Tap Payments.',
        },
        {
          h: 'How we use data',
          p: 'To operate the app, process orders, provide support, and improve the service. We do not sell your data.',
        },
        {
          h: 'Sharing',
          p: 'We share only what is necessary with payment, shipping, and merchant partners to fulfill your order.',
        },
        {
          h: 'Security',
          p: 'We use encrypted connections (HTTPS) and store passwords securely.',
        },
        {
          h: 'Your rights',
          p: 'You may request account updates or deletion via support@gmall.sa',
        },
        {
          h: 'Contact',
          p: 'Questions: support@gmall.sa',
        },
      ],
    },
    join: {
      label: 'Merchants',
      title: 'Join G-MALL as a merchant',
      intro:
        'Fill out the form and our team will review your application. Once approved, a vendor account is created so you can add products from the vendor dashboard.',
      benefits: [
        'Reach a wide customer base across the Kingdom',
        'Manage products from an easy dashboard',
        'Fast review and approval by the G-MALL team',
        'Technical and marketing support for partners',
      ],
      hasAccount: 'Already a vendor?',
      formTitle: 'Registration form',
      businessName: 'Store / business name',
      contactName: 'Contact name',
      email: 'Email',
      phone: 'Mobile',
      category: 'Business category',
      city: 'City',
      commercialRegister: 'Commercial register (optional)',
      description: 'About your business',
      descriptionPh: 'Brief description of your store and products...',
      submit: 'Submit application',
      submitting: 'Submitting…',
      selectCategory: 'Select category',
      successTitle: 'Application submitted',
      successBody:
        'Thank you for your interest in G-MALL. Our team will contact you after reviewing your application.',
      backHome: 'Back to home',
      categories: categories.en,
    },
    account: {
      contracts: {
        label: 'Contracts',
        title: 'My contracts',
        subtitle: 'Contracts linked to your account',
        empty: 'No contracts',
        view: 'View',
        edit: 'Edit',
        back: 'Back',
        save: 'Save',
        titleAr: 'Title (AR)',
        terms: 'Terms & notes',
        status: 'Status',
        startDate: 'Start date',
        endDate: 'End date',
        created: 'Created',
        readOnlyNote: 'Contact admin to change core contract details.',
      },
    },
    admin: adminEn,
    login: {
      back: '← Back to home',
      title: 'Sign in',
      subtitle: 'Portal for admin, customers, and vendors',
      signIn: 'Sign in',
      register: 'New customer account',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      submitLogin: 'Sign in',
      submitRegister: 'Create account',
      loading: 'Please wait…',
      merchant: 'Merchant?',
      joinLink: 'Join as merchant',
    },
  },
} as const;

export type TranslationTree = (typeof translations)[Locale];
