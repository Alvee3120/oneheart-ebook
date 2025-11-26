// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { loadBooks } from "../features/books/booksSlice";
// import { addToCart } from "../features/cart/cartSlice";
// import { useNavigate } from "react-router-dom";

// export default function Home() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { items, loading, error } = useSelector((state) => state.books);
//   const cartState = useSelector((state) => state.cart);

//   useEffect(() => {
//     dispatch(loadBooks());
//   }, [dispatch]);

//   const handleAddToCart = (e, bookId) => {
//     e.stopPropagation(); // Prevent clicking the card navigation
//     dispatch(addToCart({ bookId, quantity: 1 }));
//   };

//   if (loading) return <div className="p-6">Loading books...</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">All Ebooks</h1>

//       {cartState.error && (
//         <p className="text-red-600 text-sm mb-2">{cartState.error}</p>
//       )}

//       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//         {items.map((book) => (
//           <div
//             key={book.id}
//             onClick={() => navigate(`/books/${book.slug}`)}
//             className="bg-white rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-md transition"
//           >
//             {book.cover_image && (
//               <img
//                 src={book.cover_image}
//                 alt={book.title}
//                 className="h-40 object-cover rounded mb-3"
//               />
//             )}

//             <h2 className="font-semibold mb-1">{book.title}</h2>

//             <p className="text-sm text-slate-600 flex-1">
//               {(book.description || "").slice(0, 80)}...
//             </p>

//             <div className="mt-3 font-bold">
//               {(book.effective_price || book.price) + " " + (book.currency || "BDT")}
//             </div>

//             <button
//               onClick={(e) => handleAddToCart(e, book.id)}
//               className="mt-3 bg-slate-900 text-white text-sm py-1.5 rounded hover:bg-slate-800"
//             >
//               Add to cart
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBooks } from "../features/books/booksSlice";
import { addToCart } from "../features/cart/cartSlice";
import { useNavigate, Link } from "react-router-dom";
import { fetchPosts } from "../api/blogApi";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading: booksLoading, error: booksError } = useSelector(
    (state) => state.books
  );
  const cartState = useSelector((state) => state.cart);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  // Load books (Redux)
  useEffect(() => {
    dispatch(loadBooks());
  }, [dispatch]);

  // Load latest blog posts
  useEffect(() => {
    const load = async () => {
      try {
        setPostsLoading(true);
        setPostsError("");
        const data = await fetchPosts();

        let arr = [];
        if (Array.isArray(data)) {
          arr = data;
        } else if (Array.isArray(data.results)) {
          arr = data.results;
        }

        // show only latest 3 posts on homepage
        setPosts(arr.slice(0, 3));
      } catch (err) {
        console.error(err);
        setPostsError("Failed to load articles.");
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    load();
  }, []);

  const handleAddToCart = (e, bookId) => {
    e.stopPropagation();
    dispatch(addToCart({ bookId, quantity: 1 }));
  };

  const scrollToBooks = () => {
    const el = document.getElementById("books-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/books");
    }
  };

  const mostSelling = items.slice(0, 3);
  const featuredGrid = items.slice(0, 6);

  // helper: detect if book has price or is "coming soon"/"not fixed"
  const getBookStatus = (book) => {
    const price = book.effective_price ?? book.price;
    if (!price) return "no-price"; // use "Coming Soon" / "Not fixed yet" style
    return "priced";
  };

  return (
    <div className="bg-slate-50">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-rose-500 mb-3">
            Boost Your Skills
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Boost Your Skills
            <br />
            Through <span className="text-rose-600">Reading</span>
          </h1>
          <p className="text-slate-600 mb-6 max-w-md">
            Enhance your knowledge and sharpen your abilities with our
            handpicked collection of books. Whether it&apos;s personal
            development, leadership, or creative thinking, each title is here
            to inspire and empower you.
          </p>

          <button
            onClick={scrollToBooks}
            className="inline-flex items-center px-6 py-3 rounded-full bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition"
          >
            Explore
          </button>
        </div>

        {/* Right side hero image – use first book cover if available */}
        <div className="relative flex justify-center">
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-3xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
            {items[0]?.cover_image ? (
              <img
                src={items[0].cover_image}
                alt={items[0].title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center px-6 text-slate-400 text-sm">
                Hero preview will show your first book cover when available.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COMING SOON BANNER */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 h-40 md:h-52 flex items-center justify-center">
          <span className="text-3xl md:text-4xl font-extrabold tracking-[0.3em] text-slate-800">
            COMING&nbsp;SOON
          </span>
        </div>
      </section>

      {/* MOST SELLING BOOKS */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8">
          Our Most Selling Books
        </h2>

        {booksError && (
          <p className="text-center text-red-600 text-sm mb-4">
            {booksError}
          </p>
        )}

        {cartState.error && (
          <p className="text-center text-red-600 text-sm mb-4">
            {cartState.error}
          </p>
        )}

        {booksLoading && mostSelling.length === 0 ? (
          <p className="text-center text-slate-500">Loading books...</p>
        ) : mostSelling.length === 0 ? (
          <p className="text-center text-slate-500">No books available.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {mostSelling.map((book) => {
              const price = book.effective_price ?? book.price;
              const status = getBookStatus(book);

              return (
                <div
                  key={book.id}
                  onClick={() => navigate(`/books/${book.slug}`)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
                >
                  {book.cover_image && (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-52 object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2 text-sm md:text-base line-clamp-2">
                      {book.title}
                    </h3>

                    <div className="mt-auto">
                      {status === "priced" ? (
                        <>
                          <p className="font-bold text-rose-600 text-sm">
                            {price} {book.currency || "TK"}
                          </p>
                          <button
                            onClick={(e) => handleAddToCart(e, book.id)}
                            className="mt-3 w-full bg-rose-600 text-white text-sm py-2 rounded-full hover:bg-rose-700"
                          >
                            Add To Cart
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-amber-600 text-sm">
                            Coming Soon / Not fixed yet
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/books/${book.slug}`);
                            }}
                            className="mt-3 w-full border border-rose-500 text-rose-600 text-sm py-2 rounded-full hover:bg-rose-50"
                          >
                            View Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOOK CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-6">
          Book Categories
        </h2>

        {/* static categories to match design */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {["Education", "Parenting", "Science", "Sports", "Fiction"].map(
            (cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full text-sm font-medium border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                type="button"
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* BOOKS GRID (ALL / FEATURED) */}
        <div id="books-section">
          {booksLoading && featuredGrid.length === 0 ? (
            <p className="text-center text-slate-500">Loading books...</p>
          ) : featuredGrid.length === 0 ? (
            <p className="text-center text-slate-500">No books found.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {featuredGrid.map((book) => {
                const price = book.effective_price ?? book.price;
                const status = getBookStatus(book);

                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/books/${book.slug}`)}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
                  >
                    {book.cover_image && (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-52 object-cover"
                      />
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base line-clamp-2">
                        {book.title}
                      </h3>

                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {(book.description || "").slice(0, 80)}...
                      </p>

                      <div className="mt-auto">
                        {status === "priced" ? (
                          <>
                            <p className="font-bold text-rose-600 text-sm">
                              {price} {book.currency || "TK"}
                            </p>
                            <button
                              onClick={(e) => handleAddToCart(e, book.id)}
                              className="mt-3 w-full bg-rose-600 text-white text-sm py-2 rounded-full hover:bg-rose-700"
                            >
                              Add To Cart
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-amber-600 text-sm">
                              Coming Soon / Not fixed yet
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/books/${book.slug}`);
                              }}
                              className="mt-3 w-full border border-rose-500 text-rose-600 text-sm py-2 rounded-full hover:bg-rose-50"
                            >
                              View Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8">
          Our Latest Articles
        </h2>

        {postsError && (
          <p className="text-center text-red-600 text-sm mb-4">
            {postsError}
          </p>
        )}

        {postsLoading && posts.length === 0 ? (
          <p className="text-center text-slate-500">
            Loading latest articles...
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center text-slate-500">No articles available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                to={`/blog/${post.id}`}
                key={post.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 text-base mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString()
                      : ""}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                    {post.summary}
                  </p>
                  <span className="mt-auto text-rose-600 font-medium text-sm">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
