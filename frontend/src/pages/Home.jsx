import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBooks } from "../features/books/booksSlice";
import { addToCart } from "../features/cart/cartSlice";

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.books);
  const cartState = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(loadBooks());
  }, [dispatch]);

  const handleAddToCart = (bookId) => {
    dispatch(addToCart({ bookId, quantity: 1 }));
  };

  if (loading) return <div className="p-6">Loading books...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Ebooks</h1>

      {cartState.error && (
        <p className="text-red-600 text-sm mb-2">{cartState.error}</p>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col"
          >
            {book.cover_image && (
              <img
                src={book.cover_image}
                alt={book.title}
                className="h-40 object-cover rounded mb-3"
              />
            )}
            <h2 className="font-semibold mb-1">{book.title}</h2>
            <p className="text-sm text-slate-600 flex-1">
              {(book.description || "").slice(0, 80)}...
            </p>
            <div className="mt-3 font-bold">
              {(book.effective_price || book.price) + " " + (book.currency || "BDT")}
            </div>
            <button
              onClick={() => handleAddToCart(book.id)}
              className="mt-3 bg-slate-900 text-white text-sm py-1.5 rounded hover:bg-slate-800"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
