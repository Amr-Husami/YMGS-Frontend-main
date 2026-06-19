import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import api from '../api/client.js';

const EMPTY = {
  name: '',
  price: '',
  category: '',
  subCategory: '',
  description: '',
  image: [], // array of uploaded image URLs
  bestseller: false,
  minOrderQuantity: 1,
  stock: 0,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product _id or null (= add)
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/product/user/list', { limit: 100, sortBy: 'date', sortOrder: 'desc' });
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name || '',
      price: p.price ?? '',
      category: p.category || '',
      subCategory: p.subCategory || '',
      description: p.description || '',
      image: Array.isArray(p.image) ? p.image : p.image ? [p.image] : [],
      bestseller: !!p.bestseller,
      minOrderQuantity: p.minOrderQuantity ?? 1,
      stock: p.stock ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        minOrderQuantity: Number(form.minOrderQuantity) || 1,
        stock: Number(form.stock) || 0,
        image: form.image,
      };
      if (editing) {
        await api.put(`/api/product/${editing}`, payload);
        toast.success('تم تحديث المنتج');
      } else {
        await api.post('/api/product/add', payload);
        toast.success('تم إنشاء المنتج');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const { data } = await api.post('/api/product/upload', fd);
      if (!data.success) throw new Error(data.message);
      setForm((prev) => ({ ...prev, image: [...prev.image, ...data.urls] }));
      toast.success(`تم رفع ${data.urls.length} صورة`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الرفع');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({ ...prev, image: prev.image.filter((u) => u !== url) }));
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`حذف "${p.name}"؟`)) return;
    try {
      await api.delete(`/api/product/${p._id}`);
      toast.success('تم حذف المنتج');
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">المنتجات</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} /> إضافة منتج
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-right text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">المنتج</th>
              <th className="px-4 py-3 font-medium">الفئة</th>
              <th className="px-4 py-3 font-medium">السعر</th>
              <th className="px-4 py-3 font-medium">المخزون</th>
              <th className="px-4 py-3 font-medium text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">جارٍ التحميل…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">لا توجد منتجات بعد</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {Array.isArray(p.image) && p.image[0] && (
                        <img src={p.image[0]} alt="" className="w-10 h-10 rounded object-cover bg-gray-100" />
                      )}
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category || '—'}</td>
                  <td className="px-4 py-3">${p.price}</td>
                  <td className="px-4 py-3">{p.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-gray-900" title="تعديل">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 text-gray-500 hover:text-red-600" title="حذف">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold">{editing ? 'تعديل المنتج' : 'إضافة منتج'}</h3>

            <Field label="الاسم" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="السعر ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              <Field label="المخزون" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الفئة" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Field label="الفئة الفرعية" value={form.subCategory} onChange={(v) => setForm({ ...form, subCategory: v })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الصور</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.image.map((url) => (
                  <div key={url} className="relative w-16 h-16">
                    <img src={url} alt="" className="w-16 h-16 rounded object-cover border bg-gray-100" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5"
                      title="إزالة"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border cursor-pointer hover:bg-gray-50">
                <Upload size={16} />
                {uploading ? 'جارٍ الرفع…' : 'رفع من الجهاز'}
                <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <Field label="الحد الأدنى للطلب" type="number" value={form.minOrderQuantity} onChange={(v) => setForm({ ...form, minOrderQuantity: v })} />
              <label className="flex items-center gap-2 text-sm pb-2">
                <input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} />
                الأكثر مبيعاً
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50">
                إلغاء
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">
                {saving ? 'جارٍ الحفظ…' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  );
}
