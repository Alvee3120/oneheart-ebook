import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/authApi";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const initialEmail = query.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(email, code, newPassword);
      setMessage(res.data?.detail || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Could not reset password.");
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
        <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <label className="block mb-3">
          <span className="text-sm">Email</span>
          <input
            type="email"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={!!initialEmail}
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm">Verification Code</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm">New Password</span>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Confirm New Password</span>
          <input
            type="password"
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
