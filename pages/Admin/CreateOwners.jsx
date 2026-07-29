import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../lib/AuthContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, UtensilsCrossed, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { host } from "../../lib/Api";

function CreateStaff() {
    const { user, token } = useAuth();
    const isAdmin = user?.role === "admin";


  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(isAdmin ? "owner" : "staff");
  const [restaurantId, setrestaurantId] = useState(user?.restaurantId || "");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  // Fetch restaurants if admin
  useEffect(() => {
    if (!isAdmin) return;
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${host}/api/restaurants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(res.data);
        if (res.data.length) setrestaurantId(res.data[0]._id);
      } catch (err) {
        toast.error("Failed to fetch restaurants    ");
      }
    };
    fetchRestaurants();
  }, [isAdmin, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) return toast.error("Restaurant selection is required");

    try {
      setLoading(true);
      await axios.post(
        `${host}/api/auth/create-staff`,
        { name, email, password, role, restaurantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`);
      navigate(isAdmin ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <UserPlus size={24} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAdmin ? "Create New Staff" : "Add Staff Member"}
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            {isAdmin
              ? "Assign a new staff member to manage a specific restaurant."
              : "Register a new staff account for your restaurant."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <UserPlus size={18} />
              </span>
              <input
                type="text"
                placeholder="Abebe Kebede"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Access Level</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <ShieldCheck size={18} />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none cursor-pointer font-bold text-slate-700"
                >
                  {/* If I am the Super Admin, I only create Owners */}
                  {isAdmin ? (
                    <option value={role}>Owner</option>
                  ) : (
                    /* If I am an Owner, I only create Staff */
                    <option value={role}>Staff</option>
                  )}
                </select>
              </div>
            </div>

            {/* Restaurant Select (Admin Only) */}
            {isAdmin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Assign Restaurant</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UtensilsCrossed size={18} />
                  </span>
                  <select
                    value={restaurantId}
                    onChange={(e) => setrestaurantId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {restaurants.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Processing..." : `Create Staff`}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <Link
            to={isAdmin ? "/admin/restaurant-owners" : `/mystaffs/${restaurantId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Owner Management
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CreateStaff;