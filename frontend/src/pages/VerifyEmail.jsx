import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmailApi, resendOtpApi } from "../api/authApi";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
  const query = useQuery();
  const initialEmail = query.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await verifyEmailApi(email, code);
      setMessage("Email verified! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
  setResendLoading(true);
  setError("");
  setResendMessage("");

  try {
    const res = await resendOtpApi(email);
    setResendMessage(res.data?.detail || "New code sent to your email.");
  } catch (err) {
    const detail = err.response?.data?.detail;
    setError(detail || "Could not resend code.");
  } finally {
    setResendLoading(false);
  }
};

  return (
    <div className="flex justify-center mt-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4">Verify Your Email</h1>

        <p className="text-sm text-gray-600 mb-4">
          We’ve sent a 6-digit code to your email. Enter it below to activate
          your account.
        </p>

        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {resendMessage && (
  <p className="text-green-600 text-sm mb-2">{resendMessage}</p>
)}


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

        <label className="block mb-4">
          <span className="text-sm">Verification Code</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
       

<button
  type="button"
  onClick={handleResend}
  disabled={resendLoading}
  className="w-full mt-3 border border-slate-900 text-slate-900 py-2 rounded text-sm hover:bg-slate-100 disabled:opacity-60"
>
  {resendLoading ? "Resending..." : "Resend Code"}
</button>

      </form>
    </div>
  );
}
