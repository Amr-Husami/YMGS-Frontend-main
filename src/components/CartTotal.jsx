import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ couponDiscount = 0 }) => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };
  
  // Calculate subtotal (cart amount)
  const subtotal = getCartAmount();
  
  // Calculate total (subtotal + delivery fee - discount)
  const total = subtotal + delivery_fee - couponDiscount;
  
  return (
    <div className='w-full dark:text-gray-200'>
      <div className='text-2xl'>
        <Title text1={'ملخص'} text2={'السلة'}/>
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
            <p>{currency} {formatPrice(subtotal)}</p>
            <p>المجموع الفرعي</p>
        </div>
        <hr className="dark:border-gray-700" />
        <div className='flex justify-between'>
            <p>{currency} {formatPrice(delivery_fee)}</p>
            <p>رسوم الشحن</p>
        </div>
        {couponDiscount > 0 && (
          <>
            <hr className="dark:border-gray-700" />
            <div className="flex justify-between text-green-600">
              <p>-{currency} {formatPrice(couponDiscount)}</p>
              <p>الخصم:</p>
            </div>
          </>
        )}
        <hr className="dark:border-gray-700" />
        <div className='flex justify-between font-bold mt-3 text-lg'>
            <b>{currency} {formatPrice(total > 0 ? total : 0)}</b>
            <b>الإجمالي</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
