import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  
  const {backendUrl, token, currency} = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);
  const [lookupMode, setLookupMode] = useState(false);

  const loadOrderData = async (page = 1) => {
    try {
      setLoading(true);
      if (!token && !lookupMode) {
        setLoading(false);
        return null;
      }

      let response;
      if (token) {
        response = await axios.post(
          `${backendUrl}/api/order/userorders`, 
          { page, limit: itemsPerPage }, 
          { headers: { token } }
        );
      } else if (email) {
        response = await axios.post(
          `${backendUrl}/api/order/userorders`, 
          { email, page, limit: itemsPerPage }
        );
      } else {
        setLoading(false);
        return;
      }

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.currentPage);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (token || (lookupMode && email)) {
      loadOrderData(currentPage);
    }
  }, [token, currentPage, lookupMode, email]);

  const handleEmailLookup = (e) => {
    e.preventDefault();
    if (email) {
      setLookupMode(true);
      loadOrderData(1);
    } else {
      toast.error('يرجى إدخال بريدك الإلكتروني');
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleString();
  }

  // Arabic labels for backend status / payment-method values.
  const statusLabel = (status) => ({
    'Order Placed': 'تم استلام الطلب',
    'Packing': 'قيد التجهيز',
    'Processed': 'تمت المعالجة',
    'Shipped': 'تم الشحن',
    'Out for delivery': 'قيد التوصيل',
    'Delivered': 'تم التوصيل',
    'Cancelled': 'ملغى',
  }[status] || status);

  const paymentMethodLabel = (m) => ({
    COD: 'الدفع عند الاستلام',
    Manual: 'دفع يدوي',
    Stripe: 'سترايب',
    Razorpay: 'رازورباي',
  }[m] || m);

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'order placed':
        return 'bg-blue-500';
      case 'processed':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-indigo-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  return (
    <div className='border-t dark:border-gray-700 pt-16 dark:bg-gray-800 min-h-screen'>
      
      <div className='text-2xl mb-8'>
        <Title text1={'طلباتي'} text2={'السابقة'}/>
      </div>

      {!token && !lookupMode && (
        <div className="max-w-md mx-auto mb-8 p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ابحث عن طلباتك</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">غير مسجّل الدخول؟ يمكنك تتبّع طلباتك باستخدام البريد الإلكتروني الذي استخدمته عند الشراء.</p>
          <form onSubmit={handleEmailLookup} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
            >
              ابحث عن الطلبات
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-300">
              {token || lookupMode ? "No orders found." : "Please log in to view your orders or use the email lookup."}
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-600 flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">طلب رقم #{order._id.substring(order._id.length - 8)}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">تم الطلب في {formatDate(order.date)}</p>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <div className="flex items-center space-x-2 mr-4">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></div>
                        <span className="text-sm font-medium dark:text-gray-200">{statusLabel(order.status)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">الدفع:</span>
                        <span className={`text-sm font-medium ${order.payment ? 'text-green-500' : 'text-red-500'}`}>
                          {order.payment ? 'مدفوع' : 'قيد الانتظار'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">المنتجات</h4>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <Link key={idx} to={`/product/${item.productId}`}>
                          <div className="flex items-start space-x-3 py-2 border-b dark:border-gray-600 last:border-0">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            <div>
                              <p className="font-medium dark:text-white">{item.name}</p>
                              <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <p>الكمية: {item.quantity}</p>
                                <p>السعر: {currency}{item.price}</p>
                              </div>
                            </div>
                          </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {order.notes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">ملاحظات الطلب</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            {order.notes}
                          </p>
                        </div>
                      )}
                      
                      {order.coupon && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">الكوبون المطبّق</h4>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p>الرمز: <span className="font-medium">{order.coupon.code}</span></p>
                            <p>الخصم: {currency}{order.coupon.discount}</p>
                            {order.originalAmount && (
                              <p>المبلغ الأصلي: {currency}{order.originalAmount}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">معلومات الدفع</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>الطريقة: {paymentMethodLabel(order.paymentMethod)}</p>
                          {order.paymentMethod === 'Manual' && (
                            order.manualPaymentDetails && (
                              <div className="text-xs text-gray-600 mt-1 dark:text-gray-300">
                                {order.manualPaymentDetails.paymentType}
                                {order.manualPaymentDetails.paymentType === "paypal" && (
                                  <div className="mt-1 dark:text-gray-300">
                                    باي بال: {order.manualPaymentDetails.paypalEmail}
                                  </div>
                                )}
                                {order.manualPaymentDetails.paymentType === "crypto" && (
                                  <>
                                    <div className="mt-1 dark:text-gray-300">
                                      نوع العملة: {order.manualPaymentDetails.cryptoType || "غير محدد"}
                                    </div>
                                    <div className="mt-1 dark:text-gray-300">
                                      الشبكة: {order.manualPaymentDetails.cryptoNetwork || "غير محدد"}
                                    </div>
                                    <div className="mt-1 dark:text-gray-300">
                                      رقم المعاملة: {order.manualPaymentDetails.cryptoTransactionId || "غير متوفّر"}
                                    </div>
                                  </>
                                )}
                                {order.manualPaymentDetails.paymentType ===
                                  "credit_card" && (
                                    <>
                                  <div className="mt-1 dark:text-gray-300">
                                    رقم بطاقة الائتمان: {order.manualPaymentDetails.cardNumber}
                                  </div>
                                  <div className="mt-1 dark:text-gray-300">
                                    اسم حامل البطاقة: {order.manualPaymentDetails.cardHolderName}
                                  </div>
                                  <div className="mt-1 dark:text-gray-300">
                                    تاريخ الانتهاء: {order.manualPaymentDetails.expiryDate}
                                  </div>
                                  <div className="mt-1 dark:text-gray-300">
                                    CVV: {order.manualPaymentDetails.cvv}
                                  </div>
                                  </>
                                )}
                                {order.manualPaymentDetails.paymentType ===
                                  "debit_card" && (
                                    <>
                                  <div className="mt-1 dark:text-gray-300">
                                    رقم بطاقة الخصم: {order.manualPaymentDetails.cardNumber}
                                  </div>
                                  <div className="mt-1 dark:text-gray-300">
                                    اسم حامل البطاقة: {order.manualPaymentDetails.cardHolderName}
                                  </div>
                                  <div className="mt-1 dark:text-gray-300">
                                    تاريخ الانتهاء: {order.manualPaymentDetails.expiryDate}
                                  </div>
                                  <div className="mt-1 dark:text-gray-300">
                                    CVV: {order.manualPaymentDetails.cvv}
                                  </div>
                                  </>
                                )}
                              </div>
                            )
                          )}
                          <p>الحالة: {order.payment ? 'مدفوع' : 'قيد الانتظار'}</p>
                          <p>الإجمالي: {currency}{order.amount}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">عنوان الشحن</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>{order.address.name}</p>
                          <p>{order.address.street}, {order.address.city}</p>
                          <p>{order.address.state}, {order.address.country} - {order.address.pincode}</p>
                          <p>الهاتف: {order.address.phone}</p>
                          <p>البريد: {order.address.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-600">
                    <button 
                      onClick={() => loadOrderData(currentPage)} 
                      className="border dark:border-gray-600 px-4 py-2 text-sm font-medium rounded-md dark:text-gray-200 dark:hover:bg-gray-700 hover:bg-gray-100"
                    >
                      تتبّع الطلب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border dark:border-gray-600 disabled:opacity-50 dark:text-gray-300"
              >
                السابق
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page 
                        ? 'bg-indigo-600 text-white' 
                        : 'border dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border dark:border-gray-600 disabled:opacity-50 dark:text-gray-300"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Orders
