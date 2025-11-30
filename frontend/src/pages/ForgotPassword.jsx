import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordRequestApi } from "../api/authApi";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPasswordRequestApi(identifier);
      const email = res.data?.email;
      setMessage(res.data?.detail || "If an account exists, a code was sent.");
      if (email) {
        // go to reset page with email in query
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 800);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Could not start password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>

        <p className="text-sm text-gray-600 mb-4">
          Enter your <strong>email</strong> or <strong>username</strong> and
          we&apos;ll send a verification code to your email.
        </p>

        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <label className="block mb-4">
          <span className="text-sm">Email or Username</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Send Reset Code"}
        </button>
      </form>
    </div>
  );
}
