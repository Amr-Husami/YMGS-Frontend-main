const Feature = () => {
  return (
    <section className="py-12 dark:bg-gray-800">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "أدوية معتمدة",
              description: "جميع الأدوية مصدرها صيدليات مرخصة وموردون معتمدون من وزارة الصحة السورية",
              icon: "💊",
            },
            {
              title: "توصيل سريع",
              description: "توصيل في نفس اليوم متاح للأدوية العاجلة في مناطق الخدمة لدينا",
              icon: "🚚",
            },
            {
              title: "دعم على مدار الساعة",
              description: "فريق دعم العملاء متاح دائماً للإجابة على استفساراتكم واستشاراتكم الدوائية",
              icon: "📞",
            },
            {
              title: "ضمان استرداد المبلغ",
              description: "نضمن استرداد كامل قيمة المنتج إذا لم تكونوا راضين عن جودته",
              icon: "💰",
            },
            {
              title: "شحن آمن ومحكم",
              description: "نضمن توصيل أدويتكم في أفضل حال مع تعبئة آمنة ومحكمة الإغلاق",
              icon: "📦",
            },
            {
              title: "خصومات حصرية",
              description: "عروض خاصة للعملاء الدائمين والطلبات الكبيرة — وفّر أكثر مع كل طلب",
              icon: "🏷️",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-secondary/30 dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-up text-center flex flex-col items-center border border-transparent hover:border-primary/10 dark:hover:border-[#02ADEE]/10"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-display text-xl font-semibold text-primary dark:text-[#02ADEE] mb-3">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-xs mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
