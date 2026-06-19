import { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("manual");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState("");
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const {
    navigate,
    backendUrl,
    token,
    setCartItem,
    getCartAmount,
    delivery_fee,
    getCartItems,
    currency,
  } = useContext(ShopContext);
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
    billingEmail: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZipcode: "",
    billingCountry: "",
    billingPhone: "",
    manualPaymentDetails: {
      paymentType: "",
      cardNumber: "",
      cardHolderName: "",
      expiryDate: "",
      cvv: "",
      paypalEmail: "",
      cryptoTransactionId: "User didn't enter transaction ID",
    },
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [notes, setNotes] = useState("");
  const [availableCryptos, setAvailableCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/address/get`, {
          headers: { token },
        });
        if (data.success) {
          setSavedAddresses(data.addresses);
        } else {
          toast.error(data.message || "Failed to fetch addresses");
        }
      } catch (error) {
        console.log(error);
        toast.error("فشل في جلب العناوين المحفوظة");
      } finally {
        setIsLoading(false);
      }
    };

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

    fetchAddresses();
    fetchCryptoWallets();
  }, [backendUrl, token]);

  const saveNewAddress = async () => {
    try {
      // Validate form data before sending
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

      const { data } = await axios.post(
        `${backendUrl}/api/address/save`,
        {
          address: {firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          country: formData.country,
          phone: formData.phone},
          userId: token, // Add userId to the request body
        },
        {
          headers: { token },
        }
      );

      if (data.success) {
        setSavedAddresses(data.addresses);
        setShowAddressForm(false);
        setSelectedAddress(formData); // Select the newly added address
        toast.success("تم حفظ العنوان بنجاح");
      } else {
        toast.error(data.message || "Failed to save address");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save address");
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
      // If checked, copy delivery address to billing address
      if (showAddressForm) {
        // If using form data
        setFormData(prev => ({
          ...prev,
          billingFirstName: prev.firstName,
          billingLastName: prev.lastName,
          billingEmail: prev.email,
          billingStreet: prev.street,
          billingCity: prev.city,
          billingState: prev.state,
          billingZipcode: prev.zipcode,
          billingCountry: prev.country,
          billingPhone: prev.phone
        }));
      } else if (selectedAddress) {
        // If using selected address
        setFormData(prev => ({
          ...prev,
          billingFirstName: selectedAddress.firstName,
          billingLastName: selectedAddress.lastName,
          billingEmail: selectedAddress.email,
          billingStreet: selectedAddress.street,
          billingCity: selectedAddress.city,
          billingState: selectedAddress.state,
          billingZipcode: selectedAddress.zipcode,
          billingCountry: selectedAddress.country,
          billingPhone: selectedAddress.phone
        }));
      }
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const verifyData = {
            ...response,
            userId: token,
          };
          const { data } = await axios.post(
            backendUrl + "/api/order/verifyRazorpay",
            verifyData,
            { headers: { token } }
          );
          if (data.success) {
            navigate("/orders");
            setCartItem({});
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const copyWalletAddress = (address) => {
    navigator.clipboard.writeText(address || cryptoWalletAddress);
    toast.info("تم نسخ عنوان المحفظة");
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
        cryptoNetwork: ""
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
        cryptoNetwork: network
      }
    }));
  };

  const handleMethodChange = (newMethod, paymentType = "") => {
    if (newMethod !== "stripe") {
      setMethod(newMethod);
      
      if (newMethod !== "manual" || paymentType !== "crypto") {
        setSelectedCrypto("");
        setSelectedNetwork("");
        setSelectedWallet(null);
      }

      // If this is a manual payment method, also set the payment type
      if (newMethod === "manual" && paymentType) {
        setFormData((prev) => ({
          ...prev,
          manualPaymentDetails: {
            ...prev.manualPaymentDetails,
            paymentType: paymentType,
            cryptoType: paymentType === "crypto" ? selectedCrypto : "",
            cryptoNetwork: paymentType === "crypto" ? selectedNetwork : ""
          },
        }));
      }
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
          amount: getCartAmount() // Only apply to cart amount, not delivery fee
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

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!selectedAddress && !showAddressForm) {
      toast.error("يرجى اختيار عنوان أو إضافة عنوان جديد");
      return;
    }

    // Validate billing address if not using same as delivery
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

    try {
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
        phone: formData.phone,
      };

      // Use delivery address as billing if checkbox is checked
      let billingAddress = sameAsDelivery 
        ? (showAddressForm ? address : selectedAddress) 
        : {
            firstName: formData.billingFirstName,
            lastName: formData.billingLastName,
            email: formData.billingEmail,
            street: formData.billingStreet,
            city: formData.billingCity,
            state: formData.billingState,
            zipcode: formData.billingZipcode,
            country: formData.billingCountry,
            phone: formData.billingPhone,
          };

      // Calculate final amount correctly
      const subtotal = getCartAmount();
      const finalAmount = subtotal + delivery_fee - couponDiscount;

      let orderData = {
        address: showAddressForm ? address : selectedAddress,
        billingAddress,
        items: items,
        amount: finalAmount,
        originalAmount: subtotal + delivery_fee,
        notes: notes || "",
        couponCode: couponDiscount > 0 ? couponCode : undefined
      };

      switch (method) {
        case "cod": {
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItem({});
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case "manual": {
          // Validate manual payment details
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

          const response = await axios.post(
            backendUrl + "/api/order/manual",
            {
              ...orderData,
              manualPaymentDetails: formData.manualPaymentDetails,
            },
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItem({});
            toast("تم تقديم الطلب بنجاح. سيتواصل معك أحد ممثّلينا خلال 24 ساعة عبر الهاتف أو البريد الإلكتروني",{
              type: "success",
              autoClose: 5000
            })
            navigate("/orders");
            toast("سيتم تحويلك الآن إلى صفحة المنتجات",{
              type:"info"
            })
            setTimeout(()=>{
              navigate("/products")
            }, 3000)
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case "stripe": {
          const responseStripe = await axios.post(
            backendUrl + "/api/order/stripe",
            orderData,
            { headers: { token } }
          );
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;
        }

        case "razorpay": {
          const responseRazorpay = await axios.post(
            backendUrl + "/api/order/razorpay",
            orderData,
            { headers: { token } }
          );
          if (responseRazorpay.data.success) {
            initPay(responseRazorpay.data.order);
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t dark:border-gray-700 dark:bg-gray-800"
    >
      {/*------------------left side------------------*/}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px] ">
        <div className="text-xl sm:text-2xl my-3 ">
          <Title text1={"معلومات"} text2={"التوصيل"} />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-4 dark:text-gray-300">
            Loading saved addresses...
          </div>
        ) : (
          <>
            {/* Saved Addresses Section */}
            {savedAddresses.length > 0 && !showAddressForm && (
              <div className="flex flex-col gap-3">
                <h3 className="font-medium dark:text-gray-200">
                  Saved Addresses
                </h3>
                {savedAddresses.map((address, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAddress(address)}
                    className={`border p-3 rounded cursor-pointer ${
                      selectedAddress === address
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-600"
                    } dark:text-gray-200 dark:bg-gray-700`}
                  >
                    <p>
                      {address.firstName} {address.lastName}
                    </p>
                    <p>{address.email}</p>
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.zipcode}
                    </p>
                    <p>{address.country}</p>
                    <p>{address.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Button */}
            <button
              type="button"
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-black dark:text-[#02ADEE] underline"
            >
              {showAddressForm ? "العودة إلى العناوين المحفوظة" : "إضافة عنوان جديد"}
            </button>

            {/* Address Form */}
            {showAddressForm && (
              <>
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
                <button
                  type="button"
                  onClick={saveNewAddress}
                  className="bg-black text-white dark:bg-[#02ADEE] dark:text-gray-800 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-yellow-500"
                >
                  حفظ العنوان
                </button>
              </>
            )}

            {/* Same As Delivery Checkbox */}
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

            {/* Billing Address Section */}
            {!sameAsDelivery && (
              <div className="mt-4">
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
          </>
        )}
      </div>
      {/*-------------------right side---------------------- */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal couponDiscount={couponDiscount} />
        </div>
        <div className="mt-12">
          <Title text1={"طريقة"} text2={"الدفع"} />
          {/*------------------payment--------------------*/}
          <div className="flex gap-3 flex-col mt-4">
            {[
              { id: "sham_cash", label: "شام كاش" },
              { id: "syriatel_cash", label: "سيرياتيل كاش" },
              { id: "mtn_cash", label: "MTN كاش" },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => handleMethodChange("manual", m.id)}
                className="flex items-center gap-3 border dark:border-gray-600 p-3 px-3 cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors dark:bg-gray-700"
              >
                <p
                  className={`min-w-3.5 h-3.5 border dark:border-gray-500 rounded-full ${
                    method === "manual" &&
                    formData.manualPaymentDetails.paymentType === m.id
                      ? "bg-green-500"
                      : ""
                  }`}
                ></p>
                <p className="dark:text-gray-200">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Local payment instructions */}
          {method === "manual" && formData.manualPaymentDetails.paymentType && (
            <div className="mt-6 border dark:border-gray-600 p-4 rounded dark:bg-gray-700 space-y-4">
              <h3 className="text-lg font-medium dark:text-gray-200">تفاصيل الدفع</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                أرسل قيمة الطلب عبر{" "}
                <span className="font-semibold">
                  {({ sham_cash: "شام كاش", syriatel_cash: "سيرياتيل كاش", mtn_cash: "MTN كاش" })[formData.manualPaymentDetails.paymentType]}
                </span>{" "}
                إلى الرقم التالي:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="+963953276347"
                  className="flex-1 border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white font-mono text-center"
                />
                <button
                  type="button"
                  onClick={() => copyWalletAddress("+963953276347")}
                  className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded whitespace-nowrap"
                >
                  نسخ
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  رقم عملية التحويل (اختياري)
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manualPaymentDetails: {
                        ...prev.manualPaymentDetails,
                        transactionRef: e.target.value,
                      },
                    }))
                  }
                  className="w-full border dark:border-gray-600 rounded py-2 px-3 dark:bg-gray-800 dark:text-white"
                  placeholder="أدخل رقم عملية التحويل بعد الدفع (اختياري)"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                بعد إرسال المبلغ اضغط «تأكيد الطلب»، وسيتواصل معك فريقنا لتأكيد الدفع.
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              ملاحظات الطلب (اختياري)
            </label>
            <textarea
              value={notes || ""}
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

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white dark:bg-[#02ADEE] dark:text-gray-800 px-16 py-3 text-sm hover:bg-gray-800 dark:hover:bg-yellow-500"
            >
              تأكيد الطلب
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
