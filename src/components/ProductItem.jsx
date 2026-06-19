import { useContext } from 'react'
import PropTypes from 'prop-types'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id, image, name, price, quantityPriceList}) => {

    const {currency} = useContext(ShopContext);
  
    // Get the lowest price from quantity price list if available
    const getDisplayPrice = () => {
        if (!quantityPriceList) return price;

        try {
            // Parse the quantity price list if it's a string
            const priceList = typeof quantityPriceList === 'string' 
                ? JSON.parse(quantityPriceList) 
                : quantityPriceList;

            if (Array.isArray(priceList) && priceList.length > 0) {
                // Find the lowest price option
                const lowestPriceOption = priceList.reduce((min, current) => 
                    parseFloat(current.price) < parseFloat(min.price) ? current : min
                , priceList[0]);
                
                return `${lowestPriceOption.price} (${lowestPriceOption.quantity} units)`;
            }
        } catch (error) {
            console.error("Error parsing quantity price list:", error);
        }
        
        return price;
    };

    return (
        <Link
            className='group block h-full cursor-pointer'
            to={`/product/${id}`}
        >
            <div className='h-full flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#02ADEE]/40 transition-all duration-300'>
                {/* Image */}
                <div className='relative aspect-square bg-gray-50 dark:bg-gray-700/40 p-4 flex items-center justify-center overflow-hidden'>
                    <img
                        className='max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300'
                        src={image[0]}
                        alt={name}
                        loading='lazy'
                    />
                </div>
                {/* Body */}
                <div className='flex flex-col flex-1 p-3 gap-2'>
                    <p className='text-sm text-gray-700 dark:text-gray-200 leading-snug line-clamp-2 min-h-[2.5rem]'>
                        {name}
                    </p>
                    <div className='mt-auto flex items-center justify-between pt-1'>
                        <span className='text-lg font-bold text-[#02ADEE]'>
                            {currency}{getDisplayPrice()}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

ProductItem.propTypes = {
    id: PropTypes.string.isRequired,
    image: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    quantityPriceList: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
}

export default ProductItem
