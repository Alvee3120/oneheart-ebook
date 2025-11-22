import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadCart } from "../features/cart/cartSlice";
import { getAddressesApi } from "../api/addressesApi";
import { applyCouponApi } from "../api/couponsApi";
import { checkoutApi } from "../api/ordersApi";

export default function CheckoutPage() {
  const [payerNumber, setPayerNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [billingAddressId, setBillingAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("manual_bkash");
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(loadCart());
    (async () => {
      try {
        const res = await getAddressesApi();
const list = res.data.results ?? res.data;   // handle paginated or plain
setAddresses(list);

if (Array.isArray(list) && list.length > 0) {
  setBillingAddressId(list[0].id);
}
      } catch (err) {
        console.error(err);
      }
    })();
  }, [dispatch, isAuthenticated, navigate]);

  const cartTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    );
  }, [cart]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setError("");
    try {
      const res = await applyCouponApi(couponCode, cartTotal);
      setCouponInfo(res.data);
    } catch (err) {
      setCouponInfo(null);
      setError(err.response?.data?.detail || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
  billing_address_id: billingAddressId,
  payment_method: paymentMethod,
  payer_number: payerNumber,
  transaction_id: transactionId,
  customer_note: customerNote,
};
if (couponCode) {
  payload.coupon_code = couponCode;
}
const res = await checkoutApi(payload);

      // res.data is order
      // After manual checkout: show simple message, redirect to orders or home
      navigate("/library"); // user will wait for admin to approve payment
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const finalAmount =
  Number(couponInfo?.final_amount ?? cartTotal) || 0;


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order summary */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <ul className="space-y-2">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.book?.title} × {item.quantity}
                </span>
                <span>{item.subtotal} BDT</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-sm flex justify-between">
            <span>Subtotal</span>
            <span>{cartTotal.toFixed(2)} BDT</span>
          </div>
          {couponInfo && (
            <>
              <div className="text-sm flex justify-between text-green-700">
                <span>Discount</span>
                <span>-{couponInfo.discount_amount} BDT</span>
              </div>
              <div className="text-sm flex justify-between font-semibold">
                <span>Total after coupon</span>
                <span>{couponInfo.final_amount} BDT</span>
              </div>
            </>
          )}
          {!couponInfo && (
            <div className="text-sm flex justify-between font-semibold mt-1">
              <span>Total</span>
              <span>{cartTotal.toFixed(2)} BDT</span>
            </div>
          )}
        </div>

        {/* Right side: address, coupon, payment */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Billing Address</h2>
            {!Array.isArray(addresses) || addresses.length === 0 ? (
  <p className="text-sm text-slate-600">
    No address yet. (Later we can add address form here.)
  </p>
) : (
  <select
    className="w-full border rounded px-2 py-1 text-sm"
    value={billingAddressId || ""}
    onChange={(e) => setBillingAddressId(Number(e.target.value))}
  >
    {addresses.map((addr) => (
      <option key={addr.id} value={addr.id}>
        {addr.full_name} – {addr.city}, {addr.country}
      </option>
    ))}
  </select>
)}

          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Coupon</h2>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode}
                className="text-sm bg-slate-900 text-white px-3 py-1 rounded disabled:opacity-60"
              >
                {couponLoading ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponInfo && (
              <p className="text-xs text-green-700 mt-1">
                Coupon applied. New total: {couponInfo.final_amount} BDT
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
  <h2 className="font-semibold mb-2">Payment (Manual)</h2>
  <p className="text-xs text-slate-600 mb-2">
    Send <strong>{finalAmount.toFixed(2)} BDT</strong> to:
    <br />
    bKash: <strong>01XXXXXXXXX</strong>
    <br />
    Nagad: <strong>01YYYYYYYYY</strong>
  </p>

  <div className="space-y-1 text-sm mb-3">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="payment_method"
        value="manual_bkash"
        checked={paymentMethod === "manual_bkash"}
        onChange={(e) => setPaymentMethod(e.target.value)}
      />
      <span>Manual bKash</span>
    </label>
    <label className="flex items-center gap-2">
      <input
        type="radio"
        name="payment_method"
        value="manual_nagad"
        checked={paymentMethod === "manual_nagad"}
        onChange={(e) => setPaymentMethod(e.target.value)}
      />
      <span>Manual Nagad</span>
    </label>
  </div>

  <div className="mb-2">
    <label className="block text-xs mb-1">Your bKash/Nagad Number</label>
    <input
      className="w-full border rounded px-2 py-1 text-sm"
      value={payerNumber}
      onChange={(e) => setPayerNumber(e.target.value)}
      placeholder="01XXXXXXXXX"
    />
  </div>

  <div className="mb-2">
    <label className="block text-xs mb-1">Transaction ID</label>
    <input
      className="w-full border rounded px-2 py-1 text-sm"
      value={transactionId}
      onChange={(e) => setTransactionId(e.target.value)}
      placeholder="e.g. BKA12345XYZ"
    />
  </div>

  <div className="mb-3">
    <label className="block text-xs mb-1">Note (optional)</label>
    <textarea
      className="w-full border rounded px-2 py-1 text-xs"
      rows={2}
      value={customerNote}
      onChange={(e) => setCustomerNote(e.target.value)}
      placeholder="Any extra info for admin"
    />
  </div>

  <button
    onClick={handleCheckout}
    disabled={loading}
    className="w-full bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-60"
  >
    {loading ? "Placing order..." : "Place order"}
  </button>
</div>

        </div>
      </div>
    </div>
  );
}
