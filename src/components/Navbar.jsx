import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import ThemeSwitcher from './ThemeSwitcher';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const { setShowSearch, getTypeOfProductsAddedInCart, navigate, token, setToken, setCartItem } = useContext(ShopContext);
    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItem({})
    }

    return (
        <div className='flex items-center justify-between py-4 px-3 sm:px-5 font-medium bg-[#7ccfff] dark:bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50 transition-colors'>
            <Link to="/" className="font-display text-primary dark:text-[#02ADEE]">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="شفاء" className="w-9 h-9 sm:w-10 sm:h-10" />
                    <span className="text-lg sm:text-2xl md:text-3xl font-bold whitespace-nowrap">شفاء</span>
                </div>
            </Link>

            <ul className='hidden sm:flex gap-3 md:gap-7 text-sm text-gray-700 dark:text-gray-200'>
                <NavLink to='/' className='flex flex-col items-center gap-1 hover:text-primary dark:hover:text-[#02ADEE]'>
                    <p>الرئيسية</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden' />
                </NavLink>

                <NavLink to='/products' className='flex flex-col items-center gap-1 hover:text-primary dark:hover:text-[#02ADEE]'>
                    <p>المنتجات</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden' />
                </NavLink>

                <NavLink to='/orders' className='flex flex-col items-center gap-1 hover:text-primary dark:hover:text-[#02ADEE]'>
                    <p>طلباتي</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden' />
                </NavLink>

                <NavLink to='/blogs' className='flex flex-col items-center gap-1 hover:text-primary dark:hover:text-[#02ADEE]'>
                    <p>المدونة</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden' />
                </NavLink>

                <NavLink to='/contact' className='flex flex-col items-center gap-1 hover:text-primary dark:hover:text-[#02ADEE]'>
                    <p>تواصل معنا</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden' />
                </NavLink>
            </ul>

            <div className='flex items-center gap-2 sm:gap-4 md:gap-6 text-gray-700 dark:text-gray-200'>
                <ThemeSwitcher />
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                    <img onClick={() => { setShowSearch(true); navigate('/products') }} src={assets.search_icon} className='w-5 cursor-pointer dark:invert' alt="بحث" />
                    <div className='group relative'>
                        <img onClick={() => token ? null : navigate('/login')} src={assets.profile_icon} className='w-5 cursor-pointer dark:invert' alt="حسابي" />
                        {token &&
                            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-10'>
                                <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded shadow-lg text-right'>
                                    <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black dark:hover:text-white'>طلباتي</p>
                                    <p onClick={logout} className='cursor-pointer hover:text-black dark:hover:text-white'>تسجيل الخروج</p>
                                </div>
                            </div>}
                    </div>
                    <Link to='/cart' className='relative'>
                        <img src={assets.cart_icon} className='w-5 min-w-5 dark:invert' alt="" />
                        <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black dark:bg-white text-white dark:text-black aspect-square rounded-full text-[8px]'>
                            {getTypeOfProductsAddedInCart()}
                        </p>
                    </Link>
                </div>
                <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden dark:invert ml-1' alt="القائمة"></img>
            </div>

            {/* sidebar menu for small screen */}
            <div className={`fixed top-0 right-0 bottom-0 z-50 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-all duration-300 ${visible ? 'w-full sm:w-64' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600 dark:text-gray-300'>
                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800'>
                        <img className='h-4 rotate-180 dark:invert' src={assets.dropdown_icon} alt="" />
                        <p>رجوع</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' to='/'>الرئيسية</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' to='/products'>المنتجات</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' to='/orders'>طلباتي</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' to='/blogs'>المدونة</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800' to='/contact'>تواصل معنا</NavLink>
                </div>
            </div>
        </div>
    )
}

export default NavBar
