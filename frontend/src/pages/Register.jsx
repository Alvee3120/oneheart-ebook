import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice";
import { useNavigate, Navigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4">Create Account</h1>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <label className="block mb-3">
          <span className="text-sm">Username</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm">Email</span>
          <input
            type="email"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}
