import { useState } from 'react'
import { toast } from 'react-toastify'

const NewsLetterBox = () => {
    const [email, setEmail] = useState('');

    const onSubmitHandler = (event) => {
        event.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            toast.success('تم الاشتراك بنجاح في النشرة الإخبارية!');
            setEmail('');
        } else {
            toast.error('البريد الإلكتروني غير صحيح. يرجى المحاولة مجدداً.');
        }
    }

    return (
        <section className="py-16 container">
            <div className="bg-accent dark:bg-gray-700 rounded-2xl p-8 md:p-12">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary dark:text-[#02ADEE]">
                        ابقَ على اطلاع مع شفاء
                    </h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        اشترك في نشرتنا الإخبارية واحصل على آخر المنتجات والعروض الخاصة مباشرةً في بريدك الإلكتروني.
                    </p>
                    <form onSubmit={onSubmitHandler} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="أدخل بريدك الإلكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-full border border-gray-200 dark:border-gray-600
                                     bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-yellow-400/20
                                     placeholder-gray-400 dark:placeholder-gray-500 text-right"
                        />
                        <button className="bg-primary dark:bg-[#02ADEE] text-white dark:text-gray-800
                                         px-8 py-3 rounded-full font-medium
                                         hover:bg-primary/90 dark:hover:bg-yellow-500
                                         transition-colors">
                            اشترك
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default NewsLetterBox
