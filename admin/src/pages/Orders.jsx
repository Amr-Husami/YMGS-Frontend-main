import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client.js';

// API values stay English (the backend validates against them); only the
// labels shown to the admin are Arabic.
const STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

const statusLabel = {
  'Order Placed': 'تم استلام الطلب',
  Packing: 'قيد التجهيز',
  Shipped: 'تم الشحن',
  'Out for delivery': 'قيد التوصيل',
  Delivered: 'تم التوصيل',
  Cancelled: 'ملغى',
};

const paymentMethodLabel = { COD: 'الدفع عند الاستلام', Manual: 'دفع يدوي' };

const statusColor = {
  'Order Placed': 'bg-gray-100 text-gray-700',
  Packing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  'Out for delivery': 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/order/list');
      setOrders(data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (orderId, status) => {
    const prev = orders;
    setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, status } : o)));
    try {
      await api.put(`/api/order/${orderId}/status`, { status });
      toast.success('تم تحديث الحالة');
    } catch (err) {
      setOrders(prev); // revert on failure
      toast.error(err.response?.data?.message || 'فشل التحديث');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">الطلبات</h2>

      {loading ? (
        <p className="text-gray-400">جارٍ التحميل…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">لا توجد طلبات بعد</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border rounded-lg p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400">#{o._id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(o.date).toLocaleString()} · {paymentMethodLabel[o.paymentMethod] || o.paymentMethod} ·{' '}
                    {o.payment ? 'مدفوع' : 'غير مدفوع'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[o.status] || 'bg-gray-100'}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{statusLabel[s] || s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 border-t pt-3 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">المنتجات</p>
                  <ul className="text-sm space-y-0.5">
                    {(o.items || []).map((it, i) => (
                      <li key={i}>
                        {it.name || it.productId} × {it.quantity}
                        {it.price != null && <span className="text-gray-400"> (${it.price})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm">
                  <p className="text-xs font-medium text-gray-500 mb-1">الإجمالي</p>
                  <p className="font-semibold">${o.amount}</p>
                  {o.address?.email && <p className="text-gray-500 mt-1">{o.address.email}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
