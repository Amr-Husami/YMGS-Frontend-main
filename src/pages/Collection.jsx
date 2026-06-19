import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2, X } from 'lucide-react';

const Collection = () => {
  const {
    products,
    search,
    loading,
    pagination,
    setPage,
    filters,
    updateFilters,
    categories,
    subCategories
  } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [subCategoryFilters, setSubCategoryFilters] = useState([]);
  const [sortOption, setSortOption] = useState('relevant');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (filters.category && Array.isArray(filters.category)) {
      setCategoryFilters(filters.category);
    }
    if (filters.subCategory && Array.isArray(filters.subCategory)) {
      setSubCategoryFilters(filters.subCategory);
    }
    if (filters.sortBy === 'price') {
      setSortOption(filters.sortOrder === 'asc' ? 'low-high' : 'high-low');
    } else {
      setSortOption('relevant');
    }
  }, [filters]);

  useEffect(() => {
    if (!initialized) {
      updateFilters({
        category: [],
        subCategory: [],
        sortBy: 'date',
        sortOrder: 'desc',
        search: ''
      });
      setInitialized(true);
    }
  }, [initialized, updateFilters]);

  const handleCategoryToggle = (value) => {
    let newCategories;
    if (categoryFilters.includes(value)) {
      newCategories = categoryFilters.filter(item => item !== value);
    } else {
      newCategories = [...categoryFilters, value];
    }
    setCategoryFilters(newCategories);
    updateFilters({ category: newCategories });
  };

  const handleSubCategoryToggle = (value) => {
    let newSubCategories;
    if (subCategoryFilters.includes(value)) {
      newSubCategories = subCategoryFilters.filter(item => item !== value);
    } else {
      newSubCategories = [...subCategoryFilters, value];
    }
    setSubCategoryFilters(newSubCategories);
    updateFilters({ subCategory: newSubCategories });
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    switch(value) {
      case 'low-high':
        updateFilters({ sortBy: 'price', sortOrder: 'asc' });
        break;
      case 'high-low':
        updateFilters({ sortBy: 'price', sortOrder: 'desc' });
        break;
      default:
        updateFilters({ sortBy: 'date', sortOrder: 'desc' });
        break;
    }
  };

  const clearAllFilters = () => {
    setCategoryFilters([]);
    setSubCategoryFilters([]);
    setSortOption('relevant');
    updateFilters({
      category: [],
      subCategory: [],
      sortBy: 'date',
      sortOrder: 'desc',
      search: ''
    });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = 1;
    let endPage = pagination.pages;

    if (pagination.pages > maxVisibleButtons) {
      const halfVisibleButtons = Math.floor(maxVisibleButtons / 2);
      if (pagination.currentPage <= halfVisibleButtons) {
        endPage = maxVisibleButtons;
      } else if (pagination.currentPage >= pagination.pages - halfVisibleButtons) {
        startPage = pagination.pages - maxVisibleButtons + 1;
      } else {
        startPage = pagination.currentPage - halfVisibleButtons;
        endPage = pagination.currentPage + halfVisibleButtons;
      }
    }

    if (startPage > 1) {
      buttons.push(
        <button key="start" onClick={() => setPage(1)} className="w-8 h-8 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200">1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis-start" className="text-gray-500 dark:text-gray-400 mx-1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded ${pagination.currentPage === i ? 'bg-black text-white dark:bg-[#02ADEE] dark:text-gray-800' : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        buttons.push(<span key="ellipsis-end" className="text-gray-500 dark:text-gray-400 mx-1">...</span>);
      }
      buttons.push(
        <button key="end" onClick={() => setPage(pagination.pages)} className="w-8 h-8 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200">{pagination.pages}</button>
      );
    }

    return buttons;
  };

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t dark:border-gray-700 dark:bg-gray-800'>
      {/* Filter Section */}
      <div className='min-w-60'>
        <div className="flex items-center justify-between mb-4">
          <p onClick={() => setShowFilter(!showFilter)} className='text-xl flex items-center cursor-pointer gap-2 dark:text-gray-200'>
            الفلاتر
            <img
              className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''} dark:invert`}
              src={assets.dropdown_icon}
              alt=""
            />
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center gap-1"
          >
            <X size={14} /> مسح الكل
          </button>
        </div>

        {/* Active filters */}
        {(categoryFilters.length > 0 || subCategoryFilters.length > 0 || search) && (
          <div className="mb-6 text-right">
            <p className="text-sm font-medium mb-2 dark:text-gray-300">الفلاتر النشطة:</p>
            <div className="flex flex-wrap gap-2 justify-end">
              {categoryFilters.map(cat => (
                <span key={cat} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full flex items-center gap-1 dark:text-gray-200">
                  {cat}
                  <button onClick={() => handleCategoryToggle(cat)} className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {subCategoryFilters.map(subCat => (
                <span key={subCat} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full flex items-center gap-1 dark:text-gray-200">
                  {subCat}
                  <button onClick={() => handleSubCategoryToggle(subCat)} className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {search && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full flex items-center gap-1 dark:text-gray-200">
                  بحث: {search}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className={`border border-gray-300 dark:border-gray-700 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block dark:bg-gray-800`}>
          <p className='mb-3 text-sm font-medium dark:text-gray-200 text-right'>الفئات</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700 dark:text-gray-300 text-right'>
            {categories.length === 0 && (
              <p className="text-xs text-gray-400">لا توجد فئات</p>
            )}
            {categories.map(cat => (
              <p key={cat} className='flex gap-2 justify-end'>
                <label className="cursor-pointer">{cat}</label>
                <input
                  className='w-3 accent-gray-700 dark:accent-yellow-400'
                  type='checkbox'
                  value={cat}
                  checked={categoryFilters.includes(cat)}
                  onChange={(e) => handleCategoryToggle(e.target.value)}
                />
              </p>
            ))}
          </div>
        </div>

        {/* Sub-categories */}
        <div className={`border border-gray-300 dark:border-gray-700 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block dark:bg-gray-800`}>
          <p className='mb-3 text-sm font-medium dark:text-gray-200 text-right'>النوع</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700 dark:text-gray-300 text-right'>
            {subCategories.length === 0 && (
              <p className="text-xs text-gray-400">لا توجد أنواع</p>
            )}
            {subCategories.map(sub => (
              <p key={sub} className='flex gap-2 justify-end'>
                <label className="cursor-pointer">{sub}</label>
                <input
                  className='w-3 accent-gray-700 dark:accent-yellow-400'
                  type='checkbox'
                  value={sub}
                  checked={subCategoryFilters.includes(sub)}
                  onChange={(e) => handleSubCategoryToggle(e.target.value)}
                />
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className='flex-1'>
        <div className='flex justify-between items-center text-base sm:text-2xl mb-4'>
          <select
            onChange={(e) => handleSortChange(e.target.value)}
            value={sortOption}
            className='border-2 border-gray-300 dark:border-gray-700 text-sm px-2 dark:bg-gray-800 dark:text-gray-200'
          >
            <option value="relevant">ترتيب حسب: الأحدث</option>
            <option value="low-high">السعر: من الأقل للأعلى</option>
            <option value="high-low">السعر: من الأعلى للأقل</option>
          </select>
          <Title text1={'جميع'} text2={'المنتجات'} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500 dark:text-gray-300" />
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center p-10 text-gray-500 dark:text-gray-300">
                لم يتم العثور على منتجات مطابقة لبحثك.
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
                {products.map((item) => (
                  <div key={item._id} className="w-full flex flex-col">
                    <ProductItem
                      id={item._id}
                      name={item.name}
                      price={item.price}
                      image={item.image}
                      quantityPriceList={item.quantityPriceList}
                    />
                    <Link
                      to={`/product/${item._id}`}
                      className="mt-2 w-full bg-[#02ADEE] text-white px-4 py-2 rounded-full text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#0299d1] transition-colors"
                    >
                      <ShoppingCart size={14} />
                      اشتر الآن
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-10 mb-6 space-x-2">
                <button
                  onClick={() => setPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 border rounded mr-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-1">
                  {renderPaginationButtons()}
                </div>
                <button
                  onClick={() => setPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="p-2 border rounded ml-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 mb-8">
              عرض {products.length > 0 ? ((pagination.currentPage - 1) * pagination.limit) + 1 : 0} - {Math.min(pagination.currentPage * pagination.limit, pagination.total)} من أصل {pagination.total} منتج
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
