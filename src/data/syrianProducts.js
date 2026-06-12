// منتجات صيدلية الشام السورية — Syrian Pharmacy Products
export const syrianProducts = [
  {
    _id: 'sy-pharm-001',
    name: 'باندول - مسكن الألم 500mg',
    price: 3,
    image: ['https://picsum.photos/seed/panadol/400/400'],
    description: 'باراسيتامول 500mg — مسكن للألم وخافض للحرارة. يُستخدم لتخفيف الصداع والألم الخفيف والمتوسط وارتفاع الحرارة. متوفر في الصيدليات السورية المعتمدة.',
    category: 'أدوية',
    subCategory: 'مسكنات الألم',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-002',
    name: 'فيتامين د3 - 1000 وحدة دولية',
    price: 8,
    image: ['https://picsum.photos/seed/vitamind3/400/400'],
    description: 'فيتامين د3 بجرعة 1000 وحدة دولية لكل كبسولة. ضروري لصحة العظام والمناعة وامتصاص الكالسيوم. موصى به بشكل خاص في سوريا حيث يُعاني كثيرون من نقصه.',
    category: 'فيتامينات ومكملات',
    subCategory: 'فيتامينات',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-003',
    name: 'مغنيسيوم 375mg',
    price: 9,
    image: ['https://picsum.photos/seed/magnesium/400/400'],
    description: 'مغنيسيوم 375mg يومياً — معدن أساسي لوظائف العضلات والأعصاب وتنظيم سكر الدم والضغط. يساعد في تخفيف التشنجات والتعب والإجهاد.',
    category: 'فيتامينات ومكملات',
    subCategory: 'معادن',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-004',
    name: 'أوميغا 3 - زيت السمك',
    price: 12,
    image: ['https://picsum.photos/seed/omega3/400/400'],
    description: 'أوميغا 3 عالي الجودة مستخلص من زيت السمك. يدعم صحة القلب والأوعية الدموية، ويُحسّن وظائف الدماغ ويُقلل الالتهابات. 1000mg لكل كبسولة.',
    category: 'فيتامينات ومكملات',
    subCategory: 'أحماض دهنية',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-005',
    name: 'فيتامين ج 1000mg - تحسين المناعة',
    price: 6,
    image: ['https://picsum.photos/seed/vitaminc/400/400'],
    description: 'فيتامين ج 1000mg بتأثير إطالة. يُعزز جهاز المناعة، ويُساعد في التئام الجروح، ويعمل كمضاد قوي للأكسدة. متوفر بأقراص فوارة ومنتظمة.',
    category: 'فيتامينات ومكملات',
    subCategory: 'فيتامينات',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-006',
    name: 'زنك 50mg',
    price: 5,
    image: ['https://picsum.photos/seed/zinc50/400/400'],
    description: 'زنك 50mg — معدن أساسي يدعم المناعة وصحة الجلد والشعر والأظافر. يُساعد في الشفاء السريع من نزلات البرد والإنفلونزا.',
    category: 'فيتامينات ومكملات',
    subCategory: 'معادن',
    bestseller: false,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-007',
    name: 'كالسيوم + فيتامين د',
    price: 10,
    image: ['https://picsum.photos/seed/calcium/400/400'],
    description: 'كالسيوم 500mg مع فيتامين د3 200 وحدة — مجموعة متكاملة لصحة العظام والأسنان. ضروري للنساء وكبار السن والمراهقين في مرحلة النمو.',
    category: 'فيتامينات ومكملات',
    subCategory: 'معادن',
    bestseller: false,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-008',
    name: 'فيتامين ب12 - 1000 ميكروغرام',
    price: 7,
    image: ['https://picsum.photos/seed/vitaminb12/400/400'],
    description: 'فيتامين ب12 بجرعة 1000 ميكروغرام — ضروري لصحة الجهاز العصبي وإنتاج خلايا الدم الحمراء. يُوصى به بشكل خاص للنباتيين والمسنين.',
    category: 'فيتامينات ومكملات',
    subCategory: 'فيتامينات',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-009',
    name: 'إيبوبروفين 400mg',
    price: 4,
    image: ['https://picsum.photos/seed/ibuprofen/400/400'],
    description: 'إيبوبروفين 400mg — مضاد للالتهابات وخافض للحرارة ومسكن للألم. فعّال لألم الرأس والأسنان وآلام الظهر والمفاصل وآلام الدورة الشهرية.',
    category: 'أدوية',
    subCategory: 'مسكنات الألم',
    bestseller: false,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-010',
    name: 'ملتيفيتامين يومي شامل',
    price: 11,
    image: ['https://picsum.photos/seed/multivitamin/400/400'],
    description: 'مكمل غذائي شامل يحتوي على أكثر من 20 فيتاميناً ومعدناً أساسياً. يدعم الحيوية اليومية وصحة الجهاز المناعي والنشاط العام للجسم.',
    category: 'فيتامينات ومكملات',
    subCategory: 'ملتيفيتامين',
    bestseller: true,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-011',
    name: 'بروبيوتيك - بكتيريا نافعة',
    price: 15,
    image: ['https://picsum.photos/seed/probiotic/400/400'],
    description: 'بروبيوتيك متعدد السلالات يحتوي على 10 مليار وحدة تشكيل مستعمرة. يدعم صحة الجهاز الهضمي ويُحسّن امتصاص المغذيات ويُقوي المناعة.',
    category: 'فيتامينات ومكملات',
    subCategory: 'هضم وأمعاء',
    bestseller: false,
    minOrderQuantity: 1,
    quantityPriceList: []
  },
  {
    _id: 'sy-pharm-012',
    name: 'حمض الفوليك 400 ميكروغرام',
    price: 5,
    image: ['https://picsum.photos/seed/folicacid/400/400'],
    description: 'حمض الفوليك 400 ميكروغرام — ضروري لصحة الخلايا والحمل. يُقلل خطر عيوب الأنبوب العصبي ويدعم إنتاج خلايا الدم الحمراء.',
    category: 'فيتامينات ومكملات',
    subCategory: 'فيتامينات',
    bestseller: false,
    minOrderQuantity: 1,
    quantityPriceList: []
  }
];

export default syrianProducts;
