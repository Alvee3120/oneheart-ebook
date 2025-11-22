import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadCart,
  updateCartItem,
  removeCartItem,
} from "../features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const handleQuantityChange = (id, quantity) => {
    dispatch(updateCartItem({ id, quantity: Number(quantity) }));
  };

  const handleRemove = (id) => {
    dispatch(removeCartItem(id));
  };

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    ) || 0;

  if (loading && !cart) return <div className="p-6">Loading cart...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      {!cart || cart.items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/" className="text-slate-900 underline">Browse books</Link>
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">
                    {item.book?.title || "Book"}
                  </div>
                  <div className="text-sm text-slate-600">
                    Unit: {item.unit_price} {item.book?.currency || "BDT"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    className="w-16 border rounded px-2 py-1 text-sm"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                  />
                  <div className="font-semibold">
                    {item.subtotal} {item.book?.currency || "BDT"}
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-lg font-semibold">
              Total: {total.toFixed(2)} BDT
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-slate-900 text-white px-4 py-2 rounded text-sm hover:bg-slate-800"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
