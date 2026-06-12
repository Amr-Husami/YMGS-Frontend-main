import { useState, useEffect } from "react";
import {
  ScrollText,
  ShieldCheck,
  Truck,
  CreditCard,
  Scale,
  FileWarning,
  HelpCircle,
  Signature,
  ClipboardCopy,
} from "lucide-react";
import Title from "../components/Title";
import NewsLetterBox from "../components/NewsLetterBox";
import axios from "axios";

const Policy = () => {
  const [contactInfo, setContactInfo] = useState({
    footerEmail: "info@souqalsham.com",
    footerPhone: "+963 11 000 0000",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/order/settings`);

        if (response.data.success) {
          setContactInfo(response.data.settings);
        }
      } catch (error) {
        console.error("Failed to fetch footer information:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);
  const copyToClipboard = () => {
    const text = document.getElementById("terms-content").innerText;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Terms and Conditions copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="min-h-screen">
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={'الشروط'} text2={'والأحكام'} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-right">
          <div className="flex justify-between items-center mb-6 flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              <ScrollText className="text-primary dark:text-[#02ADEE]" size={24} />
              <h2 className="text-xl font-semibold dark:text-gray-200">
                شروط وأحكام سوق الشام
              </h2>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <ClipboardCopy size={16} />
              <span>نسخ</span>
            </button>
          </div>

          <div className="text-gray-600 dark:text-gray-300 space-y-6" id="terms-content">
            <div className="flex gap-4 flex-row-reverse">
              <ShieldCheck className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">١. قبول الشروط</h3>
                <p>باستخدامك خدمات سوق الشام، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق على هذه الشروط، يرجى عدم استخدام خدماتنا.</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <Truck className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">٢. سياسة التوصيل</h3>
                <p>يسعى سوق الشام إلى توصيل الطلبات في المواعيد المحددة. قد تتفاوت أوقات التوصيل حسب الموقع الجغرافي والمخزون المتاح.</p>
                <ul className="list-disc mr-5 mt-2 space-y-1">
                  <li>التوصيل العادي: 5-7 أيام عمل</li>
                  <li>التوصيل السريع: 2-3 أيام عمل (حيث متاح)</li>
                  <li>شحن مجاني للطلبات التي تتجاوز 100$</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <CreditCard className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">٣. الأسعار والدفع</h3>
                <p>جميع الأسعار المدرجة بالدولار الأمريكي (USD). نقبل وسائل الدفع الإلكتروني المتعددة بما فيها البطاقات الائتمانية والتحويل البنكي.</p>
                <p className="mt-2">نحتفظ بحق تعديل الأسعار دون إشعار مسبق. لن يؤثر أي تعديل على الطلبات التي تم تأكيدها مسبقاً.</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <Scale className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">٤. سياسة الإرجاع والاسترداد</h3>
                <p>يمكن إرجاع المنتجات خلال 14 يوماً من الاستلام في الحالات التالية:</p>
                <ul className="list-disc mr-5 mt-2 space-y-1">
                  <li>المنتج وصل تالفاً أو منتهي الصلاحية</li>
                  <li>تم إرسال منتج مختلف عن الطلب</li>
                  <li>جودة المنتج لا تتطابق مع الوصف</li>
                </ul>
                <p className="mt-2">تتم معالجة المبالغ المستردة خلال 7-14 يوم عمل بعد استلام المنتج المُعاد وفحصه.</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <FileWarning className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">٥. إخلاء المسؤولية</h3>
                <p>تقدم سوق الشام معلومات عن المنتجات لأغراض إعلامية عامة فقط. نحرص على دقة المعلومات المقدمة لكن لا نضمن خلوها من الأخطاء في جميع الأحوال.</p>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <HelpCircle className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">٦. خدمة العملاء</h3>
                <p>فريق دعم العملاء متاح من السبت إلى الخميس، 9:00 صباحاً - 9:00 مساءً. يمكنك التواصل معنا عبر:</p>
                <ul className="list-disc mr-5 mt-2 space-y-1">
                  <li>البريد الإلكتروني: {contactInfo.footerEmail}</li>
                  <li>الهاتف: {contactInfo.footerPhone}</li>
                  <li>خدمة الدردشة المباشرة على موقعنا</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <Signature className="text-primary dark:text-[#02ADEE] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">٧. القانون الحاكم</h3>
                <p>تخضع هذه الشروط والأحكام لأحكام القانون السوري النافذ. أي نزاع ينشأ عن هذه الشروط يخضع للاختصاص القضائي للمحاكم السورية.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-gray-700 rounded-lg p-6 border border-amber-100 dark:border-gray-600">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            آخر تحديث: أبريل 2025. تحتفظ سوق الشام بحق تعديل هذه الشروط والأحكام في أي وقت. استمرار استخدامكم لخدماتنا يعني موافقتكم على الشروط المحدّثة.
          </p>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  );
};

export default Policy;
