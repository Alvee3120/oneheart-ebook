import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white shadow mb-4">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          OneHeart Ebooks
        </Link>
        <div className="space-x-4 text-sm flex items-center">
          <Link to="/library">My Library</Link>
          <Link to="/cart">
            Cart{itemCount ? ` (${itemCount})` : ""}
          </Link>

          {isAuthenticated ? (
            <>
              <span className="text-slate-600">
                {user?.user?.username || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
