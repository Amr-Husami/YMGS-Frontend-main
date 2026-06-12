import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import PropTypes from 'prop-types';
import { syrianProducts } from '../data/syrianProducts';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 5;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch]= useState(false);
    const [cartItems, setCartItem] = useState({});
    const [featuredProducts, setFeaturedProducts] = useState(syrianProducts.filter(p => p.bestseller));
    const [products, setProducts] = useState(syrianProducts);
    const [loading, setLoading] = useState(false);
    const [productsPagination, setProductsPagination] = useState({
        total: syrianProducts.length,
        pages: 1,
        currentPage: 1,
        limit: 20
    });
    const [filters, setFilters] = useState({
        category: [],
        subCategory: [],
        search: '',
        sortBy: 'date',
        sortOrder: 'desc'
    });
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    // Function to update filters and fetch products
    const updateFilters = (newFilters) => {
        const updatedFilters = {
            ...filters,
            ...newFilters
        };

        setFilters(updatedFilters);

        setProductsPagination(prev => ({
            ...prev,
            currentPage: 1
        }));

        fetchProductsWithCurrentFilters(updatedFilters);
    };

    // Filter static products locally
    const filterStaticProducts = (currentFilters) => {
        let filtered = [...syrianProducts];

        if (currentFilters.category && currentFilters.category.length > 0) {
            filtered = filtered.filter(p => currentFilters.category.includes(p.category));
        }

        if (currentFilters.subCategory && currentFilters.subCategory.length > 0) {
            filtered = filtered.filter(p => currentFilters.subCategory.includes(p.subCategory));
        }

        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        if (currentFilters.sortBy === 'price') {
            filtered.sort((a, b) =>
                currentFilters.sortOrder === 'asc'
                    ? a.price - b.price
                    : b.price - a.price
            );
        }

        return filtered;
    };

    const fetchProductsWithCurrentFilters = async (currentFilters) => {
        try {
            setLoading(true);
            if (!backendUrl) {
                const filtered = filterStaticProducts(currentFilters);
                setProducts(filtered);
                setProductsPagination({
                    total: filtered.length,
                    pages: 1,
                    currentPage: 1,
                    limit: 20
                });
                return;
            }
            const response = await axios.post(backendUrl + '/api/product/user/list', {
                page: 1,
                limit: productsPagination.limit,
                ...currentFilters,
                search: currentFilters.search || search
            });

            if (response.data.success && response.data.products.length > 0) {
                setProducts(response.data.products);
                setProductsPagination({
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages,
                    currentPage: response.data.pagination.currentPage,
                    limit: response.data.pagination.limit
                });
            } else {
                const filtered = filterStaticProducts(currentFilters);
                setProducts(filtered);
                setProductsPagination({
                    total: filtered.length,
                    pages: 1,
                    currentPage: 1,
                    limit: 20
                });
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            const filtered = filterStaticProducts(currentFilters);
            setProducts(filtered);
            setProductsPagination({
                total: filtered.length,
                pages: 1,
                currentPage: 1,
                limit: 20
            });
        } finally {
            setLoading(false);
        }
    };

    const setPage = (page) => {
        if (page < 1 || page > productsPagination.pages) return;

        const newPage = parseInt(page);

        setProductsPagination(prev => ({
            ...prev,
            currentPage: newPage
        }));

        fetchProductsForPage(newPage);
    };

    const fetchProductsForPage = async (page) => {
        try {
            setLoading(true);
            if (!backendUrl) {
                setLoading(false);
                return;
            }
            const response = await axios.post(backendUrl + '/api/product/user/list', {
                page: page,
                limit: productsPagination.limit,
                ...filters,
                search: filters.search || search
            });

            if (response.data.success) {
                setProducts(response.data.products);
                setProductsPagination({
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages,
                    currentPage: response.data.pagination.currentPage,
                    limit: response.data.pagination.limit
                });
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (itemId, itemData) => {
        const cartData = typeof itemData === 'number' ? {
            quantity: itemData,
            selectedPrice: null,
            isPackage: false
        } : itemData;

        if (!cartData || typeof cartData !== 'object') {
            console.error('Invalid cart data');
            return;
        }

        if (!cartData.quantity || isNaN(cartData.quantity)) {
            cartData.quantity = 1;
        }

        const product = products.find(p => p._id === itemId) || syrianProducts.find(p => p._id === itemId);
        if (!product) {
            console.error('Product not found');
            return;
        }

        if (!cartData.isPackage) {
            const minQuantity = product.minOrderQuantity || 1;
            if (cartData.quantity < minQuantity) {
                toast.error(`الحد الأدنى للطلب لهذا المنتج هو ${minQuantity}`);
                cartData.quantity = minQuantity;
            }
        }

        try {
            let newCartItems = structuredClone(cartItems);
            newCartItems[itemId] = cartData;
            setCartItem(newCartItems);
            toast.success('تمت إضافة المنتج إلى السلة');

            if(token && backendUrl){
                await axios.post(backendUrl + '/api/cart/add', {
                    itemId,
                    cartData
                }, {
                    headers: {token}
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error.message || 'خطأ في إضافة المنتج إلى السلة');
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        Object.values(cartItems).forEach(item => {
            if (!item) return;

            if (typeof item === 'object' && item.quantity > 0) {
                totalCount += item.quantity;
            } else if (typeof item === 'number' && item > 0) {
                totalCount += item;
            }
        });
        return totalCount;
    }

    const getTypeOfProductsAddedInCart = () => {
        return Object.keys(cartItems).filter(itemId => {
          const item = cartItems[itemId];
          if (!item) return false;

          const quantity = typeof item === 'object' ? item.quantity : item;
          return quantity > 0;
        }).length;
      }

    const updateQuantity = async (itemId, itemData) => {
        try {
            const cartData = typeof itemData === 'number' ? {
                quantity: itemData,
                selectedPrice: null,
                isPackage: false
            } : itemData;

            if (!cartData || typeof cartData !== 'object') {
                console.error('Invalid cart data');
                return;
            }

            if (!cartData.quantity || cartData.quantity === 0) {
                let newCartItems = structuredClone(cartItems);
                delete newCartItems[itemId];
                setCartItem(newCartItems);

                if (token && backendUrl) {
                    await axios.post(backendUrl + '/api/cart/update', {
                        itemId,
                        cartData: { quantity: 0 }
                    }, {
                        headers: {token}
                    });
                }
                return;
            }

            const product = products.find(p => p._id === itemId) || syrianProducts.find(p => p._id === itemId);
            if (!product) {
                console.error('Product not found');
                return;
            }

            if (!cartData.isPackage) {
                const minQuantity = product.minOrderQuantity || 1;
                if (cartData.quantity < minQuantity) {
                    toast.error(`الحد الأدنى للطلب لهذا المنتج هو ${minQuantity}`);
                    cartData.quantity = minQuantity;
                }
            }

            let newCartItems = structuredClone(cartItems);
            newCartItems[itemId] = cartData;
            setCartItem(newCartItems);

            if (token && backendUrl) {
                await axios.post(backendUrl + '/api/cart/update', {
                    itemId,
                    cartData
                }, {
                    headers: {token}
                });
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error(error.message || 'خطأ في تحديث الكمية');
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for(const itemId in cartItems){
            const item = cartItems[itemId];
            if (!item) continue;

            if (typeof item === 'object' && item.isPackage && item.selectedPrice) {
                totalAmount += parseFloat(item.selectedPrice);
            } else {
                const quantity = typeof item === 'object' ? item.quantity : item;
                if (quantity <= 0) continue;

                const product = products.find((p) => p._id === itemId) || syrianProducts.find((p) => p._id === itemId);
                const price = product ? parseFloat(product.price) : 0;
                totalAmount += price * quantity;
            }
        }
        return Math.round(totalAmount * 100) / 100;
    }

    const getItemTotal = (itemId) => {
        const item = cartItems[itemId];
        if (!item) return 0;

        if (typeof item === 'object' && item.isPackage && item.selectedPrice) {
            return parseFloat(item.selectedPrice);
        } else {
            const quantity = typeof item === 'object' ? item.quantity : item;
            const product = products.find((p) => p._id === itemId) || syrianProducts.find((p) => p._id === itemId);
            const price = product ? parseFloat(product.price) : 0;
            return price * quantity;
        }
    }

    const getProductsData = async (initialLoad = false) => {
        try {
            setLoading(true);

            if (!backendUrl) {
                if (initialLoad) {
                    setFeaturedProducts(syrianProducts.filter(p => p.bestseller));
                } else {
                    setProducts(syrianProducts);
                }
                setLoading(false);
                return;
            }

            if (initialLoad) {
                try {
                    const featuredResponse = await axios.post(backendUrl + '/api/product/user/list', {
                        limit: 10,
                        bestseller: true,
                        sortBy: 'date',
                        sortOrder: 'desc'
                    });

                    if (featuredResponse.data.success && featuredResponse.data.products.length > 0) {
                        setFeaturedProducts(featuredResponse.data.products);
                    }
                    // else keep the static syrian products (already set as initial state)
                } catch {
                    // Keep static Syrian products on error
                }
                setLoading(false);
                return;
            }

            try {
                const response = await axios.post(backendUrl + '/api/product/user/list', {
                    page: productsPagination.currentPage,
                    limit: productsPagination.limit,
                    ...filters,
                    search: filters.search || search
                });

                if (response.data.success && response.data.products.length > 0) {
                    setProducts(response.data.products);
                    setProductsPagination({
                        total: response.data.pagination.total,
                        pages: response.data.pagination.pages,
                        currentPage: response.data.pagination.currentPage,
                        limit: response.data.pagination.limit
                    });
                } else {
                    setProducts(syrianProducts);
                }
            } catch {
                setProducts(syrianProducts);
            }
        } catch (error) {
            console.log(error);
            setProducts(syrianProducts);
            setFeaturedProducts(syrianProducts.filter(p => p.bestseller));
        } finally {
            setLoading(false);
        }
    };

    const getProductById = async (productId) => {
        // First check static Syrian products
        const staticProduct = syrianProducts.find(p => p._id === productId);
        if (staticProduct) return staticProduct;

        try {
            setLoading(true);
            if (!backendUrl) return null;
            const response = await axios.get(`${backendUrl}/api/product/${productId}`);
            if (response.data.success) {
                return response.data.product;
            } else {
                toast.error(response.data.message);
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    const getRelatedProducts = async (category, subCategory, excludeId, limit = 5) => {
        // First try static Syrian products
        const staticRelated = syrianProducts
            .filter(p => p._id !== excludeId && (p.category === category || p.subCategory === subCategory))
            .slice(0, limit);

        if (!backendUrl) return staticRelated;

        try {
            setLoading(true);
            const response = await axios.post(backendUrl + '/api/product/user/list', {
                category,
                subCategory,
                excludeId,
                limit,
                sortBy: 'date',
                sortOrder: 'desc'
            });

            if (response.data.success && response.data.products.length > 0) {
                return response.data.products;
            } else {
                return staticRelated;
            }
        } catch (error) {
            console.log(error);
            return staticRelated;
        } finally {
            setLoading(false);
        }
    }

    const getUserCart = async (token) => {
        try {
            if (!backendUrl) return;
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers:{token}});
            if (response.data.success) {
                const cartData = response.data.cartData || {};

                Object.entries(cartData).forEach(([itemId, item]) => {
                    if (item === null || item === undefined) {
                        delete cartData[itemId];
                        return;
                    }

                    if (typeof item === 'number') {
                        cartData[itemId] = {
                            quantity: item,
                            selectedPrice: null,
                            isPackage: false
                        };
                    } else if (typeof item === 'object') {
                        if (!Object.prototype.hasOwnProperty.call(item, 'quantity')) item.quantity = 1;
                        if (!Object.prototype.hasOwnProperty.call(item, 'selectedPrice')) item.selectedPrice = null;
                        if (!Object.prototype.hasOwnProperty.call(item, 'isPackage')) item.isPackage = false;
                    }
                });

                setCartItem(cartData);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getCartItems = () => {
        const items = [];
        const allProducts = [...products, ...syrianProducts];
        for(const itemId in cartItems) {
            const item = cartItems[itemId];
            if (!item) continue;

            const product = allProducts.find(p => p._id === itemId);
            if (!product) continue;

            const quantity = typeof item === 'object' ? item.quantity : item;
            if (quantity <= 0) continue;

            const price = typeof item === 'object' && item.selectedPrice
                ? item.selectedPrice
                : product.price;

            items.push({
                _id: itemId,
                name: product.name,
                price: price,
                image: product.image[0],
                quantity: quantity,
                isPackage: typeof item === 'object' ? item.isPackage : false
            });
        }
        return items;
    }

    useEffect(() => {
        getProductsData(true);
    }, []);

    useEffect(() => {
        if (showSearch || (filters.category.length > 0) || (filters.subCategory.length > 0) ||
            filters.search || productsPagination.currentPage > 1) {
            getProductsData();
        }
    }, [filters, productsPagination.currentPage, showSearch]);

    useEffect(() => {
        if (showSearch) {
            updateFilters({ search });
        }
    }, [search, showSearch]);

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'));
            getUserCart(localStorage.getItem('token'));
        }
    }, []);

    const value = {
        products, featuredProducts, loading, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItem,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token, getCartItems, getItemTotal,
        filters, updateFilters,
        pagination: productsPagination,
        setPage,
        getProductById,
        getRelatedProducts,
        getTypeOfProductsAddedInCart
    }

    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

ShopContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default ShopContextProvider;
