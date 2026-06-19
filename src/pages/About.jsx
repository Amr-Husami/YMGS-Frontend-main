import Title from '../components/Title'
import NewsLetterBox from '../components/NewsLetterBox'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="dark:bg-gray-800">
      <div className='text-2xl text-center pt-8 border-t dark:border-gray-700'>
        <Title text1={'من'} text2={'نحن'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img
          src={assets.about}
          className='w-full md:max-w-[450px] rounded-2xl'
          alt='شفاء'
          loading='eager'
          width='450'
          height='338'
          fetchpriority='high'
          sizes='(max-width: 768px) 100vw, 450px'
        />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 dark:text-gray-300 text-right'>
          <p>مرحباً بكم في شفاء، صيدليتكم الإلكترونية الموثوقة! نُقدّم لكم طريقة سلسة لطلب الأدوية والمستلزمات الطبية عبر الإنترنت، مع ضمان وصول احتياجاتكم الصحية الأساسية بسرعة وسهولة. في شفاء، صحتكم هي أولويتنا القصوى.</p>
          <p>يعمل فريقنا مع صيدليات معتمدة وموردين مرخصين لنقدم لكم مجموعة واسعة من الأدوية والفيتامينات والمستلزمات الصحية. سواء أكانت أدوية بوصفة طبية، أو أدوية دون وصفة، أو مكملات غذائية، نضمن التسليم الآمن والموثوق.</p>
          <b className='text-gray-800 dark:text-gray-100'>رسالتنا</b>
          <p>في شفاء، نلتزم بجعل الرعاية الصحية في متناول الجميع. رسالتنا هي توفير خدمة توصيل أدوية موثوقة وفعّالة، لضمان حصول كل شخص على دوائه المناسب في الوقت المناسب. نحن نجسر الفجوة بين مقدمي الرعاية الصحية والمرضى من خلال حلول تقنية متطورة.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'لماذا'} text2={'تختارنا'} />
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border dark:border-gray-700 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right'>
          <b className="dark:text-gray-100">أدوية أصيلة ومعتمدة</b>
          <p className='text-gray-600 dark:text-gray-300'>نُورد أدويتنا حصراً من صيدليات معتمدة وموردين مرخصين، مع ضمان 100% للجودة والأصالة. صحتكم وسلامتكم هي أولويتنا القصوى.</p>
        </div>

        <div className='border dark:border-gray-700 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right'>
          <b className="dark:text-gray-100">توصيل سريع وموثوق</b>
          <p className='text-gray-600 dark:text-gray-300'>اطلب أدويتك بسهولة واستلمها سريعاً. نُقدّم خيارات التوصيل في نفس اليوم وفي اليوم التالي لضمان حصولكم على دوائكم في الوقت المناسب.</p>
        </div>

        <div className='border dark:border-gray-700 px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right'>
          <b className="dark:text-gray-100">طلب آمن وسهل</b>
          <p className='text-gray-600 dark:text-gray-300'>منصتنا سهلة الاستخدام تُتيح لكم رفع الوصفات الطبية وتتبع الطلبات والاستلام على باب المنزل بسهولة تامة.</p>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  )
}

export default About
