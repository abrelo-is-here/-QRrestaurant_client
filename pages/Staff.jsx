import React, { useState } from "react";
import axios from "axios";
import { UserPlus, Loader2, Mail, User, Lock, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { host } from "../lib/Api";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

function CreateStaff() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    restaurantId: user?.restaurantId || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createStaff = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(`${host}/api/staff`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Staff created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "staff",
        restaurantId: user?.restaurantId || "",
      });
      navigate(`/mystaffs/${user?.restaurantId}`);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 sm:p-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-100 p-4 rounded-2xl mb-4 shadow-inner">
            <UserPlus className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Add New Staff
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Create an account for your restaurant employee
          </p>
        </div>

        <form onSubmit={createStaff} className="space-y-5">
          {/* Name Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Staff full name"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Staff email address"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Secure password"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
              required
            />
          </div>

          {/* Role (Disabled) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value="Role: Staff"
              disabled
              className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {loading ? "Creating..." : "Create Staff Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateStaff;