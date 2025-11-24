// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { getMe, updateMe } from "../api/authApi";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../api/addressesApi";

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]); // always try to keep this an array

  // profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  // address form state
  const emptyAddress = {
    id: null,
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: "Bangladesh",
    is_default: false,
  };

  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // load data on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [meData, addrData] = await Promise.all([
          getMe(),
          fetchAddresses(),
        ]);

        setUser(meData.user);
        setProfile(meData.profile);

        setFirstName(meData.user.first_name || "");
        setLastName(meData.user.last_name || "");
        setPhone(meData.profile.phone || "");
        setPreferredLanguage(meData.profile.preferred_language || "en");

        // ✅ Safely normalize addresses into an array
        let addrList = [];
        if (Array.isArray(addrData)) {
          // direct list
          addrList = addrData;
        } else if (addrData && Array.isArray(addrData.results)) {
          // paginated {count, results, ...}
          addrList = addrData.results;
        } else if (addrData && Array.isArray(addrData.addresses)) {
          // wrapped as {addresses: [...]}
          addrList = addrData.addresses;
        }

        setAddresses(addrList);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        phone,
        preferred_language: preferredLanguage,
      };
      const data = await updateMe(payload);
      setUser(data.user);
      setProfile(data.profile);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setSuccess("");
    setError("");
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      id: address.id,
      full_name: address.full_name || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      postal_code: address.postal_code || "",
      country: address.country || "Bangladesh",
      is_default: address.is_default || false,
    });
    setSuccess("");
    setError("");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        full_name: addressForm.full_name,
        line1: addressForm.line1,
        line2: addressForm.line2,
        city: addressForm.city,
        postal_code: addressForm.postal_code,
        country: addressForm.country,
        is_default: addressForm.is_default,
      };

      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
        setSuccess("Address updated successfully.");
      } else {
        const created = await createAddress(payload);
        setAddresses((prev) => [...prev, created]);
        setSuccess("Address added successfully.");
      }

      setAddressForm(emptyAddress);
      setEditingAddressId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Address deleted.");
    } catch (err) {
      console.error(err);
      setError("Failed to delete address.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        My Account
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile card */}
        <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Profile details
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email (login)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Preferred language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>

        {/* Address card */}
        <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-slate-900">
              Billing addresses
            </h2>
            <button
              type="button"
              onClick={startCreateAddress}
              className="text-sm text-sky-600 hover:underline"
            >
              + Add new
            </button>
          </div>

          {/* Address list */}
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
            {!hasAddresses && (
              <p className="text-sm text-slate-500">
                You haven&apos;t added any addresses yet.
              </p>
            )}
            {hasAddresses &&
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {addr.full_name || "No name"}
                      {addr.is_default && (
                        <span className="ml-2 text-xs text-emerald-600 border border-emerald-200 rounded-full px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                    </div>
                    <div className="text-slate-600">
                      {addr.city} {addr.postal_code && `- ${addr.postal_code}`}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {addr.country || "Bangladesh"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <button
                      type="button"
                      onClick={() => startEditAddress(addr)}
                      className="text-xs text-sky-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Address form */}
          <form
            onSubmit={handleAddressSubmit}
            className="space-y-3 border-t pt-3"
          >
            <h3 className="text-sm font-medium text-slate-900">
              {editingAddressId ? "Edit address" : "Add new address"}
            </h3>

            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Full name
              </label>
              <input
                type="text"
                name="full_name"
                value={addressForm.full_name}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Address line 1
              </label>
              <input
                type="text"
                name="line1"
                value={addressForm.line1}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Address line 2 (optional)
              </label>
              <input
                type="text"
                name="line2"
                value={addressForm.line2}
                onChange={handleAddressChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Postal code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <label className="inline-flex items-center mt-5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={addressForm.is_default}
                  onChange={handleAddressChange}
                  className="mr-2"
                />
                Set as default
              </label>
            </div>

            <button
              type="submit"
              disabled={savingAddress}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {savingAddress
                ? "Saving address..."
                : editingAddressId
                ? "Update address"
                : "Add address"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
