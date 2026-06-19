import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "سارة الأحمد",
      role: "عميلة دائمة",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      stars: 5,
      text: "شفاء أنقذتني في أوقات كثيرة! التوصيل السريع وجودة الأدوية الأصيلة جعلت إدارة صحتي أسهل بكثير. عملية الطلب سلسة جداً وسهلة."
    },
    {
      id: 2,
      name: "محمد الخطيب",
      role: "مشترك شهري",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      stars: 5,
      text: "أقدّر كثيراً الاتساق والموثوقية في شفاء. خدمة الاشتراك الشهري تضمن عدم نفاد أدويتي الدائمة، وخدمة العملاء ممتازة."
    },
    {
      id: 3,
      name: "ريم المصري",
      role: "متخصصة رعاية صحية",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      stars: 4,
      text: "بصفتي عاملة في القطاع الصحي، أنا دقيقة جداً في جودة الأدوية. شفاء تُسلّم منتجات أصيلة دائماً وخدمتها سريعة واحترافية. أنصح بها بشدة!"
    },
    {
      id: 4,
      name: "خالد العمر",
      role: "عميل جديد",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      stars: 5,
      text: "كنت متشككاً في البداية من طلب الأدوية عبر الإنترنت، لكن شفاء فاقت توقعاتي. الأدوية وصلت في الوقت المحدد وكانت بالضبط ما احتجته. سأكرر الطلب!"
    },
    {
      id: 5,
      name: "أميرة حسن",
      role: "كبار السن",
      image: "https://randomuser.me/api/portraits/women/56.jpg",
      stars: 5,
      text: "خدمة التوصيل المنزلي من شفاء نعمة كبيرة لأمثالي من كبار السن. الموصلون مؤدبون جداً والأدوية معبأة بشكل سليم. راضية جداً!"
    }
  ];

  return (
    <section className="py-16 dark:bg-gray-800">
      <div className="container">
        <div className="text-center mb-12">
          <span className="bg-secondary dark:bg-gray-700 text-primary dark:text-green-300 px-4 py-1 rounded-full text-sm font-medium">
            آراء العملاء
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-primary dark:text-[#02ADEE]">
            ماذا يقول عملاؤنا
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            اقرأ آراء عملائنا الراضين الذين يثقون بشفاء لتلبية احتياجاتهم الصحية.
          </p>
        </div>

        <div className="mt-12">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md flex flex-col h-full mx-2 mb-8 text-right">
                  <div className="flex items-center mb-4 flex-row-reverse">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary dark:border-[#02ADEE]"
                    />
                    <div className="mr-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex mb-3 flex-row-reverse">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">{testimonial.text}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
