import { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import axios from "axios";
import { toast } from "react-toastify";

const GuestCheckout = () => {
  const [method, setMethod] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState("");
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const { navigate, backendUrl, setCartItem, getCartAmount, delivery_fee, getCartItems, currency } = useContext(ShopContext);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
    billingFirstName: "",
    billingLastName: "",
    billingالبريد: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZipcode: "",
    billingCountry: "",
    billingالهاتف: "",
    manualPaymentDetails: {
      paymentType: "",
      cardNumber: "",
      cardHolderName: "",
      expiryDate: "",
      cvv: "",
      paypalالبريد: "",
      cryptoTransactionId: "User didn't enter transaction ID",
    },
  });

  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [availableCryptos, setAvailableCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    const fetchCryptoWallets = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/order/crypto-wallets");
        if (response.data.success) {
          setAvailableCryptos(response.data.wallets);
        }
      } catch (error) {
        console.error("Error fetching crypto wallets:", error);
      }
    };

    fetchCryptoWallets();
  }, [backendUrl]);

  const copyWalletAddress = (address) => {
    navigator.clipboard.writeText(address || cryptoWalletAddress);
    toast.info("تم نسخ عنوان المحفظة");
  };

  const handleMethodChange = (newMethod, paymentType = "") => {
    setMethod(newMethod);

    if (newMethod !== "manual" || paymentType !== "crypto") {
      setSelectedCrypto("");
      setSelectedNetwork("");
      setSelectedWallet(null);
    }

    if (newMethod === "manual" && paymentType) {
      setFormData((prev) => ({
        ...prev,
        manualPaymentDetails: {
          ...prev.manualPaymentDetails,
          paymentType: paymentType,
          cryptoType: paymentType === "crypto" ? selectedCrypto : "",
          cryptoالشبكة: paymentType === "crypto" ? selectedNetwork : ""
        },
      }));
    }
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleSameAsDeliveryChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsDelivery(isChecked);
    
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        billingFirstName: prev.firstName,
        billingLastName: prev.lastName,
        billingالبريد: prev.email,
        billingStreet: prev.street,
        billingCity: prev.city,
        billingState: prev.state,
        billingZipcode: prev.zipcode,
        billingCountry: prev.country,
        billingالهاتف: prev.phone
      }));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      setCouponError("");
      setCouponSuccess("");

      const response = await axios.post(
        backendUrl + "/api/order/verify-coupon",
        {
          couponCode,
          amount: getCartAmount()
        }
      );

      if (response.data.success) {
        setCouponDiscount(response.data.couponDetails.discount);
        setCouponSuccess(`Coupon applied! You saved ${currency}${response.data.couponDetails.discount.toFixed(2)}`);
      } else {
        setCouponError(response.data.message);
        setCouponDiscount(0);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Failed to apply coupon. Please try again.");
      setCouponDiscount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCryptoChange = (cryptoType) => {
    setSelectedCrypto(cryptoType);
    setSelectedNetwork("");
    setSelectedWallet(null);
    
    setFormData((prev) => ({
      ...prev,
      manualPaymentDetails: {
        ...prev.manualPaymentDetails,
        cryptoType: cryptoType,
        cryptoالشبكة: ""
      }
    }));
  };

  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
    
    const wallet = availableCryptos.find(
      w => w.cryptoType === selectedCrypto && w.network === network
    );
    
    setSelectedWallet(wallet || null);
    if (wallet) {
      setCryptoWalletAddress(wallet.walletAddress);
    }
    
    setFormData((prev) => ({
      ...prev,
      manualPaymentDetails: {
        ...prev.manualPaymentDetails,
        cryptoالشبكة: network
      }
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zipcode ||
      !formData.country ||
      !formData.phone
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!sameAsDelivery) {
      if (
        !formData.billingFirstName ||
        !formData.billingLastName ||
        !formData.billingEmail ||
        !formData.billingStreet ||
        !formData.billingCity ||
        !formData.billingState ||
        !formData.billingZipcode ||
        !formData.billingCountry ||
        !formData.billingPhone
      ) {
        toast.error("يرجى ملء جميع حقول عنوان الفوترة المطلوبة");
        return;
      }
    }

    if (method === "manual") {
      if (!formData.manualPaymentDetails?.paymentType) {
        toast.error("يرجى اختيار طريقة الدفع");
        return;
      }

      if (
        formData.manualPaymentDetails.paymentType === "paypal" &&
        !formData.manualPaymentDetails.paypalEmail
      ) {
        toast.error("يرجى إدخال بريد باي بال الإلكتروني");
        return;
      }

      if (
        ["credit_card", "debit_card"].includes(
          formData.manualPaymentDetails.paymentType
        )
      ) {
        if (
          !formData.manualPaymentDetails.cardNumber ||
          !formData.manualPaymentDetails.cardHolderName ||
          !formData.manualPaymentDetails.expiryDate ||
          !formData.manualPaymentDetails.cvv
        ) {
          toast.error("يرجى ملء جميع بيانات البطاقة");
          return;
        }
      }
    }

    try {
      setIsLoading(true);
      const items = getCartItems();
      let address = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        phone: formData.phone
      };

      let billingAddress = sameAsDelivery 
        ? address 
        : {
            firstName: formData.billingFirstName,
            lastName: formData.billingLastName,
            email: formData.billingEmail,
            street: formData.billingStreet,
            city: formData.billingCity,
            state: formData.billingState,
            zipcode: formData.billingZipcode,
            country: formData.billingCountry,
            phone: formData.billingPhone
          };

      const subtotal = getCartAmount();
      const finalAmount = subtotal + delivery_fee - couponDiscount;

      const orderData = {
        address: address,
        billingAddress: billingAddress,
        items: items,
        amount: finalAmount,
        originalAmount: subtotal + delivery_fee,
        isGuest: true,
        notes: notes,
        couponالرمز: couponDiscount > 0 ? couponCode : undefined,
        manualPaymentDetails: method === "manual" ? {
          ...formData.manualPaymentDetails,
          cryptoType: selectedCrypto,
          cryptoالشبكة: selectedNetwork
        } : undefined
      };

      const response = await axios.post(
        backendUrl + "/api/order/guest",
        orderData
      );
      
      if (response.data.success) {
        setCartItem({});
        toast("تم تقديم الطلب بنجاح. سيتواصل معك أحد ممثّلينا خلال 24 ساعة عبر الهاتف أو البريد الإلكتروني",{
          type: "success",
          autoClose: 5000
        })
        toast("سيتم تحويلك الآن إلى صفحة المنتجات",{
          type:"info"
        })
        setTimeout(()=>{
          navigate("/products")
        }, 3000)
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"الدفع"} text2={"كزائر"} />
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          املأ بياناتك أدناه لإتمام طلبك دون إنشاء حساب.
        </p>
        
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="الاسم الأول"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="اسم العائلة"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="البريد الإلكتروني"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="الشارع"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="المدينة"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="المحافظة"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="الرمز البريدي"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="الدولة"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="رقم الهاتف"
        />

        <div className="mt-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="sameAsDelivery"
              checked={sameAsDelivery}
              onChange={handleSameAsDeliveryChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="sameAsDelivery"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              عنوان الفوترة نفس عنوان التوصيل
            </label>
          </div>
        </div>

        {!sameAsDelivery && (
          <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
            <div className="text-xl sm:text-2xl my-3">
              <Title text1={"معلومات"} text2={"الفوترة"} />
            </div>
            <div className="flex gap-3">
              <input
                required
                onChange={onChangeHandler}
                name="billingFirstName"
                value={formData.billingFirstName}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="الاسم الأول"
              />
              <input
                required
                onChange={onChangeHandler}
                name="billingLastName"
                value={formData.billingLastName}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="اسم العائلة"
              />
            </div>
            <input
              required
              onChange={onChangeHandler}
              name="billingEmail"
              value={formData.billingEmail}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
              type="email"
              placeholder="البريد الإلكتروني"
            />
            <input
              required
              onChange={onChangeHandler}
              name="billingStreet"
              value={formData.billingStreet}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="الشارع"
            />
            <div className="flex gap-3">
              <input
                required
                onChange={onChangeHandler}
                name="billingCity"
                value={formData.billingCity}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="المدينة"
              />
              <input
                required
                onChange={onChangeHandler}
                name="billingState"
                value={formData.billingState}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="المحافظة"
              />
            </div>
            <div className="flex gap-3">
              <input
                required
                onChange={onChangeHandler}
                name="billingZipcode"
                value={formData.billingZipcode}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
                type="number"
                placeholder="الرمز البريدي"
              />
              <input
                required
                onChange={onChangeHandler}
                name="billingCountry"
                value={formData.billingCountry}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="الدولة"
              />
            </div>
            <input
              required
              onChange={onChangeHandler}
              name="billingPhone"
              value={formData.billingPhone}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1.5 px-3.5 w-full"
              type="number"
              placeholder="رقم الهاتف"
            />
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            ملاحظات الطلب (اختياري)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
            placeholder="أضف أي تعليمات أو ملاحظات خاصة لطلبك"
            rows="3"
          ></textarea>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            تطبيق الكوبون
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-grow border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
              placeholder="أدخل رمز الكوبون"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={isApplyingCoupon}
              className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded"
            >
              {isApplyingCoupon ? "جارٍ التطبيق..." : "تطبيق"}
            </button>
          </div>
          {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
          {couponSuccess && <p className="text-green-500 text-sm mt-1">{couponSuccess}</p>}
          
          {couponDiscount > 0 && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 dark:text-green-100 text-green-700 rounded">
              <p>تم تطبيق الخصم: {currency} {couponDiscount.toFixed(2)}</p>
              <p>الإجمالي الجديد: {currency} {(getCartAmount() + delivery_fee - couponDiscount).toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal couponDiscount={couponDiscount} />
        </div>
        <div className="mt-12">
          <Title text1={"طريقة"} text2={"الدفع"} />
          
          <div className="flex gap-3 flex-col mt-4">
            <div
              onClick={() => handleMethodChange("manual", "paypal")}
              className="flex items-center gap-3 border dark:border-gray-600 p-2 px-3 cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors dark:bg-gray-700"
            >
              <p
                className={`min-w-3.5 h-3.5 border dark:border-gray-500 rounded-full ${
                  method === "manual" &&
                  formData.manualPaymentDetails.paymentType === "paypal"
                    ? "bg-green-500"
                    : ""
                }`}
              ></p>
              <p className="dark:text-gray-200">باي بال</p>
            </div>

            <div
              onClick={() => handleMethodChange("manual", "credit_card")}
              className="flex items-center gap-3 border dark:border-gray-600 p-2 px-3 cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors dark:bg-gray-700"
            >
              <p
                className={`min-w-3.5 h-3.5 border dark:border-gray-500 rounded-full ${
                  method === "manual" &&
                  ["credit_card", "debit_card"].includes(
                    formData.manualPaymentDetails.paymentType
                  )
                    ? "bg-green-500"
                    : ""
                }`}
              ></p>
              <p className="dark:text-gray-200">بطاقة ائتمان/خصم</p>
            </div>

            <div
              onClick={() => handleMethodChange("manual", "crypto")}
              className="flex items-center gap-3 border dark:border-gray-600 p-2 px-3 cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors dark:bg-gray-700"
            >
              <p
                className={`min-w-3.5 h-3.5 border dark:border-gray-500 rounded-full ${
                  method === "manual" &&
                  formData.manualPaymentDetails.paymentType === "crypto"
                    ? "bg-green-500"
                    : ""
                }`}
              ></p>
              <p className="dark:text-gray-200">عملات رقمية</p>
            </div>

            <div 
            onClick={() => handleMethodChange("manual", "western_union")}
            className="flex items-center gap-3 border dark:border-gray-600 p-2 px-3 cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors dark:bg-gray-700">
            <p
                className={`min-w-3.5 h-3.5 border dark:border-gray-500 rounded-full ${
                  method === "manual" &&
                  formData.manualPaymentDetails.paymentType === "western_union"
                    ? "bg-green-500"
                    : ""
                }`}
              ></p>
              <p className="dark:text-gray-200">ويسترن يونيون</p>
              <img
                className="h-5 mx-4"
                src={assets.western_union}
                alt="Western Union"
              />
            </div>
          </div>

          {method === "manual" && formData.manualPaymentDetails.paymentType !== "western_union" && (
            <div className="mt-6 border dark:border-gray-600 p-4 rounded dark:bg-gray-700">
              <h3 className="text-lg font-medium mb-4 dark:text-gray-200">
                تفاصيل الدفع
              </h3>

              {formData.manualPaymentDetails?.paymentType === "paypal" && (
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    بريد باي بال الإلكتروني
                  </label>
                  <input
                    type="email"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        manualPaymentDetails: {
                          ...prev.manualPaymentDetails,
                          paypalالبريد: e.target.value,
                        },
                      }))
                    }
                    className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                    placeholder="بريد باي بال الإلكتروني"
                  />
                </div>
              )}

              {formData.manualPaymentDetails?.paymentType &&
                ["credit_card", "debit_card"].includes(
                  formData.manualPaymentDetails.paymentType
                ) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        نوع الدفع
                      </label>
                      <select
                        required
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            manualPaymentDetails: {
                              ...prev.manualPaymentDetails,
                              paymentType: e.target.value,
                            },
                          }))
                        }
                        className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">اختر طريقة الدفع</option>
                        <option value="credit_card">بطاقة ائتمان</option>
                        <option value="debit_card">بطاقة خصم</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        رقم البطاقة
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            manualPaymentDetails: {
                              ...prev.manualPaymentDetails,
                              cardNumber: e.target.value,
                            },
                          }))
                        }
                        className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                        placeholder="رقم البطاقة"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        اسم حامل البطاقة
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            manualPaymentDetails: {
                              ...prev.manualPaymentDetails,
                              cardHolderName: e.target.value,
                            },
                          }))
                        }
                        className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                        placeholder="اسم حامل البطاقة"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                          تاريخ الانتهاء
                        </label>
                        <input
                          type="text"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              manualPaymentDetails: {
                                ...prev.manualPaymentDetails,
                                expiryDate: e.target.value,
                              },
                            }))
                          }
                          className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                          CVV
                        </label>
                        <input
                          type="text"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              manualPaymentDetails: {
                                ...prev.manualPaymentDetails,
                                cvv: e.target.value,
                              },
                            }))
                          }
                          className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                          placeholder="رمز التحقق"
                        />
                      </div>
                    </div>
                  </div>
                )}

              {formData.manualPaymentDetails?.paymentType === "crypto" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                      اختر العملة الرقمية
                    </label>
                    <select
                      value={selectedCrypto}
                      onChange={(e) => handleCryptoChange(e.target.value)}
                      className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">اختر عملة رقمية</option>
                      {[...new Set(availableCryptos.map(wallet => wallet.cryptoType))].map(crypto => (
                        <option key={crypto} value={crypto}>
                          {crypto}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedCrypto && (
                    <div>
                      <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        اختر الشبكة
                      </label>
                      <select
                        value={selectedNetwork}
                        onChange={(e) => handleNetworkChange(e.target.value)}
                        className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">اختر الشبكة</option>
                        {availableCryptos
                          .filter(wallet => wallet.cryptoType === selectedCrypto)
                          .map(wallet => (
                            <option key={wallet.network} value={wallet.network}>
                              {wallet.network}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                  
                  {selectedWallet && (
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                      أرسل الدفعة إلى عنوان المحفظة هذا:
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                          value={selectedWallet.walletAddress}
                        readOnly
                        className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                          onClick={() => copyWalletAddress(selectedWallet.walletAddress)}
                        className="bg-gray-200 dark:bg-gray-600 px-4 py-2 ml-2 rounded"
                      >
                        نسخ
                      </button>
                    </div>
                      
                      <div className="mt-4 flex justify-center">
                        <img 
                          src={selectedWallet.qrCodeImage} 
                          alt={`${selectedCrypto} ${selectedNetwork} QR Code`} 
                          className="w-48 h-48 object-contain border dark:border-gray-600 p-2"
                        />
                      </div>
                      
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        بعد إرسال الدفعة، يمكنك إدخال رقم المعاملة أدناه (اختياري)
                    </p>
                  </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                      رقم المعاملة (اختياري)
                    </label>
                    <input
                      type="text"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          manualPaymentDetails: {
                            ...prev.manualPaymentDetails,
                            cryptoTransactionId: e.target.value,
                          },
                        }))
                      }
                      className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                      placeholder="أدخل رقم المعاملة (اختياري)"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="text-center my-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              لديك حساب بالفعل؟ سجّل الدخول
            </button>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white dark:bg-[#02ADEE] dark:text-gray-800 px-16 py-3 text-sm hover:bg-gray-800 dark:hover:bg-yellow-500 disabled:opacity-70"
            >
              {isLoading ? "PROCESSING..." : "تأكيد الطلب"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default GuestCheckout; 